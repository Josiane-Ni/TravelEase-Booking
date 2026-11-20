<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'hotel_id',
        'name',
        'description',
        'price_per_night_minor',
        'capacity',
        'total_rooms',
        'amenities',
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night_minor' => 'integer',
            'capacity' => 'integer',
            'total_rooms' => 'integer',
            'amenities' => 'array',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(RoomInventory::class);
    }

    public function bookingRooms(): HasMany
    {
        return $this->hasMany(BookingRoom::class);
    }
}
