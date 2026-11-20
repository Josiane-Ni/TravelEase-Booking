<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomInventory extends Model
{
    use HasFactory;

    protected $table = 'room_inventory';

    protected $fillable = [
        'room_type_id',
        'inventory_date',
        'available_rooms',
    ];

    protected function casts(): array
    {
        return [
            'inventory_date' => 'date',
            'available_rooms' => 'integer',
        ];
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
