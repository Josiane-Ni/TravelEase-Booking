<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Hotels
        Schema::create('hotels', function (Blueprint $t): void {
            $t->id();
            $t->string('name', 120);
            $t->string('city', 80)->index();
            $t->unsignedTinyInteger('stars')->default(4);
            $t->text('description');
            $t->json('amenities')->nullable(); // e.g. ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Airport Shuttle"]
            $t->string('image_path')->nullable();
            $t->string('status', 20)->default('active')->index();
            $t->string('address')->nullable();
            $t->unsignedInteger('cancellation_hours')->default(48);
            $t->unsignedSmallInteger('cancellation_fee_percent')->default(15);
            $t->timestamps();
        });

        // 2. Hotel Images
        Schema::create('hotel_images', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $t->string('image_path');
            $t->string('caption')->nullable();
            $t->timestamps();
        });

        // 3. Room Types
        Schema::create('room_types', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('hotel_id')->constrained()->cascadeOnDelete();
            $t->string('name', 80);
            $t->text('description')->nullable();
            $t->unsignedBigInteger('price_per_night_minor'); // in cents
            $t->unsignedSmallInteger('capacity')->default(2);
            $t->unsignedSmallInteger('total_rooms')->default(10);
            $t->json('amenities')->nullable();
            $t->string('image_path')->nullable();
            $t->timestamps();
        });

        // 4. Room Inventory (Daily tracking for multi-night availability)
        Schema::create('room_inventory', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('room_type_id')->constrained()->cascadeOnDelete();
            $t->date('inventory_date')->index();
            $t->unsignedSmallInteger('available_rooms');
            $t->unique(['room_type_id', 'inventory_date']);
            $t->timestamps();
        });

        // 5. Holiday Packages
        Schema::create('packages', function (Blueprint $t): void {
            $t->id();
            $t->string('title', 150);
            $t->string('destination', 80)->index();
            $t->unsignedSmallInteger('duration_days')->default(5);
            $t->text('description');
            $t->json('inclusions')->nullable();
            $t->json('exclusions')->nullable();
            $t->unsignedSmallInteger('discount_percent')->default(15);
            $t->unsignedBigInteger('base_price_minor');
            $t->string('image_path')->nullable();
            $t->string('status', 20)->default('active')->index();
            $t->timestamps();
        });

        // 6. Package Components
        Schema::create('package_components', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('package_id')->constrained()->cascadeOnDelete();
            $t->string('component_type', 30); // 'flight', 'hotel'
            $t->foreignId('flight_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('hotel_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('room_type_id')->nullable()->constrained()->nullOnDelete();
            $t->timestamps();
        });

        // 7. Booking Rooms (Details for hotel reservations in a booking)
        Schema::create('booking_rooms', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->foreignId('room_type_id')->constrained()->restrictOnDelete();
            $t->date('check_in')->index();
            $t->date('check_out')->index();
            $t->unsignedSmallInteger('quantity')->default(1);
            $t->unsignedBigInteger('price_per_night_minor');
            $t->unsignedBigInteger('total_minor');
            $t->timestamps();
        });

        // 8. Promotions
        Schema::create('promotions', function (Blueprint $t): void {
            $t->id();
            $t->string('code', 30)->unique();
            $t->string('title', 100);
            $t->string('discount_type', 20)->default('percentage'); // 'percentage', 'fixed'
            $t->unsignedBigInteger('discount_value'); // percent e.g. 15 or fixed minor e.g. 5000 ($50)
            $t->unsignedBigInteger('min_spend_minor')->default(0);
            $t->unsignedBigInteger('max_discount_minor')->nullable();
            $t->date('start_date');
            $t->date('expiry_date');
            $t->unsignedInteger('usage_limit')->default(100);
            $t->unsignedInteger('times_used')->default(0);
            $t->string('status', 20)->default('active')->index();
            $t->timestamps();
        });

        // 9. Promotion Usage
        Schema::create('promotion_usage', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('promotion_id')->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->foreignId('booking_id')->constrained()->restrictOnDelete();
            $t->unsignedBigInteger('discount_minor');
            $t->timestamps();
        });

        // 10. Fraud Flags
        Schema::create('fraud_flags', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $t->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $t->string('flag_type', 60); // e.g. 'repeated_cancellations', 'excessive_refunds', 'suspicious_amount'
            $t->text('description');
            $t->string('risk_level', 20)->default('medium'); // 'low', 'medium', 'high'
            $t->string('status', 20)->default('pending')->index(); // 'pending', 'investigating', 'resolved', 'dismissed'
            $t->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $t->text('resolution_notes')->nullable();
            $t->timestamps();
        });

        // 11. Cancellation Policies
        Schema::create('cancellation_policies', function (Blueprint $t): void {
            $t->id();
            $t->string('service_type', 30)->index(); // 'flight', 'hotel', 'package'
            $t->string('policy_name', 80);
            $t->json('rules');
            $t->string('status', 20)->default('active');
            $t->timestamps();
        });

        // 12. Agent Profiles
        Schema::create('agent_profiles', function (Blueprint $t): void {
            $t->id();
            $t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $t->string('agency_name');
            $t->decimal('commission_rate', 5, 2)->default(5.00); // 5%
            $t->string('status', 20)->default('active');
            $t->timestamps();
        });

        // 13. Extend bookings with extra fields
        Schema::table('bookings', function (Blueprint $t): void {
            $t->unsignedBigInteger('discount_minor')->default(0)->after('tax_minor');
            $t->foreignId('promotion_id')->nullable()->after('currency')->constrained()->nullOnDelete();
            $t->unsignedBigInteger('loyalty_redeemed_minor')->default(0)->after('discount_minor');
            $t->foreignId('agent_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            $t->foreignId('corporate_client_id')->nullable()->after('agent_id')->constrained('corporate_clients')->nullOnDelete();
            $t->foreignId('hotel_id')->nullable()->after('corporate_client_id')->constrained()->nullOnDelete();
            $t->foreignId('package_id')->nullable()->after('hotel_id')->constrained()->nullOnDelete();
        });

        // 14. Extend inventory_holds for hotel rooms
        Schema::table('inventory_holds', function (Blueprint $t): void {
            $t->string('inventory_type', 20)->default('flight')->after('reference');
            $t->foreignId('flight_class_id')->nullable()->change();
            $t->foreignId('room_type_id')->nullable()->after('flight_class_id')->constrained()->nullOnDelete();
            $t->date('check_in')->nullable()->after('room_type_id');
            $t->date('check_out')->nullable()->after('check_in');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_holds', function (Blueprint $t): void {
            $t->dropForeign(['room_type_id']);
            $t->dropColumn(['inventory_type', 'room_type_id', 'check_in', 'check_out']);
        });

        Schema::table('bookings', function (Blueprint $t): void {
            $t->dropForeign(['promotion_id']);
            $t->dropForeign(['agent_id']);
            $t->dropForeign(['corporate_client_id']);
            $t->dropForeign(['hotel_id']);
            $t->dropForeign(['package_id']);
            $t->dropColumn(['discount_minor', 'promotion_id', 'loyalty_redeemed_minor', 'agent_id', 'corporate_client_id', 'hotel_id', 'package_id']);
        });

        foreach ([
            'agent_profiles',
            'cancellation_policies',
            'fraud_flags',
            'promotion_usage',
            'promotions',
            'booking_rooms',
            'package_components',
            'packages',
            'room_inventory',
            'room_types',
            'hotel_images',
            'hotels'
        ] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
