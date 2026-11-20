<?php

namespace Tests\Feature;

use App\Models\FlightClass;
use App\Models\FlightSeat;
use App\Models\InventoryHold;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MySqlConcurrencyTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        if (DB::getDriverName() !== 'mysql' || ! function_exists('pcntl_fork')) {
            $this->markTestSkipped('Requires a dedicated MySQL test database and pcntl.');
        }
        $this->assertStringEndsWith('_test', DB::connection()->getDatabaseName(), 'Concurrency tests must use an isolated test database.');
    }

    public function test_two_processes_cannot_hold_the_same_seat(): void
    {
        $users = User::factory()->count(2)->create();
        $class = FlightClass::factory()->create();
        $seat = FlightSeat::factory()->create(['flight_class_id' => $class->id]);
        $prefix = sys_get_temp_dir().'/travelease-concurrent-'.bin2hex(random_bytes(8));
        $children = [];
        $signals = [];
        DB::disconnect();
        foreach ($users as $i => $user) {
            $pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, 0);
            $pid = pcntl_fork();
            if ($pid === 0) {
                fclose($pair[0]);
                fread($pair[1], 1);
                fclose($pair[1]);
                DB::purge();
                try {
                    app(BookingService::class)->hold(User::findOrFail($user->id), ['flight_class_id' => $class->id, 'seat_ids' => [$seat->id]]);
                    $result = 'held';
                } catch (HttpException $e) {
                    $result = $e->getStatusCode() === 409 ? 'conflict' : 'unexpected:'.$e->getMessage();
                } catch (\Throwable $e) {
                    $result = 'error:'.$e->getMessage();
                }
                file_put_contents($prefix.'-'.$i, $result);
                exit(0);
            }
            fclose($pair[1]);
            $signals[] = $pair[0];
            $children[] = $pid;
        }
        foreach ($signals as $signal) {
            fwrite($signal, 'x');
            fclose($signal);
        }
        foreach ($children as $pid) {
            pcntl_waitpid($pid, $status);
            $this->assertSame(0, pcntl_wexitstatus($status));
        }
        $results = [];
        foreach ([0, 1] as $i) {
            $results[] = file_get_contents($prefix.'-'.$i);
            unlink($prefix.'-'.$i);
        }sort($results);
        DB::purge();
        $this->assertSame(['conflict', 'held'], $results);
        $this->assertSame(1, InventoryHold::where('status', 'active')->count());
        $this->assertNotNull($seat->fresh()->inventory_hold_id);
    }

    private function runCompetingConfirmations(array $payloads, int $userId): array
    {
        $prefix = sys_get_temp_dir().'/travelease-confirm-'.bin2hex(random_bytes(8));
        $children = [];
        $signals = [];
        DB::disconnect();
        foreach ($payloads as $i => $payload) {
            $pair = stream_socket_pair(STREAM_PF_UNIX, STREAM_SOCK_STREAM, 0);
            $pid = pcntl_fork();
            if ($pid === 0) {
                fclose($pair[0]);
                fread($pair[1], 1);
                fclose($pair[1]);
                DB::purge();
                try {
                    $result = app(BookingService::class)->confirm(User::findOrFail($userId), $payload);
                } catch (\Throwable $e) {
                    $result = ['error' => $e->getMessage()];
                }
                file_put_contents($prefix.'-'.$i, json_encode($result));
                exit(0);
            }
            fclose($pair[1]);
            $signals[] = $pair[0];
            $children[] = $pid;
        }
        foreach ($signals as $signal) {
            fwrite($signal, 'x');
            fclose($signal);
        }
        foreach ($children as $pid) {
            pcntl_waitpid($pid, $status);
            $this->assertSame(0, pcntl_wexitstatus($status));
        }
        DB::purge();
        $results = [];
        foreach (array_keys($payloads) as $i) {
            $results[] = json_decode(file_get_contents($prefix.'-'.$i), true);
            unlink($prefix.'-'.$i);
        }

        return $results;
    }

    public function test_concurrent_identical_confirmations_charge_only_once(): void
    {
        $user = User::factory()->create();
        $user->wallet->update(['balance_minor' => 20000]);
        $class = FlightClass::factory()->create();
        $seat = FlightSeat::factory()->create(['flight_class_id' => $class->id]);
        $hold = app(BookingService::class)->hold($user, ['flight_class_id' => $class->id, 'seat_ids' => [$seat->id]]);
        $payload = ['hold_id' => $hold->id, 'passengers' => [['name' => 'Concurrent Traveler', 'type' => 'adult']], 'payment_method' => 'wallet', 'idempotency_key' => 'concurrent-identical-confirm'];
        $results = $this->runCompetingConfirmations([$payload, $payload], $user->id);
        $this->assertArrayHasKey('booking_id', $results[0]);
        $this->assertSame($results[0], $results[1]);
        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseCount('wallet_transactions', 1);
        $this->assertEquals(9000, $user->wallet->fresh()->balance_minor);
    }

    public function test_competing_wallet_deductions_cannot_overspend(): void
    {
        $user = User::factory()->create();
        $user->wallet->update(['balance_minor' => 11000]);
        $class = FlightClass::factory()->create();
        $seats = FlightSeat::factory()->count(2)->create(['flight_class_id' => $class->id]);
        $payloads = [];
        foreach ($seats as $i => $seat) {
            $hold = app(BookingService::class)->hold($user, ['flight_class_id' => $class->id, 'seat_ids' => [$seat->id]]);
            $payloads[] = ['hold_id' => $hold->id, 'passengers' => [['name' => 'Concurrent Traveler '.$i, 'type' => 'adult']], 'payment_method' => 'wallet', 'idempotency_key' => 'competing-wallet-confirm-'.$i];
        }
        $results = $this->runCompetingConfirmations($payloads, $user->id);
        $this->assertCount(1, array_filter($results, fn ($result) => isset($result['booking_id'])));
        $this->assertCount(1, array_filter($results, fn ($result) => isset($result['failure'])));
        $this->assertDatabaseCount('bookings', 1);
        $this->assertDatabaseCount('payments', 1);
        $this->assertEquals(0, $user->wallet->fresh()->balance_minor);
        $this->assertSame(1,FlightSeat::whereNotNull('booking_id')->count());
    }
}
