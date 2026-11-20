<?php

namespace Database\Seeders;

use App\Models\AgentCommission;
use App\Models\AgentProfile;
use App\Models\Airline;
use App\Models\CancellationPolicy;
use App\Models\CorporateClient;
use App\Models\Flight;
use App\Models\FraudFlag;
use App\Models\Hotel;
use App\Models\Package;
use App\Models\Promotion;
use App\Models\RoomType;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Database\Seeder;

class TravelEaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local', 'testing') || ! config('travelease.demo_password')) {
            $this->command?->warn('Demo seeding requires local/testing and TRAVELEASE_DEMO_PASSWORD.');

            return;
        }
        $roles = ['admin' => 1, 'agent' => 3, 'customer' => 10];
        foreach ($roles as $role => $count) {
            for ($i = 1; $i <= $count; $i++) {
                $email = $role.($i === 1 ? '' : $i).'@travelease.test';
                $user = User::firstOrCreate(['email' => $email], ['name' => match ($role) {
                    'admin' => 'Alex Morgan', 'agent' => 'Sarah Williams', default => 'James Anderson'
                }.($i === 1 ? '' : ' '.$i), 'phone' => '+250788000'.str_pad((string) $i, 3, '0', STR_PAD_LEFT), 'password' => config('travelease.demo_password'), 'terms_accepted_at' => now(), 'email_verified_at' => now()]);
                $user->forceFill(['email_verified_at' => now()]);
                if ($user->wasRecentlyCreated) {
                    $user->forceFill(['role' => $role]);
                }
                $user->save();
                $user->wallet()->firstOrCreate([], ['balance_minor' => 0]);
                $user->loyaltyAccount()->firstOrCreate([], ['points' => 0]);
                if ($role === 'agent') {
                    AgentProfile::firstOrCreate(['user_id' => $user->id], [
                        'agency_name' => 'Elite Travel Solutions '.$i,
                        'commission_rate' => 5.00,
                        'status' => 'active',
                    ]);
                    CorporateClient::firstOrCreate(['agent_id' => $user->id, 'name' => 'Kigali Corporate Travel '.$i], ['contact_email' => 'office'.$i.'@example.test', 'phone' => '+250788100100']);
                }
            }
        }

        // Airlines
        foreach ([['RwandAir', 'WB'], ['Kenya Airways', 'KQ'], ['Qatar Airways', 'QR'], ['Emirates', 'EK'], ['Ethiopian Airlines', 'ET']] as [$name, $code]) {
            Airline::firstOrCreate(['code' => $code], ['name' => $name]);
        }
        $airlines = Airline::orderBy('id')->get();
        $destinations = ['Nairobi', 'Dubai', 'Paris', 'London', 'Entebbe', 'Dar es Salaam'];
        for ($i = 0; $i < 20; $i++) {
            $airline = $airlines[$i % 5];
            $departure = now()->startOfDay()->addDays(3 + $i)->setHour(8 + $i % 10);
            $flight = Flight::firstOrCreate(['flight_number' => $airline->code.(400 + $i)], ['airline_id' => $airline->id, 'origin' => 'Kigali', 'destination' => $destinations[$i % 6], 'departure_at' => $departure, 'arrival_at' => $departure->copy()->addHours(2 + $i % 7), 'status' => 'scheduled', 'cancellation_hours' => 24, 'cancellation_fee_percent' => 10]);
            foreach (['Economy' => [24000 + $i * 1500, 2500, 30], 'Business' => [74000 + $i * 2000, 5000, 12]] as $name => [$fare, $tax, $capacity]) {
                $class = $flight->classes()->firstOrCreate(['name' => $name], ['fare_minor' => $fare, 'tax_minor' => $tax]);
                for ($s = 0; $s < $capacity; $s++) {
                    $class->seats()->firstOrCreate(['number' => (intdiv($s, 6) + 1).chr(65 + $s % 6)]);
                }
            }
        }

        // Hotels & Room Types
        $hotelData = [
            ['Kigali Serena Hotel', 'Kigali', 5, 'Luxury 5-star haven featuring landscaped gardens, outdoor swimming pool, exquisite dining and world-class spa facilities.', ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Airport Shuttle', 'Bar'], '/images/ocean.jpg', 'Boulevard de la Revolution, Kigali', 48, 15],
            ['Kigali Marriott Hotel', 'Kigali', 5, 'Centrally located luxury hotel offering modern rooms, fitness center, Italian restaurant, and scenic valley views.', ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Room Service'], '/images/mountains.jpg', 'KN 3 Ave, Nyarugenge, Kigali', 48, 15],
            ['Atlantis The Palm', 'Dubai', 5, 'Iconic luxury resort located on Palm Jumeirah with private sandy beaches, Aquaventure waterpark, and gourmet restaurants.', ['WiFi', 'Pool', 'Spa', 'Gym', 'Beach Access', 'Restaurant', 'Water Park'], '/images/ocean.jpg', 'Crescent Rd, The Palm Jumeirah, Dubai', 72, 20],
            ['JW Marriott Marquis Dubai', 'Dubai', 5, 'One of the tallest luxury hotels in the world, featuring panoramic skyline views, award-winning spa, and 14 dining venues.', ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Airport Shuttle'], '/images/mountains.jpg', 'Sheikh Zayed Rd, Business Bay, Dubai', 48, 15],
            ['Hotel Le Meurice', 'Paris', 5, 'The height of French palace elegance opposite the Tuileries Garden, blending 18th-century opulence with contemporary chic.', ['WiFi', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'], '/images/mountains.jpg', '228 Rue de Rivoli, 75001 Paris', 72, 20],
            ['Pullman Paris Tour Eiffel', 'Paris', 4, 'Contemporary 4-star hotel located right next to the Eiffel Tower, offering bright rooms with tower views and fitness center.', ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Room Service'], '/images/ocean.jpg', '18 Avenue De Suffren, 75015 Paris', 48, 10],
            ['Villa Rosa Kempinski', 'Nairobi', 5, 'A luxury grand European hotel in Westlands with lavish spa treatments, outdoor heated pool, and bespoke luxury dining.', ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Airport Shuttle'], '/images/ocean.jpg', 'Chiromo Rd, Nairobi', 48, 15],
            ['Zanzibar Serena Hotel', 'Zanzibar', 5, 'Stunning beachfront retreat in historic Stone Town featuring traditional Swahili architecture and ocean-view dining.', ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Bar', 'Spa'], '/images/ocean.jpg', 'Stone Town, Zanzibar', 48, 15],
        ];

        foreach ($hotelData as [$name, $city, $stars, $desc, $amenities, $img, $address, $cancHours, $cancFee]) {
            $hotel = Hotel::firstOrCreate(['name' => $name], [
                'city' => $city,
                'stars' => $stars,
                'description' => $desc,
                'amenities' => $amenities,
                'image_path' => $img,
                'address' => $address,
                'cancellation_hours' => $cancHours,
                'cancellation_fee_percent' => $cancFee,
                'status' => 'active',
            ]);

            $roomTypes = [
                ['Deluxe King Room', 'Spacious king bedroom with city or ocean views, marble bathroom, and premium amenities.', 15000 + $stars * 2000, 2, 12, ['King Bed', 'AC', 'Mini-bar', 'Safe', 'HDTV']],
                ['Executive Suite', 'Luxurious two-room suite with private lounge area, panoramic terrace, and exclusive club access.', 32000 + $stars * 4000, 3, 6, ['King Bed', 'Lounge', 'Jacuzzi', 'Balcony', 'Butler Service']],
                ['Standard Twin Room', 'Comfortable twin bedding ideal for friends or colleagues with dedicated work desk.', 11000 + $stars * 1500, 2, 10, ['2 Single Beds', 'AC', 'Work Desk', 'WiFi']],
            ];

            foreach ($roomTypes as [$rName, $rDesc, $rPrice, $rCap, $rQty, $rAmenities]) {
                $roomType = $hotel->roomTypes()->firstOrCreate(['name' => $rName], [
                    'description' => $rDesc,
                    'price_per_night_minor' => $rPrice,
                    'capacity' => $rCap,
                    'total_rooms' => $rQty,
                    'amenities' => $rAmenities,
                    'image_path' => $img,
                ]);

                // Seed daily inventory for next 60 days
                for ($d = 0; $d < 60; $d++) {
                    $date = now()->startOfDay()->addDays($d)->toDateString();
                    $roomType->inventories()->firstOrCreate(['inventory_date' => $date], [
                        'available_rooms' => $rQty,
                    ]);
                }
            }
        }

        // Holiday Packages
        $dubaiFlight = Flight::where('destination', 'Dubai')->first();
        $dubaiHotel = Hotel::where('city', 'Dubai')->first();
        $dubaiRoom = $dubaiHotel ? $dubaiHotel->roomTypes()->first() : null;

        $parisFlight = Flight::where('destination', 'Paris')->first();
        $parisHotel = Hotel::where('city', 'Paris')->first();
        $parisRoom = $parisHotel ? $parisHotel->roomTypes()->first() : null;

        $nairobiFlight = Flight::where('destination', 'Nairobi')->first();
        $nairobiHotel = Hotel::where('city', 'Nairobi')->first();
        $nairobiRoom = $nairobiHotel ? $nairobiHotel->roomTypes()->first() : null;

        $packageData = [
            [
                'Dubai Luxury Flight & Beachfront Retreat',
                'Dubai',
                5,
                'Experience world-class luxury in Dubai with round-trip flight from Kigali, 5 nights at an iconic resort, daily buffet breakfast, and private desert safari excursion.',
                ['Return Economy Flights', '5 Nights 5-Star Hotel Stay', 'Daily Gourmet Breakfast', 'Airport Luxury Transfers', 'Desert Safari Tour'],
                ['Visa processing fees', 'Personal travel insurance', 'City tourism dirham fee'],
                15,
                145000,
                '/images/ocean.jpg',
                $dubaiFlight?->id,
                $dubaiHotel?->id,
                $dubaiRoom?->id,
            ],
            [
                'Romantic Paris City & Eiffel Experience',
                'Paris',
                6,
                'Indulge in French sophistication with flights, 6 nights near the Seine, Seine dinner cruise, Louvre museum skip-the-line passes, and daily croissants.',
                ['Return Flight from Kigali', '6 Nights Luxury Hotel', 'Seine River Dinner Cruise', 'Louvre Museum Priority Passes', 'Daily Breakfast'],
                ['Schengen visa fees', 'Personal dining outside itinerary', 'Hotel city tax'],
                20,
                185000,
                '/images/mountains.jpg',
                $parisFlight?->id,
                $parisHotel?->id,
                $parisRoom?->id,
            ],
            [
                'Nairobi Safari & City Escape',
                'Nairobi',
                4,
                'Quick scenic escape featuring return flights, luxury stay at Villa Rosa Kempinski, Nairobi National Park game drive, and Giraffe Centre visit.',
                ['Return Flights Kigali-Nairobi', '4 Nights 5-Star Hotel Stay', 'National Park Half-Day Game Drive', 'Giraffe Centre Entry', 'Airport Chauffeur'],
                ['Travel insurance', 'Alcoholic beverages', 'Gratuities'],
                10,
                88000,
                '/images/ocean.jpg',
                $nairobiFlight?->id,
                $nairobiHotel?->id,
                $nairobiRoom?->id,
            ],
        ];

        foreach ($packageData as [$title, $dest, $dur, $desc, $inc, $exc, $disc, $basePrice, $img, $fId, $hId, $rId]) {
            $pkg = Package::firstOrCreate(['title' => $title], [
                'destination' => $dest,
                'duration_days' => $dur,
                'description' => $desc,
                'inclusions' => $inc,
                'exclusions' => $exc,
                'discount_percent' => $disc,
                'base_price_minor' => $basePrice,
                'image_path' => $img,
                'status' => 'active',
            ]);

            if ($fId) {
                $pkg->components()->firstOrCreate(['component_type' => 'flight', 'flight_id' => $fId]);
            }
            if ($hId && $rId) {
                $pkg->components()->firstOrCreate(['component_type' => 'hotel', 'hotel_id' => $hId, 'room_type_id' => $rId]);
            }
        }

        // Promotions
        $promos = [
            ['WELCOME10', 'Welcome Discount for New Travelers', 'percentage', 10, 10000, 5000, 500],
            ['TRAVEL50', '$50 Off on Bookings Over $250', 'fixed', 5000, 25000, 5000, 200],
            ['SUMMER20', 'Summer Getaway 20% Off', 'percentage', 20, 30000, 10000, 100],
            ['EARLYBIRD', 'Early Bird Booking 15% Savings', 'percentage', 15, 15000, 6000, 150],
        ];

        foreach ($promos as [$code, $title, $type, $val, $minSpend, $maxDisc, $limit]) {
            Promotion::firstOrCreate(['code' => $code], [
                'title' => $title,
                'discount_type' => $type,
                'discount_value' => $val,
                'min_spend_minor' => $minSpend,
                'max_discount_minor' => $maxDisc,
                'start_date' => now()->subDays(10)->toDateString(),
                'expiry_date' => now()->addDays(90)->toDateString(),
                'usage_limit' => $limit,
                'times_used' => 0,
                'status' => 'active',
            ]);
        }

        // Cancellation Policies
        CancellationPolicy::firstOrCreate(['service_type' => 'flight', 'policy_name' => 'Standard Airline Cancellation Policy'], [
            'rules' => ['deadline_hours' => 24, 'fee_percent' => 10, 'description' => 'Cancellations made 24 hours prior to flight departure are refunded to wallet minus a 10% administrative fee.'],
            'status' => 'active',
        ]);
        CancellationPolicy::firstOrCreate(['service_type' => 'hotel', 'policy_name' => 'Standard Hotel Cancellation Policy'], [
            'rules' => ['deadline_hours' => 48, 'fee_percent' => 15, 'description' => 'Cancellations made 48 hours prior to check-in are refunded to wallet minus a 15% cancellation fee.'],
            'status' => 'active',
        ]);
        CancellationPolicy::firstOrCreate(['service_type' => 'package', 'policy_name' => 'Holiday Package Flexible Cancellation'], [
            'rules' => ['deadline_hours' => 72, 'fee_percent' => 20, 'description' => 'Customized packages can be cancelled up to 72 hours before start date with a 20% bundled component fee.'],
            'status' => 'active',
        ]);

        // Customer Demo Funding & Initial Booking
        $customer = User::where('email', 'customer@travelease.test')->firstOrFail();
        $service = app(BookingService::class);
        $service->topUp($customer, ['amount_minor' => 100000, 'idempotency_key' => 'local-seed-wallet-funding-v1']);
        if (! $customer->bookings()->exists()) {
            $class = Flight::where('status', 'scheduled')->orderBy('departure_at')->first()->classes()->where('name', 'Economy')->first();
            $seat = $class->seats()->whereNull('booking_id')->first();
            $hold = $service->hold($customer, ['flight_class_id' => $class->id, 'seat_ids' => [$seat->id]]);
            $service->confirm($customer, ['hold_id' => $hold->id, 'passengers' => [['name' => $customer->name, 'type' => 'adult']], 'payment_method' => 'wallet', 'idempotency_key' => 'local-seed-flight-booking-v1']);
        }

        // Fraud Flags for demonstration & admin investigation
        $firstBooking = $customer->bookings()->first();
        FraudFlag::firstOrCreate(['flag_type' => 'excessive_refund_activity'], [
            'user_id' => $customer->id,
            'booking_id' => $firstBooking?->id,
            'description' => 'Simulated alert: High transaction value in new account followed by refund query pattern.',
            'risk_level' => 'medium',
            'status' => 'pending',
        ]);

        FraudFlag::firstOrCreate(['flag_type' => 'repeated_cancellations'], [
            'user_id' => $customer->id,
            'booking_id' => $firstBooking?->id,
            'description' => 'Simulated alert: Two consecutive cancellations within 36 hours across different destinations.',
            'risk_level' => 'high',
            'status' => 'investigating',
        ]);
    }
}
