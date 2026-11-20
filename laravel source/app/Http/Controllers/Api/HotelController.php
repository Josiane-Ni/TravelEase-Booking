<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\RoomInventory;
use App\Models\RoomType;
use App\Services\AuditService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Hotel::with(['roomTypes', 'images'])->where('status', 'active');

        if ($city = $request->input('city') ?: $request->input('destination')) {
            $query->where('city', 'like', "%{$city}%");
        }

        if ($stars = $request->input('stars')) {
            $query->where('stars', '>=', (int) $stars);
        }

        if ($request->filled('min_price') || $request->filled('max_price')) {
            $query->whereHas('roomTypes', function ($q) use ($request) {
                if ($request->filled('min_price')) {
                    $q->where('price_per_night_minor', '>=', (int) $request->input('min_price'));
                }
                if ($request->filled('max_price')) {
                    $q->where('price_per_night_minor', '<=', (int) $request->input('max_price'));
                }
            });
        }

        if ($amenity = $request->input('amenity')) {
            $query->whereJsonContains('amenities', $amenity);
        }

        // Sorting
        $sort = $request->input('sort', 'stars_desc');
        match ($sort) {
            'stars_asc' => $query->orderBy('stars', 'asc'),
            'stars_desc' => $query->orderBy('stars', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            default => $query->orderBy('stars', 'desc')->orderBy('name', 'asc'),
        };

        $hotels = $query->paginate(12);

        // If dates are provided, calculate total stay price and availability for each hotel
        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');
        $guests = (int) $request->input('guests', 1);

        $transformed = $hotels->getCollection()->map(function (Hotel $hotel) use ($checkIn, $checkOut, $guests) {
            $minNightly = $hotel->roomTypes->min('price_per_night_minor') ?: 0;
            $data = $hotel->toArray();
            $data['min_price_per_night_minor'] = $minNightly;

            if ($checkIn && $checkOut) {
                try {
                    $start = Carbon::parse($checkIn);
                    $end = Carbon::parse($checkOut);
                    $nights = max(1, $start->diffInDays($end));
                    $data['stay_nights'] = $nights;
                    $data['min_total_stay_minor'] = $minNightly * $nights;
                } catch (\Exception $e) {}
            }

            return $data;
        });

        return response()->json([
            'data' => $transformed,
            'meta' => [
                'current_page' => $hotels->currentPage(),
                'last_page' => $hotels->lastPage(),
                'total' => $hotels->total(),
            ],
        ]);
    }

    public function show(Hotel $hotel, Request $request): JsonResponse
    {
        $hotel->load(['roomTypes', 'images']);

        $checkIn = $request->input('check_in');
        $checkOut = $request->input('check_out');

        $roomTypes = $hotel->roomTypes->map(function (RoomType $room) use ($checkIn, $checkOut) {
            $roomData = $room->toArray();

            if ($checkIn && $checkOut) {
                try {
                    $start = Carbon::parse($checkIn)->startOfDay();
                    $end = Carbon::parse($checkOut)->startOfDay();
                    $nights = max(1, $start->diffInDays($end));
                    $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();

                    // Check availability for EVERY night of requested stay
                    $minAvailable = RoomInventory::where('room_type_id', $room->id)
                        ->whereIn('inventory_date', $dates)
                        ->min('available_rooms');

                    $roomData['available_for_stay'] = $minAvailable !== null ? (int) $minAvailable : $room->total_rooms;
                    $roomData['stay_nights'] = $nights;
                    $roomData['total_stay_price_minor'] = $room->price_per_night_minor * $nights;
                } catch (\Exception $e) {
                    $roomData['available_for_stay'] = $room->total_rooms;
                }
            } else {
                $roomData['available_for_stay'] = $room->total_rooms;
            }

            return $roomData;
        });

        $response = $hotel->toArray();
        $response['room_types'] = $roomTypes;

        return response()->json(['data' => $response]);
    }

    public function availability(Hotel $hotel, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
        ]);

        $start = Carbon::parse($validated['check_in'])->startOfDay();
        $end = Carbon::parse($validated['check_out'])->startOfDay();
        $nights = $start->diffInDays($end);
        $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();

        $rooms = $hotel->roomTypes->map(function (RoomType $room) use ($dates, $nights) {
            $minAvailable = RoomInventory::where('room_type_id', $room->id)
                ->whereIn('inventory_date', $dates)
                ->min('available_rooms');

            return [
                'id' => $room->id,
                'name' => $room->name,
                'price_per_night_minor' => $room->price_per_night_minor,
                'total_stay_minor' => $room->price_per_night_minor * $nights,
                'nights' => $nights,
                'capacity' => $room->capacity,
                'available_rooms' => $minAvailable !== null ? (int) $minAvailable : $room->total_rooms,
            ];
        });

        return response()->json(['data' => $rooms]);
    }

    // Admin CRUD
    public function adminIndex(Request $request): JsonResponse
    {
        $hotels = Hotel::with('roomTypes')->orderBy('id', 'desc')->paginate(15);
        return response()->json(['data' => $hotels]);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->has('star_rating') && ! $request->has('stars')) {
            $request->merge(['stars' => $request->input('star_rating')]);
        }
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'city' => ['required', 'string', 'max:80'],
            'stars' => ['required', 'integer', 'between:1,5'],
            'description' => ['required', 'string'],
            'amenities' => ['nullable', 'array'],
            'address' => ['nullable', 'string', 'max:255'],
            'cancellation_hours' => ['nullable', 'integer', 'min:0'],
            'cancellation_fee_percent' => ['nullable', 'integer', 'between:0,100'],
            'image_path' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $hotel = Hotel::create($validated);
        AuditService::record($request->user()->id, 'hotel.created', 'hotel', $hotel->id);

        return response()->json(['data' => $hotel], 201);
    }

    public function update(Request $request, Hotel $hotel): JsonResponse
    {
        if ($request->has('star_rating') && ! $request->has('stars')) {
            $request->merge(['stars' => $request->input('star_rating')]);
        }
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'city' => ['sometimes', 'string', 'max:80'],
            'stars' => ['sometimes', 'integer', 'between:1,5'],
            'description' => ['sometimes', 'string'],
            'amenities' => ['nullable', 'array'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:active,inactive'],
            'cancellation_hours' => ['nullable', 'integer', 'min:0'],
            'cancellation_fee_percent' => ['nullable', 'integer', 'between:0,100'],
            'image_path' => ['nullable', 'string'],
        ]);

        $hotel->update($validated);
        AuditService::record($request->user()->id, 'hotel.updated', 'hotel', $hotel->id);

        return response()->json(['data' => $hotel]);
    }

    public function destroy(Request $request, Hotel $hotel): JsonResponse
    {
        $hotel->update(['status' => 'inactive']);
        AuditService::record($request->user()->id, 'hotel.deactivated', 'hotel', $hotel->id);

        return response()->json(['message' => 'Hotel deactivated successfully.']);
    }

    public function storeRoomType(Request $request, Hotel $hotel): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'price_per_night_minor' => ['required', 'integer', 'min:100'],
            'capacity' => ['required', 'integer', 'min:1'],
            'total_rooms' => ['required', 'integer', 'min:1'],
            'amenities' => ['nullable', 'array'],
        ]);

        $room = $hotel->roomTypes()->create($validated);

        // Seed 60 days of inventory for the new room
        for ($d = 0; $d < 60; $d++) {
            $date = now()->startOfDay()->addDays($d)->toDateString();
            $room->inventories()->create([
                'inventory_date' => $date,
                'available_rooms' => $room->total_rooms,
            ]);
        }

        AuditService::record($request->user()->id, 'room_type.created', 'room_type', $room->id);

        return response()->json(['data' => $room], 201);
    }
}
