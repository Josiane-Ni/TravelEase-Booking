<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CancellationPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_type',
        'policy_name',
        'rules',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rules' => 'array',
        ];
    }
}
