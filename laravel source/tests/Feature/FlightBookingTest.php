<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\InventoryHold;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlightBookingTest extends TestCase
{
    use RefreshDatabase;

    private function inventory(int $count = 2): FlightClass
    {
        $c = FlightClass::factory()->create();
        for ($i = 0; $i < $count; $i++) {
            FlightSeat::factory()->create(['flight_class_id' => $c->id, 'number' => ($i + 1).'A']);
        }

return $c;
    }

    private function hold(User $u, FlightClass $c): InventoryHold
    {
        return app(BookingService::class)->hold($u, ['flight_class_id' => $c->id, 'seat_ids' => [$c->seats()->first()->id]]);
    }

    private function payload(InventoryHold $h, array $override = []): array
    {
        return array_replace(['hold_id' => $h->id, 'passengers' => [['name' => 'Avery Traveler', 'type' => 'adult']], 'payment_method' => 'mock_card', 'mock_result' => 'success', 'idempotency_key' => 'booking-request-key-12345'], $override);
    }

    public function test_search_filters_dates_prices_destination_and_available_seats(): void
    {
        $c = $this->inventory();
        $this->getJson('/api/v1/flights?destination=Nairobi&max_price=11000')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/flights?destination=Paris')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/flights?max_price=100')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/flights?departure_date='.now()->addDays(8)->toDateString())->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/flights?passengers=3')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/flights?departure_date=invalid')->assertUnprocessable();
    }

    public function test_holds_prevent_duplicate_seats_and_release_restores_availability(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $other = User::factory()->create();
        $hold = $this->hold($u, $c);
        $seat = $c->seats()->first();
        $this->actingAs($other)->postJson('/api/v1/checkout/holds', ['flight_class_id' => $c->id, 'seat_ids' => [$seat->id]])->assertStatus(409);
        $this->getJson('/api/v1/flights?passengers=2')->assertJsonCount(0, 'data');
        $this->deleteJson('/api/v1/checkout/holds/'.$hold->id)->assertForbidden();
        $this->actingAs($u)->deleteJson('/api/v1/checkout/holds/'.$hold->id)->assertOk();
        $this->getJson('/api/v1/flights?passengers=2')->assertJsonCount(1, 'data');
    }

    public function test_confirmation_persists_all_components_and_retries_are_idempotent(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $payload = $this->payload($h);
        $r = $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $payload)->assertSuccessful()->assertJsonPath('data.total_minor', 11000)->assertJsonPath('data.status', 'confirmed');
        $this->postJson('/api/v1/checkout/confirm', $payload)->assertSuccessful()->assertJsonPath('data.id', $r->json('data.id'));
        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseCount('booking_passengers', 1);
        $this->assertDatabaseCount('booking_seats', 1);
        $this->assertDatabaseCount('travel_documents', 3);
        $this->assertDatabaseCount('notifications', 1);
        $this->assertEquals(11, $u->loyaltyAccount->points);
        $this->postJson('/api/v1/checkout/confirm', [...$payload, 'passengers' => [['name' => 'Changed Name', 'type' => 'adult']]])->assertStatus(409);
    }

    public function test_price_tampering_is_rejected(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $this->payload($h, ['total_minor' => 1]))->assertUnprocessable();
        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_failed_payment_is_retry_safe_and_preserves_inventory_and_balances(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $payload = $this->payload($h, ['mock_result' => 'failure']);
        $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $payload)->assertUnprocessable();
        $this->postJson('/api/v1/checkout/confirm', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('bookings', 0);
        $this->assertDatabaseCount('payments', 0);
        $this->assertDatabaseCount('payment_attempts', 1);
        $this->assertEquals(0, $u->wallet->balance_minor);
        $this->assertSame('active', $h->fresh()->status);
        $this->postJson('/api/v1/checkout/confirm', $this->payload($h, ['idempotency_key' => 'new-successful-retry-key']))->assertSuccessful();
    }

    public function test_insufficient_wallet_balance_does_not_confirm_booking(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $this->payload($h, ['payment_method' => 'wallet']))->assertUnprocessable();
        $this->assertDatabaseCount('bookings', 0);
        $this->assertEquals(0, $u->wallet->balance_minor);
    }

    public function test_wallet_payment_and_cancellation_refund_are_atomic_and_not_duplicated(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $u->wallet->update(['balance_minor' => 20000]);
        $h = $this->hold($u, $c);
        $this->actingAs($u);
        $r = $this->postJson('/api/v1/checkout/confirm', $this->payload($h, ['payment_method' => 'wallet']))->assertSuccessful();
        $id = $r->json('data.id');
        $this->assertEquals(9000, $u->wallet->fresh()->balance_minor);
        $this->postJson('/api/v1/bookings/'.$id.'/cancellation-quote')->assertOk()->assertJsonPath('data.refund_minor', 9900);
        $this->postJson('/api/v1/bookings/'.$id.'/cancel')->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->postJson('/api/v1/bookings/'.$id.'/cancel')->assertOk();
        $this->assertDatabaseCount('refunds', 1);
        $this->assertDatabaseCount('cancellation_requests', 1);
        $this->assertEquals(18900, $u->wallet->fresh()->balance_minor);
        $this->assertEquals(0, $u->loyaltyAccount->fresh()->points);
        $this->assertDatabaseCount('wallet_transactions', 2);
        $this->assertNull($c->seats()->first()->booking_id);
    }

    public function test_expired_holds_and_wrong_passenger_count_are_rejected(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $this->payload($h, ['passengers' => [['name' => 'One', 'type' => 'adult'], ['name' => 'Two', 'type' => 'adult']]]))->assertUnprocessable();
        $h->update(['expires_at' => now()->subMinute()]);
        $this->postJson('/api/v1/checkout/confirm', $this->payload($h))->assertStatus(409);
        $this->assertDatabaseCount('bookings', 0);
        $this->artisan('travel:expire-holds')->assertSuccessful();
        $this->assertSame('expired', $h->fresh()->status);
        $this->assertNull($c->seats()->first()->inventory_hold_id);
    }

    public function test_cancellation_deadline_blocks_late_cancellation(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $r = $this->actingAs($u)->postJson('/api/v1/checkout/confirm', $this->payload($h));
        $id = $r->json('data.id');
        Booking::findOrFail($id)->update(['travel_at' => now()->addHour()]);
        $this->postJson('/api/v1/bookings/'.$id.'/cancel')->assertUnprocessable();
        $this->assertDatabaseCount('refunds', 0);
    }

    public function test_document_updates_and_private_pdf_download(): void
    {
        $c = $this->inventory();
        $u = User::factory()->create();
        $h = $this->hold($u, $c);
        $b = app(BookingService::class)->confirm($u, $this->payload($h));
        $booking = Booking::findOrFail($b['booking_id']);
        $doc = $booking->documents()->first();
        $this->actingAs($u)->patchJson('/api/v1/bookings/'.$booking->id.'/documents/'.$doc->id, ['available' => true])->assertOk();
        $this->assertTrue($doc->fresh()->available);
        $response = $this->get('/api/v1/bookings/'.$booking->id.'/itinerary/pdf')->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_seats_from_another_class_are_rejected(): void
    {
        $c = $this->inventory();
        $other = $this->inventory();
        $u = User::factory()->create();
        $this->actingAs($u)->postJson('/api/v1/checkout/holds',['flight_class_id' => $c->id, 'seat_ids' => [$other->seats()->first()->id]])->assertUnprocessable();
    }
}
