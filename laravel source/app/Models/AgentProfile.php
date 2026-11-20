<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'agency_name',
        'commission_rate',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
