<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::with(['components.flight.airline', 'components.hotel.roomTypes'])
            ->where('status', 'active');

        if ($dest = $request->input('destination')) {
            $query->where('destination', 'like', "%{$dest}%");
        }

        if ($request->filled('min_price')) {
            $query->where('base_price_minor', '>=', (int) $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('base_price_minor', '<=', (int) $request->input('max_price'));
        }

        $packages = $query->paginate(12);

        return response()->json($packages);
    }

    public function show(Package $package): JsonResponse
    {
        $package->load([
            'components.flight.airline',
            'components.flight.classes',
            'components.hotel.roomTypes',
        ]);

        return response()->json(['data' => $package]);
    }

    public function customize(Package $package, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'passengers' => ['required', 'integer', 'min:1', 'max:9'],
            'room_type_id' => ['nullable', 'exists:room_types,id'],
            'flight_class_id' => ['nullable', 'exists:flight_classes,id'],
        ]);

        $package->load(['components.flight.classes', 'components.hotel.roomTypes']);

        $passengers = (int) $validated['passengers'];
        $basePrice = $package->base_price_minor * $passengers;
        $discountAmount = intdiv($basePrice * $package->discount_percent, 100);
        $finalAmount = $basePrice - $discountAmount;

        return response()->json([
            'data' => [
                'package_id' => $package->id,
                'title' => $package->title,
                'passengers' => $passengers,
                'original_total_minor' => $basePrice,
                'discount_percent' => $package->discount_percent,
                'discount_minor' => $discountAmount,
                'final_total_minor' => $finalAmount,
                'currency' => 'USD',
            ],
        ]);
    }

    // Admin CRUD
    public function adminIndex(): JsonResponse
    {
        $packages = Package::with(['components.flight.airline', 'components.hotel.roomTypes'])->orderBy('id', 'desc')->paginate(15);
        return response()->json(['data' => $packages]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! $request->filled('destination')) {
            $request->merge(['destination' => 'Kigali']);
        }
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'destination' => ['required', 'string', 'max:80'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string'],
            'inclusions' => ['nullable', 'array'],
            'exclusions' => ['nullable', 'array'],
            'discount_percent' => ['required', 'integer', 'between:0,100'],
            'base_price_minor' => ['required', 'integer', 'min:1000'],
            'image_path' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $package = Package::create($validated);
        AuditService::record($request->user()->id, 'package.created', 'package', $package->id);

        return response()->json(['data' => $package], 201);
    }

    public function update(Request $request, Package $package): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:150'],
            'destination' => ['sometimes', 'string', 'max:80'],
            'duration_days' => ['sometimes', 'integer', 'min:1'],
            'description' => ['sometimes', 'string'],
            'inclusions' => ['nullable', 'array'],
            'exclusions' => ['nullable', 'array'],
            'discount_percent' => ['sometimes', 'integer', 'between:0,100'],
            'base_price_minor' => ['sometimes', 'integer', 'min:1000'],
            'status' => ['sometimes', 'in:active,inactive'],
            'image_path' => ['nullable', 'string'],
        ]);

        $package->update($validated);
        AuditService::record($request->user()->id, 'package.updated', 'package', $package->id);

        return response()->json(['data' => $package]);
    }

    public function destroy(Request $request, Package $package): JsonResponse
    {
        $package->update(['status' => 'inactive']);
        AuditService::record($request->user()->id, 'package.deactivated', 'package', $package->id);

        return response()->json(['message' => 'Package deactivated successfully.']);
    }
}
