<?php

namespace Database\Factories;

use App\Models\Airline;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightFactory extends Factory
{
    public function definition(): array
    {
        return ['airline_id' => Airline::factory(), 'flight_number' => fake()->unique()->bothify('TE###??'), 'origin' => 'Kigali', 'destination' => 'Nairobi', 'departure_at' => now()->addDays(5), 'arrival_at' => now()->addDays(5)->addHours(2), 'status' => 'scheduled', 'cancellation_hours' => 24, 'cancellation_fee_percent' => 10];
    }
}
