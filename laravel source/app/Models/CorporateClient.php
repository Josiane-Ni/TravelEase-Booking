<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CorporateClient extends Model
{
    use HasFactory;

    protected $fillable = ['agent_id', 'name', 'contact_email', 'phone'];

    protected function casts(): array
    {
        return [];
    }
}
