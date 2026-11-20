<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ConfirmBookingRequest;
use App\Http\Requests\HoldRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\FlightClass;
use App\Models\InventoryHold;
use App\Models\Package;
use App\Models\RoomType;
use App\Services\BookingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class CheckoutController extends Controller
{
    public function __construct(private BookingService $service) {}

    public function quote(Request $request): JsonResponse
    {
        if ($request->has('room_type_id')) {
            $data = $request->validate([
                'room_type_id' => 'required|exists:room_types,id',
                'check_in' => 'required|date',
                'check_out' => 'required|date|after:check_in',
                'quantity' => 'nullable|integer|min:1|max:5',
            ]);
            $room = RoomType::with('hotel')->findOrFail($data['room_type_id']);
            $start = Carbon::parse($data['check_in']);
            $end = Carbon::parse($data['check_out']);
            $nights = max(1, $start->diffInDays($end));
            $qty = (int) ($data['quantity'] ?? 1);
            $subtotal = $room->price_per_night_minor * $nights * $qty;
            $tax = intdiv($subtotal * 10, 100);

            return response()->json([
                'data' => [
                    'type' => 'hotel',
                    'hotel_id' => $room->hotel_id,
                    'hotel_name' => $room->hotel->name,
                    'room_type_id' => $room->id,
                    'room_name' => $room->name,
                    'nights' => $nights,
                    'quantity' => $qty,
                    'subtotal_minor' => $subtotal,
                    'tax_minor' => $tax,
                    'total_minor' => $subtotal + $tax,
                    'currency' => 'USD',
                    'simulated' => true,
                ],
            ]);
        }

        if ($request->has('package_id')) {
            $data = $request->validate([
                'package_id' => 'required|exists:packages,id',
                'quantity' => 'nullable|integer|min:1|max:9',
            ]);
            $package = Package::findOrFail($data['package_id']);
            $qty = (int) ($data['quantity'] ?? 1);
            $baseTotal = $package->base_price_minor * $qty;
            $discount = intdiv($baseTotal * $package->discount_percent, 100);
            $tax = intdiv(($baseTotal - $discount) * 10, 100);

            return response()->json([
                'data' => [
                    'type' => 'package',
                    'package_id' => $package->id,
                    'package_title' => $package->title,
                    'quantity' => $qty,
                    'subtotal_minor' => $baseTotal,
                    'discount_minor' => $discount,
                    'tax_minor' => $tax,
                    'total_minor' => ($baseTotal - $discount) + $tax,
                    'currency' => 'USD',
                    'simulated' => true,
                ],
            ]);
        }

        $data = $request->validate([
            'flight_class_id' => 'required|exists:flight_classes,id',
            'quantity' => 'required|integer|min:1|max:9',
        ]);

        return response()->json(['data' => $this->service->quote(FlightClass::findOrFail($data['flight_class_id']), $data['quantity'])]);
    }

    public function hold(HoldRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->service->hold($request->user(), $request->validated())], 201);
    }

    public function release(Request $request, InventoryHold $hold): JsonResponse
    {
        $this->service->release($request->user(), $hold);

        return response()->json(['message' => 'Hold released.']);
    }

    public function confirm(ConfirmBookingRequest $request): BookingResource|JsonResponse
    {
        $result = $this->service->confirm($request->user(), $request->validated());
        if (isset($result['failure'])) {
            return response()->json(['message' => $result['failure']], 422);
        }

        return new BookingResource(Booking::with('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents')->findOrFail($result['booking_id']));
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return BookingResource::collection($request->user()->bookings()->with('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents')->latest()->paginate(10));
    }

    public function show(Booking $booking): BookingResource
    {
        Gate::authorize('view', $booking);

        return new BookingResource($booking->load('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents'));
    }

    public function cancellationQuote(Booking $booking): JsonResponse
    {
        Gate::authorize('cancel', $booking);

        return response()->json(['data' => $this->service->cancellationQuote($booking)]);
    }

    public function cancel(Request $request, Booking $booking): BookingResource
    {
        Gate::authorize('cancel', $booking);

        return new BookingResource($this->service->cancel($request->user(), $booking)->load('items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents'));
    }

    public function pdf(Booking $booking): Response
    {
        Gate::authorize('view', $booking);

        return Pdf::loadView('itinerary', [
            'booking' => $booking->load('user', 'items', 'passengers', 'seats', 'rooms.roomType.hotel', 'hotel', 'package', 'promotion', 'payment', 'refund', 'documents'),
        ])->download('TravelEase-'.$booking->reference.'.pdf');
    }

    public function document(Request $request, Booking $booking, int $document): JsonResponse
    {
        Gate::authorize('cancel', $booking);
        $data = $request->validate(['available' => 'required|boolean']);
        $doc = $booking->documents()->findOrFail($document);
        $doc->update($data);

        return response()->json(['data' => $doc]);
    }
}
