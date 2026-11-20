<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'discount_type',
        'discount_value',
        'min_spend_minor',
        'max_discount_minor',
        'start_date',
        'expiry_date',
        'usage_limit',
        'times_used',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'min_spend_minor' => 'integer',
            'max_discount_minor' => 'integer',
            'start_date' => 'date',
            'expiry_date' => 'date',
            'usage_limit' => 'integer',
            'times_used' => 'integer',
        ];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class);
    }

    public function isValidFor(int $amountMinor): bool
    {
        if ($this->status !== 'active') return false;
        $now = now()->toDateString();
        if ($now < $this->start_date->toDateString() || $now > $this->expiry_date->toDateString()) return false;
        if ($this->times_used >= $this->usage_limit) return false;
        if ($amountMinor < $this->min_spend_minor) return false;
        return true;
    }

    public function calculateDiscount(int $amountMinor): int
    {
        if (!$this->isValidFor($amountMinor)) return 0;
        if ($this->discount_type === 'percentage') {
            $discount = intdiv($amountMinor * $this->discount_value, 100);
            if ($this->max_discount_minor && $discount > $this->max_discount_minor) {
                $discount = $this->max_discount_minor;
            }
            return $discount;
        }
        return min($this->discount_value, $amountMinor);
    }
}
