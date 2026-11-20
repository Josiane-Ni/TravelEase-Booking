<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancellationRequest extends Model
{
    use HasFactory;

    protected $fillable = ['booking_id', 'user_id', 'status', 'fee_minor'];

    protected function casts(): array
    {
        return [];
    }
}
