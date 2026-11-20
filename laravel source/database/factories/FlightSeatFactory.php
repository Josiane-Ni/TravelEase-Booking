<?php

namespace Database\Factories;

use App\Models\FlightClass;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightSeatFactory extends Factory
{
    public function definition(): array
    {
        return ['flight_class_id' => FlightClass::factory(), 'number' => fake()->unique()->numerify('##').'A'];
    }
}
