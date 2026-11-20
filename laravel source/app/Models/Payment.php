<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['reference', 'booking_id', 'user_id', 'method', 'status', 'amount_minor', 'currency', 'simulated'];

    protected function casts(): array
    {
        return ['simulated' => 'boolean'];
    }
}
