<?php

namespace Database\Factories;

use App\Models\Flight;
use Illuminate\Database\Eloquent\Factories\Factory;

class FlightClassFactory extends Factory
{
    public function definition(): array
    {
        return ['flight_id' => Flight::factory(), 'name' => 'Economy', 'fare_minor' => 10000, 'tax_minor' => 1000];
    }
}
