<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['reference', 'wallet_id', 'booking_id', 'type', 'amount_minor', 'balance_after_minor'];

    protected function casts(): array
    {
        return [];
    }
}
