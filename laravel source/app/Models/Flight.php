<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = ['airline_id', 'flight_number', 'origin', 'destination', 'departure_at', 'arrival_at', 'status', 'cancellation_hours', 'cancellation_fee_percent'];

    protected function casts(): array
    {
        return ['departure_at' => 'immutable_datetime', 'arrival_at' => 'immutable_datetime'];
    }

    public function airline(): BelongsTo
    {
        return $this->belongsTo(Airline::class);
    }

    public function classes(): HasMany
    {
        return $this->hasMany(FlightClass::class);
    }
}
