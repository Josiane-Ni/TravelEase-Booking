<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FlightRequest;
use App\Http\Resources\FlightResource;
use App\Models\Airline;
use App\Models\Flight;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\InventoryHold;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class FlightController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate(['origin' => 'nullable|string|max:80', 'destination' => 'nullable|string|max:80', 'departure_date' => 'nullable|date', 'airline_id' => 'nullable|integer', 'class' => 'nullable|in:Economy,Business', 'min_price' => 'nullable|integer|min:0', 'max_price' => 'nullable|integer|min:0', 'passengers' => 'nullable|integer|min:1|max:9', 'sort' => 'nullable|in:price,departure', 'page' => 'nullable|integer|min:1']);
        $query = Flight::with('airline', 'classes')->where('status', 'scheduled')->where('departure_at', '>', now());
        foreach (['origin', 'destination'] as $field) {
            if (! empty($data[$field])) {
                $query->where($field, 'like', '%'.$data[$field].'%');
            }
        }
        if (! empty($data['departure_date'])) {
            $query->whereDate('departure_at', $data['departure_date']);
        }
        if (! empty($data['airline_id'])) {
            $query->where('airline_id', $data['airline_id']);
        }
        $query->whereHas('classes', function ($q) use ($data): void {
            if (! empty($data['class'])) {
                $q->where('name', $data['class']);
            }
            if (isset($data['min_price'])) {
                $q->whereRaw('(fare_minor + tax_minor) >= ?', [(int) $data['min_price']]);
            }
            if (isset($data['max_price'])) {
                $q->whereRaw('(fare_minor + tax_minor) <= ?', [(int) $data['max_price']]);
            }
            $q->whereHas('seats', fn ($s) => $s->whereNull('booking_id')->where(fn ($s) => $s->whereNull('inventory_hold_id')->orWhereHas('hold', fn ($h) => $h->where('status', '!=', 'active')->orWhere('expires_at', '<=', now()))), '>=', $data['passengers'] ?? 1);
        });
        if (($data['sort'] ?? null) === 'price') {
            $query->orderBy(FlightClass::selectRaw('MIN(fare_minor + tax_minor)')->whereColumn('flight_id', 'flights.id'));
        } else {
            $query->orderBy('departure_at');
        }

        return FlightResource::collection($query->paginate(10)->withQueryString());
    }

    public function show(Flight $flight): FlightResource
    {
        return new FlightResource($flight->load('airline', 'classes'));
    }

    public function airlines(): JsonResponse
    {
        return response()->json(['data' => Airline::orderBy('name')->get()]);
    }

    public function availability(Flight $flight): JsonResponse
    {
        return response()->json(['data' => $flight->classes()->with(['seats.hold'])->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'fare_minor' => $c->fare_minor, 'tax_minor' => $c->tax_minor, 'seats' => $c->seats->map(fn ($s) => ['id' => $s->id, 'number' => $s->number, 'available' => ! $s->booking_id && (! $s->hold || $s->hold->status !== 'active' || $s->hold->expires_at->isPast())])])]);
    }

    public function store(FlightRequest $request): FlightResource
    {
        $flight = DB::transaction(function () use ($request): Flight {
            $flight = Flight::create($request->safe()->except(['fare_minor', 'tax_minor', 'capacity']));
            $class = $flight->classes()->create(['name' => 'Economy', 'fare_minor' => $request->integer('fare_minor'), 'tax_minor' => $request->integer('tax_minor')]);
            for ($i = 0; $i < $request->integer('capacity'); $i++) {
                $class->seats()->create(['number' => (intdiv($i, 6) + 1).chr(65 + $i % 6)]);
            }
            AuditService::record($request->user()->id, 'flight.created', 'flight', $flight->id);

            return $flight;
        });

        return new FlightResource($flight->load('airline', 'classes'));
    }

    public function update(FlightRequest $request, Flight $flight): FlightResource
    {
        DB::transaction(function () use ($request, $flight): void {
            $locked = Flight::whereKey($flight->id)->lockForUpdate()->firstOrFail();
            $classes = $locked->classes()->orderBy('id')->lockForUpdate()->get();
            $class = $classes->firstWhere('name', 'Economy');
            abort_unless($class, 422, 'This flight has no Economy inventory.');
            abort_if(FlightSeat::whereIn('flight_class_id', $classes->modelKeys())->whereNotNull('booking_id')->exists() || InventoryHold::whereIn('flight_class_id', $classes->modelKeys())->where('status', 'active')->where('expires_at', '>', now())->exists(), 409, 'Flight details cannot change while seats are held or booked.');
            $locked->update($request->safe()->except(['fare_minor', 'tax_minor', 'capacity']));
            $class->update($request->safe()->only(['fare_minor', 'tax_minor']));
            abort_unless($class->seats()->count() === $request->integer('capacity'), 422, 'Capacity changes require a dedicated inventory workflow. Keep the current capacity.');
            AuditService::record($request->user()->id, 'flight.updated', 'flight', $flight->id);
        });

        return new FlightResource($flight->fresh()->load('airline', 'classes'));
    }

    public function destroy(Request $request, Flight $flight): JsonResponse
    {
        DB::transaction(function () use ($request, $flight): void {
            $locked = Flight::whereKey($flight->id)->lockForUpdate()->firstOrFail();
            $classes = $locked->classes()->orderBy('id')->lockForUpdate()->get();
            abort_if(FlightSeat::whereIn('flight_class_id', $classes->modelKeys())->whereNotNull('booking_id')->exists() || InventoryHold::whereIn('flight_class_id', $classes->modelKeys())->where('status', 'active')->where('expires_at', '>', now())->exists(), 409, 'A flight with held or booked seats cannot be deactivated.');
            $locked->update(['status' => 'inactive']);
            AuditService::record($request->user()->id, 'flight.deactivated', 'flight', $flight->id);
        });

        return response()->json(['message' => 'Flight deactivated.']);
    }
}
