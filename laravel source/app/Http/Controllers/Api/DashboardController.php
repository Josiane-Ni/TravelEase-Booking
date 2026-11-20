<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\AgentCommission;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\CorporateClient;
use App\Models\Flight;
use App\Models\FraudFlag;
use App\Models\Hotel;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Promotion;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function customer(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = $user->bookings();
        $metrics = [
            'total_bookings' => (clone $query)->count(),
            'upcoming_trips' => (clone $query)->where('status', 'confirmed')->where('travel_at', '>', now())->count(),
            'completed_trips' => (clone $query)->where('status', 'confirmed')->where('travel_at', '<=', now())->count(),
            'pending_payments' => (clone $query)->where('status', 'pending')->count(),
            'cancelled_bookings' => (clone $query)->where('status', 'cancelled')->count(),
            'pending_refunds' => Refund::whereHas('booking', fn ($q) => $q->where('user_id', $user->id))->where('status', 'pending')->count(),
            'total_spent_minor' => (int) Payment::where('user_id', $user->id)->where('status', 'successful')->sum('amount_minor'),
        ];

        return response()->json([
            'data' => [
                'metrics' => $metrics,
                'wallet' => $user->wallet,
                'loyalty' => $user->loyaltyAccount,
                'upcoming' => BookingResource::collection((clone $query)->where('status', 'confirmed')->where('travel_at', '>', now())->with('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents')->orderBy('travel_at')->limit(6)->get()),
                'recent_bookings' => BookingResource::collection((clone $query)->with('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents')->latest()->limit(15)->get()),
                'transactions' => $user->wallet ? $user->wallet->transactions()->latest()->limit(8)->get() : [],
                'notifications' => $user->notifications()->latest()->limit(6)->get(),
                'unread_count' => $user->unreadNotifications()->count(),
                'top_destinations' => Flight::with('airline')->where('departure_at', '>', now())->limit(4)->get(),
            ],
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        $data = $request->validate(['days' => 'nullable|in:30,90,365']);
        $days = (int) ($data['days'] ?? 30);
        $start = now()->subDays($days);
        $b = Booking::where('created_at', '>=', $start);
        $p = Payment::where('created_at', '>=', $start)->where('status', 'successful');
        $r = Refund::where('created_at', '>=', $start)->where('status', 'completed');

        // Flight seat occupancy
        $flights = Flight::with(['airline', 'classes.seats'])->limit(6)->get()->map(function ($f) {
            $totalSeats = $f->classes->sum(fn ($c) => $c->seats->count());
            $bookedSeats = $f->classes->sum(fn ($c) => $c->seats->whereNotNull('booking_id')->count());
            $pct = $totalSeats > 0 ? round(($bookedSeats / $totalSeats) * 100, 1) : 0;

            return [
                'id' => $f->id,
                'flight_number' => $f->flight_number,
                'airline' => $f->airline->name,
                'origin' => $f->origin,
                'destination' => $f->destination,
                'departure_at' => $f->departure_at ? $f->departure_at->format('M d, H:i') : null,
                'total_seats' => $totalSeats,
                'booked_seats' => $bookedSeats,
                'utilization_pct' => $pct,
            ];
        });

        // Hotel room occupancy
        $hotels = Hotel::with('roomTypes')->limit(6)->get()->map(function ($h) {
            $totalRooms = $h->roomTypes->sum('total_rooms');
            $bookedCount = DB::table('booking_rooms')
                ->join('room_types', 'booking_rooms.room_type_id', '=', 'room_types.id')
                ->where('room_types.hotel_id', $h->id)
                ->sum('booking_rooms.quantity');
            $pct = $totalRooms > 0 ? round(($bookedCount / max(1, $totalRooms * 3)) * 100, 1) : 0;

            return [
                'id' => $h->id,
                'name' => $h->name,
                'city' => $h->city,
                'stars' => $h->stars,
                'total_rooms' => $totalRooms,
                'booked_rooms' => (int) $bookedCount,
                'occupancy_pct' => min(100, $pct),
            ];
        });

        $grossMinor = (int) (clone $p)->sum('amount_minor');
        $refundMinor = (int) (clone $r)->sum('amount_minor');
        $totalBookings = (clone $b)->count();
        $confirmedBookings = (clone $b)->where('status', 'confirmed')->count();
        $fulfillmentRate = $totalBookings > 0 ? round(($confirmedBookings / $totalBookings) * 100, 1) : 100.0;

        $metrics = [
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'fulfillment_rate' => $fulfillmentRate,
            'successful_payments_minor' => $grossMinor,
            'refunds_minor' => $refundMinor,
            'net_revenue_minor' => $grossMinor - $refundMinor,
            'active_users' => User::where('status', 'active')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_agents' => User::where('role', 'agent')->count(),
            'verified_users' => User::whereNotNull('email_verified_at')->count(),
            'flight_bookings' => (clone $b)->where('type', 'flight')->count(),
            'hotel_bookings' => (clone $b)->where('type', 'hotel')->count(),
            'package_bookings' => (clone $b)->where('type', 'package')->count(),
            'cancellations' => (clone $b)->where('status', 'cancelled')->count(),
            'pending_fraud_flags' => FraudFlag::where('status', 'pending')->count(),
            'hotel_properties' => Hotel::count(),
            'active_promotions' => Promotion::where('status', 'active')->count(),
            'holiday_packages' => Package::count(),
            'agent_commissions_minor' => (int) AgentCommission::where('created_at', '>=', $start)->sum('amount_minor'),
            'avg_flight_utilization' => $flights->count() > 0 ? round($flights->avg('utilization_pct'), 1) : 0,
            'avg_hotel_occupancy' => $hotels->count() > 0 ? round($hotels->avg('occupancy_pct'), 1) : 0,
        ];

        // Service Breakdown
        $serviceBreakdown = [
            [
                'name' => 'Flights',
                'type' => 'flight',
                'count' => (clone $b)->where('type', 'flight')->count(),
                'revenue_minor' => (int) (clone $b)->where('type', 'flight')->where('status', 'confirmed')->sum('total_minor'),
            ],
            [
                'name' => 'Hotels',
                'type' => 'hotel',
                'count' => (clone $b)->where('type', 'hotel')->count(),
                'revenue_minor' => (int) (clone $b)->where('type', 'hotel')->where('status', 'confirmed')->sum('total_minor'),
            ],
            [
                'name' => 'Packages',
                'type' => 'package',
                'count' => (clone $b)->where('type', 'package')->count(),
                'revenue_minor' => (int) (clone $b)->where('type', 'package')->where('status', 'confirmed')->sum('total_minor'),
            ],
        ];

        $monthCount = max(1, (int) ceil($start->diffInMonths(now())) + 1);
        $months = collect(range($monthCount - 1, 0))->map(function (int $n) use ($start): array {
            $date = now()->startOfMonth()->subMonths($n);
            $from = $date->copy()->startOfMonth()->max($start);
            $to = $date->copy()->endOfMonth()->min(now());

            return [
                'month' => $date->format('M'),
                'gross_minor' => (int) Payment::where('status', 'successful')->whereBetween('created_at', [$from, $to])->sum('amount_minor'),
                'refund_minor' => (int) Refund::where('status', 'completed')->whereBetween('created_at', [$from, $to])->sum('amount_minor'),
            ];
        });

        $recentAudits = AuditLog::with('actor')->latest()->limit(5)->get()->map(fn ($a) => [
            'id' => $a->id,
            'action' => $a->action,
            'auditable_type' => class_basename($a->resource ?? 'System'),
            'user_name' => $a->actor?->name ?? 'System',
            'created_at' => $a->created_at->diffForHumans(),
        ]);

        return response()->json([
            'data' => [
                'metrics' => $metrics,
                'monthly_revenue' => $months,
                'status_distribution' => (clone $b)->select('status', DB::raw('COUNT(*) as count'))->groupBy('status')->get(),
                'destinations' => (clone $b)->select('destination', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_minor) as revenue_minor'))->groupBy('destination')->orderByDesc('count')->limit(6)->get(),
                'recent_bookings' => BookingResource::collection((clone $b)->with('items', 'passengers', 'seats', 'payment', 'refund', 'documents')->latest()->limit(20)->get()),
                'flight_occupancy' => $flights,
                'hotel_occupancy' => $hotels,
                'service_breakdown' => $serviceBreakdown,
                'recent_audits' => $recentAudits,
                'notifications' => $request->user()->notifications()->latest()->limit(10)->get(),
                'unread_count' => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    public function agent(Request $request): JsonResponse
    {
        $data = $request->validate(['days' => 'nullable|in:30,90,365']);
        $start = now()->subDays((int) ($data['days'] ?? 30));
        $commissions = AgentCommission::where('agent_id', $request->user()->id)->where('created_at', '>=', $start);

        return response()->json(['data' => ['metrics' => ['corporate_clients' => CorporateClient::where('agent_id', $request->user()->id)->count(), 'commission_earned_minor' => (clone $commissions)->where('status', 'earned')->sum('amount_minor'), 'commission_pending_minor' => (clone $commissions)->where('status', 'pending')->sum('amount_minor')], 'clients' => CorporateClient::where('agent_id', $request->user()->id)->latest()->paginate(10), 'commissions' => (clone $commissions)->with('booking')->latest()->paginate(10)]]);
    }
}
