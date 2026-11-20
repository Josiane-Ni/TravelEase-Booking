<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Airline extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'logo_path'];

    protected function casts(): array
    {
        return [];
    }

    public function flights(): HasMany
    {
        return $this->hasMany(Flight::class);
    }
}
