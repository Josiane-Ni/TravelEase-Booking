<?php

use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\InventoryHold;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schedule;

Artisan::command('travel:expire-holds', function (): void {
    $count = 0;
    foreach (InventoryHold::where('status', 'active')->where('expires_at', '<=', now())->orderBy('id')->cursor() as $hold) {
        DB::transaction(function () use ($hold, &$count): void {
            FlightClass::whereKey($hold->flight_class_id)->lockForUpdate()->firstOrFail();
            $locked = InventoryHold::whereKey($hold->id)->lockForUpdate()->firstOrFail();
            if ($locked->status === 'active' && $locked->expires_at->isPast()) {
                $locked->update(['status' => 'expired']);
                FlightSeat::where('inventory_hold_id', $locked->id)->update(['inventory_hold_id' => null]);
                $count++;
            }
        }, 3);
    }
    $this->info('Expired '.$count.' inventory holds.');
})->purpose('Release expired demonstration flight seat holds');
Schedule::command('travel:expire-holds')->everyMinute()->withoutOverlapping();

Artisan::command('inspire', function (): void {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
