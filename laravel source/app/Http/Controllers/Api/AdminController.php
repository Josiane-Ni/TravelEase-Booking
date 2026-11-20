<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FlightResource;
use App\Http\Resources\UserResource;
use App\Models\AgentCommission;
use App\Models\Airline;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\CancellationRequest;
use App\Models\CorporateClient;
use App\Models\Flight;
use App\Models\FraudFlag;
use App\Models\Hotel;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\User;
use App\Services\AuditService;
use App\Services\AdminNotificationService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function users(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate(['search' => 'nullable|string|max:100']);

        return UserResource::collection(User::when($data['search'] ?? null, fn ($q, $s) => $q->where(fn ($q) => $q->where('name', 'like', '%'.$s.'%')->orWhere('email', 'like', '%'.$s.'%')))->latest()->paginate(20));
    }

    public function updateUser(Request $request, User $user): UserResource
    {
        $data = $request->validate(['role' => 'required|in:customer,agent,admin', 'status' => 'required|in:active,inactive']);
        abort_if($user->id === $request->user()->id, 422, 'You cannot change your own role or account status.');
        DB::transaction(function () use ($request, $user, $data): void {
            User::where('role', 'admin')->orderBy('id')->lockForUpdate()->get();
            $user->forceFill($data)->save();
            if ($data['status'] === 'inactive') {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }
            AuditService::record($request->user()->id, 'user.access_updated', 'user', $user->id, $data);
        });

        return new UserResource($user);
    }

    public function flights(): AnonymousResourceCollection
    {
        return FlightResource::collection(Flight::with('airline', 'classes')->latest()->paginate(20));
    }

    public function airline(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|min:2|max:3|uppercase|unique:airlines,code',
            'logo_path' => 'nullable|string',
        ]);
        $airline = Airline::create($data);
        AuditService::record($request->user()->id, 'airline.created', 'airline', $airline->id);

        return response()->json(['data' => $airline], 201);
    }

    public function audit(): JsonResponse
    {
        return response()->json(['data' => AuditLog::latest()->paginate(30)]);
    }

    public function clients(Request $request): JsonResponse
    {
        return response()->json(['data' => CorporateClient::where('agent_id', $request->user()->id)->latest()->paginate(20)]);
    }

    public function saveClient(Request $request, ?CorporateClient $client = null): JsonResponse
    {
        if ($client) {
            abort_unless($client->agent_id === $request->user()->id, 403);
        }
        $data = $request->validate(['name' => 'required|string|max:150', 'contact_email' => 'required|email|max:255', 'phone' => 'nullable|string|max:30']);
        $client ??= new CorporateClient;
        $isNew = ! $client->exists;
        $client->fill($data);
        $client->agent_id = $request->user()->id;
        $client->save();
        AuditService::record($request->user()->id, 'client.saved', 'corporate_client', $client->id);

        if ($request->user()->role === 'agent') {
            AdminNotificationService::notifyAdmins(
                'Corporate Client ' . ($isNew ? 'Added' : 'Updated'),
                'Travel Agent ' . $request->user()->name . ' (' . $request->user()->email . ') ' . ($isNew ? 'registered a new' : 'updated') . ' corporate client "' . $client->name . '".',
                'agent',
                '/admin/users',
                ['client_id' => $client->id, 'agent_id' => $request->user()->id]
            );
        }

        return response()->json(['data' => $client]);
    }

    public function testNotification(Request $request): JsonResponse
    {
        AdminNotificationService::notifyAdmins(
            'New Flight Booking Confirmed (BK-DEMO88)',
            'Customer Josiane Nikuze (josianenikuze45@gmail.com) booked Flight WB-102 (Kigali -> Nairobi) for $450.00.',
            'booking',
            '/admin/dashboard',
            ['test' => true, 'timestamp' => now()->toIso8601String()]
        );

        return response()->json(['message' => 'Demonstration admin notification dispatched successfully.']);
    }

    public function export(Request $request): StreamedResponse
    {
        $data = $request->validate([
            'days' => 'nullable|in:30,90,365',
            'status' => 'nullable|in:confirmed,cancelled,pending',
            'service_type' => 'nullable|in:flight,hotel,package',
        ]);
        AuditService::record($request->user()->id, 'report.exported_csv', 'bookings', null, $data);
        $query = Booking::where('created_at', '>=', now()->subDays((int) ($data['days'] ?? 30)))
            ->when($data['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($data['service_type'] ?? null, fn ($q, $t) => $q->where('type', $t))
            ->with('payment', 'refund');

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Reference', 'Service Type', 'Status', 'Destination', 'Travel UTC', 'Subtotal USD cents', 'Discount cents', 'Tax cents', 'Total USD cents', 'Paid cents', 'Refund cents', 'Net cents'], ',', '"', '');
            foreach ($query->cursor() as $b) {
                $destination = preg_match('/^[=+@-]/', $b->destination) ? "'".$b->destination : $b->destination;
                $paid = $b->payment?->status === 'successful' ? $b->payment->amount_minor : 0;
                $refunded = $b->refund?->amount_minor ?? 0;
                fputcsv($out, [
                    $b->reference,
                    $b->type,
                    $b->status,
                    $destination,
                    $b->travel_at->toIso8601String(),
                    $b->subtotal_minor,
                    $b->discount_minor,
                    $b->tax_minor,
                    $b->total_minor,
                    $paid,
                    $refunded,
                    $paid - $refunded,
                ], ',', '"', '');
            } fclose($out);
        }, 'travelease-bookings.csv', ['Content-Type' => 'text/csv']);
    }

    public function reportsOverview(Request $request): JsonResponse
    {
        $days = (int) $request->input('days', 30);
        $start = now()->subDays($days);

        $bookings = Booking::where('created_at', '>=', $start);
        $payments = Payment::where('created_at', '>=', $start)->where('status', 'successful');
        $refunds = Refund::where('created_at', '>=', $start)->where('status', 'completed');

        $gross = (int) (clone $payments)->sum('amount_minor');
        $refundTotal = (int) (clone $refunds)->sum('amount_minor');
        $fees = (int) CancellationRequest::where('created_at', '>=', $start)->sum('fee_minor');

        $metrics = [
            'total_bookings' => (clone $bookings)->count(),
            'flight_bookings' => (clone $bookings)->where('type', 'flight')->count(),
            'hotel_bookings' => (clone $bookings)->where('type', 'hotel')->count(),
            'package_bookings' => (clone $bookings)->where('type', 'package')->count(),
            'cancellations' => (clone $bookings)->where('status', 'cancelled')->count(),
            'gross_revenue_minor' => $gross,
            'refunds_minor' => $refundTotal,
            'cancellation_fees_minor' => $fees,
            'net_revenue_minor' => $gross - $refundTotal,
            'fraud_flags_pending' => FraudFlag::where('status', 'pending')->count(),
            'agent_commissions_minor' => (int) AgentCommission::where('created_at', '>=', $start)->sum('amount_minor'),
        ];

        // Flight seat occupancy
        $flights = Flight::with(['airline', 'classes.seats'])->limit(8)->get()->map(function ($f) {
            $totalSeats = $f->classes->sum(fn ($c) => $c->seats->count());
            $bookedSeats = $f->classes->sum(fn ($c) => $c->seats->whereNotNull('booking_id')->count());
            $pct = $totalSeats > 0 ? round(($bookedSeats / $totalSeats) * 100, 1) : 0;
            return [
                'flight_number' => $f->flight_number,
                'airline' => $f->airline->name,
                'origin' => $f->origin,
                'destination' => $f->destination,
                'departure_at' => $f->departure_at->format('M d, H:i'),
                'total_seats' => $totalSeats,
                'booked_seats' => $bookedSeats,
                'utilization_pct' => $pct,
            ];
        });

        // Hotel room occupancy
        $hotels = Hotel::with('roomTypes')->limit(8)->get()->map(function ($h) {
            $totalRooms = $h->roomTypes->sum('total_rooms');
            $bookedCount = DB::table('booking_rooms')
                ->join('room_types', 'booking_rooms.room_type_id', '=', 'room_types.id')
                ->where('room_types.hotel_id', $h->id)
                ->sum('booking_rooms.quantity');
            $pct = $totalRooms > 0 ? round(($bookedCount / ($totalRooms * 10)) * 100, 1) : 0;
            return [
                'name' => $h->name,
                'city' => $h->city,
                'stars' => $h->stars,
                'total_rooms' => $totalRooms,
                'booked_rooms' => (int) $bookedCount,
                'occupancy_pct' => min(100, $pct),
            ];
        });

        // Destinations
        $destinations = (clone $bookings)
            ->select('destination', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_minor) as revenue_minor'))
            ->groupBy('destination')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        return response()->json([
            'data' => [
                'metrics' => $metrics,
                'flight_occupancy' => $flights,
                'hotel_occupancy' => $hotels,
                'destinations' => $destinations,
            ],
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $days = (int) $request->input('days', 30);
        $start = now()->subDays($days);

        $bookings = Booking::where('created_at', '>=', $start);
        $payments = Payment::where('created_at', '>=', $start)->where('status', 'successful');
        $refunds = Refund::where('created_at', '>=', $start)->where('status', 'completed');

        $gross = (int) (clone $payments)->sum('amount_minor');
        $refundTotal = (int) (clone $refunds)->sum('amount_minor');
        $fees = (int) CancellationRequest::where('created_at', '>=', $start)->sum('fee_minor');

        $metrics = [
            'total_bookings' => (clone $bookings)->count(),
            'flight_bookings' => (clone $bookings)->where('type', 'flight')->count(),
            'hotel_bookings' => (clone $bookings)->where('type', 'hotel')->count(),
            'package_bookings' => (clone $bookings)->where('type', 'package')->count(),
            'cancellations' => (clone $bookings)->where('status', 'cancelled')->count(),
            'gross_revenue_minor' => $gross,
            'refunds_minor' => $refundTotal,
            'cancellation_fees_minor' => $fees,
            'net_revenue_minor' => $gross - $refundTotal,
            'fraud_flags_pending' => FraudFlag::where('status', 'pending')->count(),
            'agent_commissions_minor' => (int) AgentCommission::where('created_at', '>=', $start)->sum('amount_minor'),
        ];

        $flightOccupancy = Flight::with(['airline', 'classes.seats'])->limit(8)->get()->map(function ($f) {
            $totalSeats = $f->classes->sum(fn ($c) => $c->seats->count());
            $bookedSeats = $f->classes->sum(fn ($c) => $c->seats->whereNotNull('booking_id')->count());
            $pct = $totalSeats > 0 ? round(($bookedSeats / $totalSeats) * 100, 1) : 0;
            return [
                'flight_number' => $f->flight_number,
                'airline' => $f->airline->name,
                'origin' => $f->origin,
                'destination' => $f->destination,
                'departure_at' => $f->departure_at->format('M d, H:i'),
                'total_seats' => $totalSeats,
                'booked_seats' => $bookedSeats,
                'utilization_pct' => $pct,
            ];
        });

        $hotelOccupancy = Hotel::with('roomTypes')->limit(8)->get()->map(function ($h) {
            $totalRooms = $h->roomTypes->sum('total_rooms');
            $bookedCount = DB::table('booking_rooms')
                ->join('room_types', 'booking_rooms.room_type_id', '=', 'room_types.id')
                ->where('room_types.hotel_id', $h->id)
                ->sum('booking_rooms.quantity');
            $pct = $totalRooms > 0 ? round(($bookedCount / ($totalRooms * 10)) * 100, 1) : 0;
            return [
                'name' => $h->name,
                'city' => $h->city,
                'stars' => $h->stars,
                'total_rooms' => $totalRooms,
                'booked_rooms' => (int) $bookedCount,
                'occupancy_pct' => min(100, $pct),
            ];
        });

        $destinations = (clone $bookings)
            ->select('destination', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_minor) as revenue_minor'))
            ->groupBy('destination')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        AuditService::record($request->user()->id, 'report.exported_pdf', 'analytics', null, ['days' => $days]);

        return Pdf::loadView('report', [
            'days' => $days,
            'metrics' => $metrics,
            'flightOccupancy' => $flightOccupancy,
            'hotelOccupancy' => $hotelOccupancy,
            'destinations' => $destinations,
        ])->download('TravelEase-Analytics-Report.pdf');
    }
}
