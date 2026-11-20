<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FlightClass extends Model
{
    use HasFactory;

    protected $fillable = ['flight_id', 'name', 'fare_minor', 'tax_minor'];

    protected function casts(): array
    {
        return [];
    }

    public function flight(): BelongsTo
    {
        return $this->belongsTo(Flight::class);
    }

    public function seats(): HasMany
    {
        return $this->hasMany(FlightSeat::class);
    }
}
