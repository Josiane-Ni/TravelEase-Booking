<?php

namespace App\Services;

use App\Models\AgentCommission;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\CancellationRequest;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\Hotel;
use App\Models\InventoryHold;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyTransaction;
use App\Models\Payment;
use App\Models\PaymentAttempt;
use App\Models\Promotion;
use App\Models\PromotionUsage;
use App\Models\Refund;
use App\Models\RoomInventory;
use App\Models\RoomType;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Notifications\TravelNotice;
use App\Services\AdminNotificationService;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    public function quote(FlightClass $class, int $quantity): array
    {
        return [
            'type' => 'flight',
            'subtotal_minor' => $class->fare_minor * $quantity,
            'tax_minor' => $class->tax_minor * $quantity,
            'total_minor' => ($class->fare_minor + $class->tax_minor) * $quantity,
            'currency' => 'USD',
            'quantity' => $quantity,
            'simulated' => true,
        ];
    }

    public function hold(User $user, array $data): InventoryHold
    {
        if (! empty($data['room_type_id'])) {
            return $this->holdRoom($user, $data);
        }

        return DB::transaction(function () use ($user, $data): InventoryHold {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $class = FlightClass::with('flight')->whereKey($data['flight_class_id'])->lockForUpdate()->firstOrFail();
            abort_unless($class->flight->status === 'scheduled' && $class->flight->departure_at->isFuture(), 409, 'This flight is no longer available.');
            $seats = $class->seats()->whereIn('id', $data['seat_ids'])->orderBy('id')->lockForUpdate()->get();
            abort_unless($seats->count() === count($data['seat_ids']), 422, 'All seats must belong to the selected flight class.');
            foreach ($seats as $seat) {
                $held = $seat->hold;
                abort_if($seat->booking_id || ($held && $held->status === 'active' && $held->expires_at->isFuture()), 409, 'A selected seat was just reserved. Choose another seat.');
            }
            $hold = InventoryHold::create([
                'reference' => (string) Str::uuid(),
                'user_id' => $user->id,
                'inventory_type' => 'flight',
                'flight_class_id' => $class->id,
                'quantity' => $seats->count(),
                'expires_at' => now()->addMinutes(config('travelease.hold_minutes')),
            ]);
            FlightSeat::whereIn('id', $seats->modelKeys())->update(['inventory_hold_id' => $hold->id]);
            AuditService::record($user->id, 'inventory.held', 'inventory_hold', $hold->id);

            return $hold->load('seats');
        }, 3);
    }

    public function holdRoom(User $user, array $data): InventoryHold
    {
        return DB::transaction(function () use ($user, $data): InventoryHold {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $room = RoomType::with('hotel')->whereKey($data['room_type_id'])->lockForUpdate()->firstOrFail();
            abort_unless($room->hotel->status === 'active', 409, 'This hotel is currently not accepting bookings.');

            $start = Carbon::parse($data['check_in'])->startOfDay();
            $end = Carbon::parse($data['check_out'])->startOfDay();
            $qty = (int) ($data['rooms_quantity'] ?? 1);
            $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();

            // Lock and verify room inventory for every night of requested stay
            $inventories = RoomInventory::where('room_type_id', $room->id)
                ->whereIn('inventory_date', $dates)
                ->orderBy('inventory_date')
                ->lockForUpdate()
                ->get();

            foreach ($dates as $date) {
                $dayInv = $inventories->firstWhere('inventory_date', $date);
                $available = $dayInv ? $dayInv->available_rooms : $room->total_rooms;
                abort_if($available < $qty, 409, "Insufficient room availability on {$date}.");
            }

            $hold = InventoryHold::create([
                'reference' => (string) Str::uuid(),
                'user_id' => $user->id,
                'inventory_type' => 'hotel',
                'room_type_id' => $room->id,
                'check_in' => $start->toDateString(),
                'check_out' => $end->toDateString(),
                'quantity' => $qty,
                'expires_at' => now()->addMinutes(config('travelease.hold_minutes')),
            ]);

            AuditService::record($user->id, 'inventory.held', 'inventory_hold', $hold->id);

            return $hold->load('roomType.hotel');
        }, 3);
    }

    public function release(User $user, InventoryHold $hold): void
    {
        abort_unless($hold->user_id === $user->id, 403);
        DB::transaction(function () use ($user, $hold): void {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ($hold->flight_class_id) {
                FlightClass::whereKey($hold->flight_class_id)->lockForUpdate()->firstOrFail();
            }
            $locked = InventoryHold::whereKey($hold->id)->lockForUpdate()->firstOrFail();
            if ($locked->status === 'active') {
                $locked->update(['status' => 'released']);
                if ($locked->flight_class_id) {
                    FlightSeat::where('inventory_hold_id', $locked->id)->update(['inventory_hold_id' => null]);
                }
            }
        }, 3);
    }

    private function replay(User $user, string $scope, string $key, array $payload): ?array
    {
        $entry = DB::table('idempotency_keys')->where(['user_id' => $user->id, 'scope' => $scope, 'key' => $key])->first();
        if (! $entry) {
            return null;
        }
        abort_unless(hash_equals($entry->payload_hash, hash('sha256', json_encode($payload))), 409, 'This request key was already used with different details.');

        return json_decode($entry->response, true);
    }

    private function remember(User $user, string $scope, string $key, array $payload, array $response): void
    {
        DB::table('idempotency_keys')->insert([
            'user_id' => $user->id,
            'scope' => $scope,
            'key' => $key,
            'payload_hash' => hash('sha256', json_encode($payload)),
            'response' => json_encode($response),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function confirm(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data): array {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ($result = $this->replay($user, 'checkout', $data['idempotency_key'], $data)) {
                return $result;
            }
            $hold = InventoryHold::whereKey($data['hold_id'])->firstOrFail();
            abort_unless($hold->user_id === $user->id, 403);
            $hold = InventoryHold::whereKey($hold->id)->lockForUpdate()->firstOrFail();
            abort_unless($hold->status === 'active' && $hold->expires_at->isFuture(), 409, 'Your inventory hold has expired. Please select your options again.');

            $isHotel = ($hold->inventory_type === 'hotel');
            $seats = collect();
            $room = null;
            $class = null;

            if ($isHotel) {
                $room = RoomType::with('hotel')->whereKey($hold->room_type_id)->lockForUpdate()->firstOrFail();
                abort_unless($room->hotel->status === 'active', 409, 'This hotel is no longer accepting bookings.');

                $start = Carbon::parse($hold->check_in)->startOfDay();
                $end = Carbon::parse($hold->check_out)->startOfDay();
                $nights = max(1, $start->diffInDays($end));
                $qty = $hold->quantity;
                $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();

                // Re-verify room inventory for every night with lockForUpdate
                $inventories = RoomInventory::where('room_type_id', $room->id)
                    ->whereIn('inventory_date', $dates)
                    ->orderBy('inventory_date')
                    ->lockForUpdate()
                    ->get();

                foreach ($dates as $date) {
                    $dayInv = $inventories->firstWhere('inventory_date', $date);
                    $available = $dayInv ? $dayInv->available_rooms : $room->total_rooms;
                    abort_if($available < $qty, 409, "Insufficient room availability for night of {$date}.");
                }

                $subtotal = $room->price_per_night_minor * $nights * $qty;
                $tax = intdiv($subtotal * 10, 100);
                $price = [
                    'subtotal_minor' => $subtotal,
                    'tax_minor' => $tax,
                    'total_minor' => $subtotal + $tax,
                ];
                $destination = $room->hotel->city;
                $travelAt = $start;
                $cancellationPolicy = [
                    'hours' => $room->hotel->cancellation_hours,
                    'fee_percent' => $room->hotel->cancellation_fee_percent,
                ];
            } else {
                $class = FlightClass::with('flight.airline')->whereKey($hold->flight_class_id)->lockForUpdate()->firstOrFail();
                abort_unless($class->flight->status === 'scheduled' && $class->flight->departure_at->isFuture(), 409, 'This flight is no longer available.');
                abort_unless(count($data['passengers']) === $hold->quantity, 422, 'Passenger count must match the held seats.');
                $seats = $hold->seats()->orderBy('id')->lockForUpdate()->get();
                abort_unless($seats->count() === $hold->quantity && ! $seats->contains(fn ($s) => $s->booking_id !== null), 409, 'Your selected seats are unavailable.');

                $price = $this->quote($class, $hold->quantity);
                $destination = $class->flight->destination;
                $travelAt = $class->flight->departure_at;
                $cancellationPolicy = [
                    'hours' => $class->flight->cancellation_hours,
                    'fee_percent' => $class->flight->cancellation_fee_percent,
                ];
            }

            // Calculate Discounts: Promotions
            $discountMinor = 0;
            $promotion = null;
            if (! empty($data['promotion_id'])) {
                $promotion = Promotion::whereKey($data['promotion_id'])->lockForUpdate()->first();
                if ($promotion && $promotion->isValidFor($price['total_minor'])) {
                    $discountMinor = $promotion->calculateDiscount($price['total_minor']);
                }
            }

            // Calculate Discounts: Loyalty Points Redemption (1 point = 10 cents = 100 minor cents)
            $loyaltyRedeemedMinor = 0;
            $pointsToRedeem = 0;
            $loyalty = LoyaltyAccount::where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            if (! empty($data['redeem_points']) && (int) $data['redeem_points'] > 0) {
                $requestedPoints = (int) $data['redeem_points'];
                $availablePoints = $loyalty->points;
                $pointsToRedeem = min($requestedPoints, $availablePoints);
                $maxDiscountAllowed = intdiv($price['total_minor'] - $discountMinor, 2); // Max 50% discount with points
                $potentialDiscount = $pointsToRedeem * 10; // 1 point = $0.10 (10 cents)
                $loyaltyRedeemedMinor = min($potentialDiscount, $maxDiscountAllowed);
                $pointsToRedeem = intdiv($loyaltyRedeemedMinor, 10);
            }

            $finalTotalMinor = max(0, $price['total_minor'] - $discountMinor - $loyaltyRedeemedMinor);

            // Payment verification
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $failure = ($data['payment_method'] === 'mock_card' && ($data['mock_result'] ?? '') === 'failure')
                ? 'The simulated card payment was declined. No funds were charged.'
                : null;

            if ($data['payment_method'] === 'wallet' && $wallet->balance_minor < $finalTotalMinor) {
                $failure = 'Insufficient simulated wallet balance.';
            }

            if ($failure) {
                PaymentAttempt::create([
                    'user_id' => $user->id,
                    'inventory_hold_id' => $hold->id,
                    'status' => 'failed',
                    'reason' => $failure,
                ]);
                $user->notify(new TravelNotice('Simulated payment failed', $failure));
                AdminNotificationService::notifyAdmins(
                    'Simulated Payment Failed',
                    'Payment attempt failed for user ' . $user->name . ' (' . $user->email . '): ' . $failure,
                    'payment_failed',
                    '/admin/dashboard',
                    ['user_id' => $user->id, 'hold_id' => $hold->id, 'reason' => $failure]
                );
                AuditService::record($user->id, 'payment.failed', 'inventory_hold', $hold->id);
                $result = ['failure' => $failure];
                $this->remember($user, 'checkout', $data['idempotency_key'], $data, $result);

                return $result;
            }

            // Determine if agent booking or corporate client
            $agentId = $user->role === 'agent' ? $user->id : null;
            $corporateClientId = ! empty($data['corporate_client_id']) ? (int) $data['corporate_client_id'] : null;

            // Create Booking
            $booking = Booking::create([
                'reference' => 'TE-' . Str::upper(Str::random(12)),
                'user_id' => $user->id,
                'agent_id' => $agentId,
                'corporate_client_id' => $corporateClientId,
                'type' => $isHotel ? 'hotel' : 'flight',
                'hotel_id' => $isHotel ? $room->hotel_id : null,
                'status' => 'confirmed',
                'destination' => $destination,
                'travel_at' => $travelAt,
                'subtotal_minor' => $price['subtotal_minor'],
                'tax_minor' => $price['tax_minor'],
                'discount_minor' => $discountMinor,
                'loyalty_redeemed_minor' => $loyaltyRedeemedMinor,
                'total_minor' => $finalTotalMinor,
                'currency' => 'USD',
                'promotion_id' => $promotion?->id,
                'cancellation_policy' => $cancellationPolicy,
            ]);

            // Create passengers
            $booking->passengers()->createMany($data['passengers']);

            if ($isHotel) {
                // Create BookingRoom
                $start = Carbon::parse($hold->check_in);
                $end = Carbon::parse($hold->check_out);
                BookingRoom::create([
                    'booking_id' => $booking->id,
                    'room_type_id' => $room->id,
                    'check_in' => $start->toDateString(),
                    'check_out' => $end->toDateString(),
                    'quantity' => $hold->quantity,
                    'price_per_night_minor' => $room->price_per_night_minor,
                    'total_minor' => $finalTotalMinor,
                ]);

                // Decrement room inventory for each date of the stay
                $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();
                foreach ($dates as $date) {
                    RoomInventory::where('room_type_id', $room->id)
                        ->where('inventory_date', $date)
                        ->decrement('available_rooms', $hold->quantity);
                }
            } else {
                // Flight Items & Seats
                $booking->items()->create([
                    'flight_class_id' => $class->id,
                    'quantity' => $hold->quantity,
                    'unit_fare_minor' => $class->fare_minor,
                    'unit_tax_minor' => $class->tax_minor,
                    'snapshot' => [
                        'flight_number' => $class->flight->flight_number,
                        'airline' => $class->flight->airline->name,
                        'origin' => $class->flight->origin,
                        'destination' => $class->flight->destination,
                        'departure_at' => $class->flight->departure_at->toIso8601String(),
                        'arrival_at' => $class->flight->arrival_at->toIso8601String(),
                        'class' => $class->name,
                    ],
                ]);
                $booking->seats()->attach($seats->modelKeys());
                FlightSeat::whereIn('id', $seats->modelKeys())->update([
                    'booking_id' => $booking->id,
                    'inventory_hold_id' => null,
                ]);
            }

            $hold->update(['status' => 'consumed']);

            // Process Payment
            $payment = Payment::create([
                'reference' => (string) Str::uuid(),
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'method' => $data['payment_method'],
                'amount_minor' => $finalTotalMinor,
            ]);

            PaymentAttempt::create([
                'user_id' => $user->id,
                'inventory_hold_id' => $hold->id,
                'status' => 'successful',
            ]);

            if ($data['payment_method'] === 'wallet') {
                $this->walletEntry($wallet, -$finalTotalMinor, 'payment', $booking->id);
            }

            // Record Promotion Usage
            if ($promotion && $discountMinor > 0) {
                PromotionUsage::create([
                    'promotion_id' => $promotion->id,
                    'user_id' => $user->id,
                    'booking_id' => $booking->id,
                    'discount_minor' => $discountMinor,
                ]);
                $promotion->increment('times_used');
            }

            // Deduct redeemed loyalty points
            if ($pointsToRedeem > 0) {
                $loyalty->decrement('points', $pointsToRedeem);
                LoyaltyTransaction::create([
                    'loyalty_account_id' => $loyalty->id,
                    'booking_id' => $booking->id,
                    'type' => 'redeemed',
                    'points' => -$pointsToRedeem,
                ]);
            }

            // Award Loyalty Points for new spend (1 pt per $10)
            $earnedPoints = intdiv($finalTotalMinor, 1000);
            if ($earnedPoints > 0) {
                $loyalty->increment('points', $earnedPoints);
                LoyaltyTransaction::create([
                    'loyalty_account_id' => $loyalty->id,
                    'booking_id' => $booking->id,
                    'type' => 'earned',
                    'points' => $earnedPoints,
                ]);
            }

            // Calculate Agent Commission if agent booking
            if ($agentId) {
                $commissionRate = (float) (DB::table('agent_profiles')->where('user_id', $agentId)->value('commission_rate') ?: 5.00);
                $commissionMinor = (int) round(($finalTotalMinor * $commissionRate) / 100);
                AgentCommission::create([
                    'agent_id' => $agentId,
                    'booking_id' => $booking->id,
                    'amount_minor' => $commissionMinor,
                    'status' => 'earned',
                ]);
            }

            // Standard Travel Documents Checklist
            foreach (['Passport or government identification', 'Visa requirements checked', 'Travel insurance reviewed'] as $name) {
                $booking->documents()->create(['name' => $name]);
            }

            DB::table('booking_status_history')->insert([
                'booking_id' => $booking->id,
                'status' => 'confirmed',
                'created_at' => now(),
            ]);

            AuditService::record($user->id, 'booking.confirmed', 'booking', $booking->id, ['payment_id' => $payment->id]);
            $user->notify(new TravelNotice('Simulated booking confirmed', 'Your demonstration reservation ' . $booking->reference . ' is ready.', $booking->id));
            AdminNotificationService::notifyAdmins(
                'New ' . ucfirst($booking->type) . ' Booking (' . $booking->reference . ')',
                'User ' . $user->name . ' (' . $user->email . ') confirmed a ' . $booking->type . ' booking (' . $booking->reference . ') for $' . number_format($booking->total_minor / 100, 2) . ' to ' . ($booking->destination ?? 'Platform Services') . '.',
                'booking',
                '/admin/dashboard',
                ['booking_id' => $booking->id, 'reference' => $booking->reference, 'customer_id' => $user->id, 'total_minor' => $booking->total_minor, 'type' => $booking->type]
            );

            $result = ['booking_id' => $booking->id];
            $this->remember($user, 'checkout', $data['idempotency_key'], $data, $result);

            return $result;
        }, 3);
    }

    private function walletEntry(Wallet $wallet, int $amount, string $type, ?int $bookingId = null): WalletTransaction
    {
        $balance = $wallet->balance_minor + $amount;
        abort_if($balance < 0, 422, 'Insufficient wallet balance.');
        $wallet->update(['balance_minor' => $balance]);

        return WalletTransaction::create([
            'reference' => (string) Str::uuid(),
            'wallet_id' => $wallet->id,
            'booking_id' => $bookingId,
            'type' => $type,
            'amount_minor' => $amount,
            'balance_after_minor' => $balance,
        ]);
    }

    public function topUp(User $user, array $data): array
    {
        return DB::transaction(function () use ($user, $data): array {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            if ($result = $this->replay($user, 'wallet_topup', $data['idempotency_key'], $data)) {
                return $result;
            }
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $tx = $this->walletEntry($wallet, $data['amount_minor'], 'simulated_topup');
            AuditService::record($user->id, 'wallet.simulated_topup', 'wallet_transaction', $tx->id);
            $result = ['transaction_id' => $tx->id, 'balance_minor' => $tx->balance_after_minor, 'simulated' => true];
            $this->remember($user, 'wallet_topup', $data['idempotency_key'], $data, $result);

            return $result;
        }, 3);
    }

    public function cancellationQuote(Booking $booking): array
    {
        $eligible = $booking->status === 'confirmed' && now()->lt($booking->travel_at->subHours($booking->cancellation_policy['hours']));
        $fee = intdiv($booking->total_minor * $booking->cancellation_policy['fee_percent'] + 99, 100);

        return [
            'eligible' => $eligible,
            'deadline' => $booking->travel_at->subHours($booking->cancellation_policy['hours'])->toIso8601String(),
            'fee_minor' => $fee,
            'refund_minor' => max(0, $booking->total_minor - $fee),
            'refund_method' => 'simulated_wallet',
        ];
    }

    public function cancel(User $user, Booking $booking): Booking
    {
        abort_unless($booking->user_id === $user->id, 403);

        return DB::transaction(function () use ($user, $booking): Booking {
            User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $booking = Booking::whereKey($booking->id)->lockForUpdate()->firstOrFail();
            if ($booking->status === 'cancelled') {
                return $booking;
            }
            $quote = $this->cancellationQuote($booking);
            abort_unless($quote['eligible'], 422, 'The cancellation deadline has passed.');

            $booking->update(['status' => 'cancelled']);

            // Restore Flight Seats
            FlightSeat::where('booking_id', $booking->id)->update(['booking_id' => null]);

            // Restore Hotel Room Inventory
            if ($booking->rooms()->exists()) {
                foreach ($booking->rooms as $bookingRoom) {
                    $start = Carbon::parse($bookingRoom->check_in);
                    $end = Carbon::parse($bookingRoom->check_out);
                    $dates = collect(CarbonPeriod::create($start, $end->copy()->subDay()))->map->toDateString();
                    foreach ($dates as $date) {
                        RoomInventory::where('room_type_id', $bookingRoom->room_type_id)
                            ->where('inventory_date', $date)
                            ->increment('available_rooms', $bookingRoom->quantity);
                    }
                }
            }

            // Reverse Agent Commission if present
            AgentCommission::where('booking_id', $booking->id)->update(['status' => 'cancelled']);

            // Record cancellation request and refund
            CancellationRequest::create([
                'booking_id' => $booking->id,
                'user_id' => $user->id,
                'fee_minor' => $quote['fee_minor'],
            ]);

            Refund::create([
                'reference' => (string) Str::uuid(),
                'booking_id' => $booking->id,
                'payment_id' => $booking->payment->id,
                'amount_minor' => $quote['refund_minor'],
            ]);

            // Refund to simulated wallet
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $this->walletEntry($wallet, $quote['refund_minor'], 'refund', $booking->id);

            // Reverse awarded loyalty points
            $loyalty = LoyaltyAccount::where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $earned = (int) LoyaltyTransaction::where(['booking_id' => $booking->id, 'type' => 'earned'])->value('points');
            if ($earned > 0) {
                $loyalty->decrement('points', $earned);
                LoyaltyTransaction::create([
                    'loyalty_account_id' => $loyalty->id,
                    'booking_id' => $booking->id,
                    'type' => 'reversed',
                    'points' => -$earned,
                ]);
            }

            // Restore redeemed loyalty points
            $redeemed = (int) abs((int) LoyaltyTransaction::where(['booking_id' => $booking->id, 'type' => 'redeemed'])->value('points'));
            if ($redeemed > 0) {
                $loyalty->increment('points', $redeemed);
                LoyaltyTransaction::create([
                    'loyalty_account_id' => $loyalty->id,
                    'booking_id' => $booking->id,
                    'type' => 'restored',
                    'points' => $redeemed,
                ]);
            }

            DB::table('booking_status_history')->insert([
                'booking_id' => $booking->id,
                'status' => 'cancelled',
                'created_at' => now(),
            ]);

            AuditService::record($user->id, 'booking.cancelled', 'booking', $booking->id, [
                'refund_minor' => $quote['refund_minor'],
            ]);

            $user->notify(new TravelNotice('Cancellation and simulated refund completed', 'Your refund was credited to your simulated TravelEase wallet.', $booking->id));
            AdminNotificationService::notifyAdmins(
                'Booking Cancelled (' . $booking->reference . ')',
                'Customer ' . $user->name . ' (' . $user->email . ') cancelled booking ' . $booking->reference . '. Simulated refund of $' . number_format($quote['refund_minor'] / 100, 2) . ' credited to customer wallet.',
                'cancellation',
                '/admin/dashboard',
                ['booking_id' => $booking->id, 'reference' => $booking->reference, 'refund_minor' => $quote['refund_minor']]
            );

            return $booking;
        }, 3);
    }
}
