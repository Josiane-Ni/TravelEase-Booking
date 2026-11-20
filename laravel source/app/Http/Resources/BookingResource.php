<?php

namespace App\Http\Resources;

use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status,
            'type' => $this->type,
            'destination' => $this->destination,
            'travel_at' => $this->travel_at->toIso8601String(),
            'subtotal_minor' => $this->subtotal_minor,
            'tax_minor' => $this->tax_minor,
            'discount_minor' => $this->discount_minor,
            'loyalty_redeemed_minor' => $this->loyalty_redeemed_minor,
            'total_minor' => $this->total_minor,
            'currency' => $this->currency,
            'created_at' => $this->created_at->toIso8601String(),
            'cancellation_policy' => $this->cancellation_policy,
            'cancellation_quote' => app(BookingService::class)->cancellationQuote($this->resource),
            'items' => $this->items,
            'rooms' => $this->rooms->map(fn ($r) => [
                'id' => $r->id,
                'room_type_name' => $r->roomType?->name,
                'hotel_name' => $r->roomType?->hotel?->name,
                'check_in' => $r->check_in->toDateString(),
                'check_out' => $r->check_out->toDateString(),
                'quantity' => $r->quantity,
                'price_per_night_minor' => $r->price_per_night_minor,
                'total_minor' => $r->total_minor,
            ]),
            'passengers' => $this->passengers,
            'seats' => $this->seats->map(fn ($s) => $s->number),
            'payment' => $this->payment,
            'refund' => $this->refund,
            'promotion' => $this->promotion,
            'documents' => $this->documents,
            'simulated' => true,
        ];
    }
}
