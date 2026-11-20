<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BookingItem extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'flight_class_id', 'quantity', 'unit_fare_minor', 'unit_tax_minor', 'snapshot'];

    protected function casts(): array
    {
        return ['snapshot' => 'array'];
    }
}
