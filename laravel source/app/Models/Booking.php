<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference', 'user_id', 'status', 'type', 'destination', 'travel_at',
        'subtotal_minor', 'tax_minor', 'discount_minor', 'loyalty_redeemed_minor',
        'total_minor', 'currency', 'cancellation_policy', 'promotion_id',
        'agent_id', 'corporate_client_id', 'hotel_id', 'package_id',
    ];

    protected function casts(): array
    {
        return [
            'travel_at' => 'immutable_datetime',
            'cancellation_policy' => 'array',
            'subtotal_minor' => 'integer',
            'tax_minor' => 'integer',
            'discount_minor' => 'integer',
            'loyalty_redeemed_minor' => 'integer',
            'total_minor' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function corporateClient(): BelongsTo
    {
        return $this->belongsTo(CorporateClient::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BookingItem::class);
    }

    public function rooms(): HasMany
    {
        return $this->hasMany(BookingRoom::class);
    }

    public function passengers(): HasMany
    {
        return $this->hasMany(BookingPassenger::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function refund(): HasOne
    {
        return $this->hasOne(Refund::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TravelDocument::class);
    }

    public function seats(): BelongsToMany
    {
        return $this->belongsToMany(FlightSeat::class, 'booking_seats');
    }

    public function fraudFlags(): HasMany
    {
        return $this->hasMany(FraudFlag::class);
    }
}
