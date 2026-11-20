<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FlightResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return ['id' => $this->id, 'flight_number' => $this->flight_number, 'airline' => $this->airline, 'origin' => $this->origin, 'destination' => $this->destination, 'departure_at' => $this->departure_at->toIso8601String(), 'arrival_at' => $this->arrival_at->toIso8601String(), 'duration_minutes' => (int) $this->departure_at->diffInMinutes($this->arrival_at), 'status' => $this->status, 'currency' => 'USD', 'simulated' => true, 'cancellation_hours' => $this->cancellation_hours, 'cancellation_fee_percent' => $this->cancellation_fee_percent, 'classes' => $this->classes->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'fare_minor' => $c->fare_minor, 'tax_minor' => $c->tax_minor, 'total_minor' => $c->fare_minor + $c->tax_minor, 'capacity' => $c->seats()->count(), 'available_seats' => $c->available_seats ?? $c->seats()->whereNull('booking_id')->where(fn ($q) => $q->whereNull('inventory_hold_id')->orWhereHas('hold', fn ($h) => $h->where('status', '!=', 'active')->orWhere('expires_at', '<=', now())))->count()])];
    }
}
