<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'destination',
        'duration_days',
        'description',
        'inclusions',
        'exclusions',
        'discount_percent',
        'base_price_minor',
        'image_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'duration_days' => 'integer',
            'discount_percent' => 'integer',
            'base_price_minor' => 'integer',
            'inclusions' => 'array',
            'exclusions' => 'array',
        ];
    }

    public function components(): HasMany
    {
        return $this->hasMany(PackageComponent::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
