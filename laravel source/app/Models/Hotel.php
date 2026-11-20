<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hotel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'city',
        'stars',
        'description',
        'amenities',
        'image_path',
        'status',
        'address',
        'cancellation_hours',
        'cancellation_fee_percent',
    ];

    protected $appends = ['star_rating'];

    public function getStarRatingAttribute(): int
    {
        return (int) ($this->attributes['stars'] ?? 0);
    }

    protected function casts(): array
    {
        return [
            'amenities' => 'array',
            'stars' => 'integer',
            'cancellation_hours' => 'integer',
            'cancellation_fee_percent' => 'integer',
        ];
    }

    public function roomTypes(): HasMany
    {
        return $this->hasMany(RoomType::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(HotelImage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
