<?php

namespace Tests\Feature;

use App\Models\Hotel;
use App\Models\Package;
use App\Models\Promotion;
use App\Models\RoomType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TravelExtendedTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_hotels_and_view_details(): void
    {
        $hotel = Hotel::create([
            'name' => 'Kigali Test Hotel',
            'city' => 'Kigali',
            'stars' => 5,
            'description' => 'Test Hotel Description',
            'amenities' => ['WiFi', 'Pool'],
            'status' => 'active',
        ]);

        $room = $hotel->roomTypes()->create([
            'name' => 'Deluxe Suite',
            'price_per_night_minor' => 15000,
            'capacity' => 2,
            'total_rooms' => 5,
        ]);

        $response = $this->getJson('/api/v1/hotels');
        $response->assertOk()->assertJsonFragment(['name' => 'Kigali Test Hotel']);

        $detailResponse = $this->getJson("/api/v1/hotels/{$hotel->id}");
        $detailResponse->assertOk()->assertJsonFragment(['name' => 'Deluxe Suite']);
    }

    public function test_can_list_packages_and_customize(): void
    {
        $package = Package::create([
            'title' => 'Dubai Getaway',
            'destination' => 'Dubai',
            'duration_days' => 5,
            'description' => 'Test Package',
            'discount_percent' => 15,
            'base_price_minor' => 100000,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/packages');
        $response->assertOk()->assertJsonFragment(['title' => 'Dubai Getaway']);

        $customResponse = $this->postJson("/api/v1/packages/{$package->id}/customize", [
            'passengers' => 2,
        ]);
        $customResponse->assertOk()
            ->assertJsonPath('data.original_total_minor', 200000)
            ->assertJsonPath('data.discount_minor', 30000)
            ->assertJsonPath('data.final_total_minor', 170000);
    }

    public function test_can_validate_promotion_code(): void
    {
        Promotion::create([
            'code' => 'SAVE10',
            'title' => 'Save 10 Percent',
            'discount_type' => 'percentage',
            'discount_value' => 10,
            'min_spend_minor' => 5000,
            'max_discount_minor' => 2000,
            'start_date' => now()->subDay()->toDateString(),
            'expiry_date' => now()->addDays(30)->toDateString(),
            'usage_limit' => 100,
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/promotions/validate', [
            'code' => 'SAVE10',
            'amount_minor' => 15000,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.code', 'SAVE10')
            ->assertJsonPath('data.discount_minor', 1500);
    }

    public function test_admin_can_access_reports_overview_and_fraud(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/reports/overview');
        $response->assertOk()->assertJsonStructure([
            'data' => [
                'metrics',
                'flight_occupancy',
                'hotel_occupancy',
                'destinations',
            ],
        ]);

        $fraudResponse = $this->actingAs($admin)->getJson('/api/v1/admin/fraud');
        $fraudResponse->assertOk();
    }
}
