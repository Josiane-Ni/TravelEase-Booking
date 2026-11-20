<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryHold extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'user_id', 'inventory_type', 'flight_class_id',
        'room_type_id', 'check_in', 'check_out', 'quantity', 'status', 'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'immutable_datetime',
            'check_in' => 'date',
            'check_out' => 'date',
        ];
    }

    public function seats(): HasMany
    {
        return $this->hasMany(FlightSeat::class);
    }

    public function flightClass(): BelongsTo
    {
        return $this->belongsTo(FlightClass::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
