<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlightSeat extends Model
{
    use HasFactory;

    protected $fillable = ['flight_class_id', 'number', 'inventory_hold_id', 'booking_id'];

    protected function casts(): array
    {
        return [];
    }

    public function hold(): BelongsTo
    {
        return $this->belongsTo(InventoryHold::class, 'inventory_hold_id');
    }
}
