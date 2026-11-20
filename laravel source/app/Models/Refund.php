<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasFactory;

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    protected $fillable = ['reference', 'booking_id', 'payment_id', 'amount_minor', 'status'];

    protected function casts(): array
    {
        return [];
    }
}
