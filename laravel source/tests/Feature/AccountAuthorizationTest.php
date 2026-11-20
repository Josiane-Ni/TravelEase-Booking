<?php

namespace Tests\Feature;

use App\Models\Airline;
use App\Models\Booking;
use App\Models\CorporateClient;
use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\User;
use App\Notifications\TravelNotice;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customers_cannot_view_cancel_download_or_modify_another_booking(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $c = FlightClass::factory()->create();
        $seat = FlightSeat::factory()->create(['flight_class_id' => $c->id]);
        $service = app(BookingService::class);
        $h = $service->hold($owner, ['flight_class_id' => $c->id, 'seat_ids' => [$seat->id]]);
        $result = $service->confirm($owner, ['hold_id' => $h->id, 'passengers' => [['name' => 'Owner Traveler', 'type' => 'adult']], 'payment_method' => 'mock_card', 'mock_result' => 'success', 'idempotency_key' => 'ownership-check-test-key']);
        $b = Booking::findOrFail($result['booking_id']);
        $this->actingAs($other)->getJson('/api/v1/bookings/'.$b->id)->assertForbidden();
        $this->postJson('/api/v1/bookings/'.$b->id.'/cancel')->assertForbidden();
        $this->getJson('/api/v1/bookings/'.$b->id.'/itinerary/pdf')->assertForbidden();
        $this->patchJson('/api/v1/bookings/'.$b->id.'/documents/'.$b->documents()->first()->id, ['available' => true])->assertForbidden();
        $this->postJson('/api/v1/checkout/confirm', ['hold_id' => $h->id, 'passengers' => [['name' => 'Intruder', 'type' => 'adult']], 'payment_method' => 'mock_card', 'mock_result' => 'success', 'idempotency_key' => 'intruder-request-test-key'])->assertForbidden();
    }

    public function test_wallet_funding_is_owned_validated_idempotent_and_audited(): void
    {
        $u = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($u);
        $payload = ['amount_minor' => 50000, 'idempotency_key' => 'wallet-topup-request-key'];
        $this->postJson('/api/v1/wallet/top-up', $payload)->assertOk();
        $this->postJson('/api/v1/wallet/top-up', $payload)->assertOk();
        $this->assertEquals(50000, $u->wallet->balance_minor);
        $this->assertEquals(0, $other->wallet->balance_minor);
        $this->assertDatabaseCount('wallet_transactions', 1);
        $this->postJson('/api/v1/wallet/top-up', [...$payload, 'amount_minor' => 100])->assertStatus(409);
        $this->postJson('/api/v1/wallet/top-up', [...$payload, 'amount_minor' => -1])->assertUnprocessable();
        $this->assertDatabaseHas('audit_logs', ['action' => 'wallet.simulated_topup']);
    }

    public function test_agents_can_only_read_and_edit_their_assigned_clients(): void
    {
        $agent = User::factory()->create(['role' => 'agent']);
        $other = User::factory()->create(['role' => 'agent']);
        $c = CorporateClient::create(['agent_id' => $other->id, 'name' => 'Other client', 'contact_email' => 'other@example.test']);
        $this->actingAs($agent)->getJson('/api/v1/agent/clients')->assertOk()->assertJsonCount(0, 'data.data');
        $this->putJson('/api/v1/agent/clients/'.$c->id, ['name' => 'Stolen', 'contact_email' => 'new@example.test'])->assertForbidden();
        $this->postJson('/api/v1/agent/clients', ['name' => 'My Corporate Client', 'contact_email' => 'client@example.test'])->assertOk();
        $this->assertDatabaseHas('corporate_clients', ['agent_id' => $agent->id, 'name' => 'My Corporate Client']);
    }

    public function test_admin_access_changes_are_guarded_and_audited(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $u = User::factory()->create();
        $this->actingAs($u)->putJson('/api/v1/admin/users/'.$admin->id, ['role' => 'customer', 'status' => 'inactive'])->assertForbidden();
        $this->actingAs($admin)->putJson('/api/v1/admin/users/'.$admin->id, ['role' => 'customer', 'status' => 'inactive'])->assertUnprocessable();
        $this->putJson('/api/v1/admin/users/'.$u->id, ['role' => 'agent', 'status' => 'active'])->assertOk()->assertJsonPath('data.role', 'agent');
        $this->assertDatabaseHas('audit_logs', ['action' => 'user.access_updated', 'resource_id' => $u->id]);
    }

    public function test_notification_reads_enforce_ownership(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $owner->notify(new TravelNotice('Example', 'Private update'));
        $id = $owner->notifications()->first()->id;
        $this->actingAs($other)->patchJson('/api/v1/notifications/'.$id.'/read')->assertNotFound();
        $this->actingAs($owner)->patchJson('/api/v1/notifications/'.$id.'/read')->assertOk();
        $this->getJson('/api/v1/notifications')->assertJsonPath('unread_count', 0);
    }

    public function test_admin_flight_creation_creates_seats_and_validates_dates(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $airline = Airline::factory()->create();
        $this->actingAs($admin);
        $data = ['airline_id' => $airline->id, 'flight_number' => 'TE123', 'origin' => 'Kigali', 'destination' => 'London', 'departure_at' => now()->addDays(4)->toIso8601String(), 'arrival_at' => now()->addDays(4)->addHours(8)->toIso8601String(), 'fare_minor' => 30000, 'tax_minor' => 4000, 'capacity' => 12, 'cancellation_hours' => 24, 'cancellation_fee_percent' => 10];
        $r = $this->postJson('/api/v1/admin/flights', $data)->assertSuccessful();
        $this->assertDatabaseCount('flight_seats', 12);
        $this->putJson('/api/v1/admin/flights/'.$r->json('data.id'), [...$data, 'fare_minor' => 35000])->assertSuccessful()->assertJsonPath('data.classes.0.fare_minor', 35000);
        $this->deleteJson('/api/v1/admin/flights/'.$r->json('data.id'))->assertOk();
        $this->getJson('/api/v1/flights')->assertJsonCount(0, 'data');
    }

    public function test_contact_messages_are_validated_and_saved(): void
    {
        $this->postJson('/api/v1/contact', ['email' => 'invalid'])->assertUnprocessable();
        $this->postJson('/api/v1/contact', ['name' => 'Visitor', 'email' => 'visitor@example.test', 'subject' => 'A question', 'message' => 'I would like to know more.'])->assertCreated();
        $this->assertDatabaseHas('contact_messages', ['subject' => 'A question']);
    }

    public function test_dashboards_use_actual_database_data(): void
    {
        $u = User::factory()->create();
        $this->actingAs($u)->getJson('/api/v1/customer/dashboard')->assertOk()->assertJsonPath('data.metrics.total_bookings', 0)->assertJsonPath('data.wallet.balance_minor', 0);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->getJson('/api/v1/admin/dashboard')->assertOk()->assertJsonPath('data.metrics.total_bookings', 0)->assertJsonPath('data.metrics.net_revenue_minor', 0);
    }

    public function test_business_class_holds_also_block_schedule_changes_and_deactivation(): void
    {
        $customer = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $economy = FlightClass::factory()->create();
        $business = FlightClass::factory()->create(['flight_id' => $economy->flight_id, 'name' => 'Business']);
        FlightSeat::factory()->create(['flight_class_id' => $economy->id]);
        $seat = FlightSeat::factory()->create(['flight_class_id' => $business->id]);
        app(BookingService::class)->hold($customer, ['flight_class_id' => $business->id, 'seat_ids' => [$seat->id]]);
        $flight = $economy->flight;
        $this->actingAs($admin);
        $payload = ['airline_id' => $flight->airline_id, 'flight_number' => $flight->flight_number, 'origin' => $flight->origin, 'destination' => 'London', 'departure_at' => $flight->departure_at->toIso8601String(), 'arrival_at' => $flight->arrival_at->toIso8601String(), 'fare_minor' => 10000, 'tax_minor' => 1000, 'capacity' => 1, 'cancellation_hours' => 24, 'cancellation_fee_percent' => 10];
        $this->putJson('/api/v1/admin/flights/'.$flight->id, $payload)->assertStatus(409);
        $this->deleteJson('/api/v1/admin/flights/'.$flight->id)->assertStatus(409);
        $this->assertSame('Nairobi', $flight->fresh()->destination);
        $this->assertSame('scheduled', $flight->fresh()->status);
    }
}
