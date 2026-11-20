<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAttempt extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'inventory_hold_id', 'status', 'reason'];

    protected function casts(): array
    {
        return [];
    }
}
