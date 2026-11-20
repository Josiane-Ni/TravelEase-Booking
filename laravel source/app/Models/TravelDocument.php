<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelDocument extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'name', 'available'];

    protected function casts(): array
    {
        return ['available' => 'boolean'];
    }
}
