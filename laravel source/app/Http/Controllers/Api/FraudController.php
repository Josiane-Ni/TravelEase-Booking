<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FraudFlag;
use App\Models\PaymentAttempt;
use App\Models\User;
use App\Services\AuditService;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FraudController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FraudFlag::with(['user', 'booking', 'reviewer'])->orderBy('id', 'desc');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($risk = $request->input('risk_level')) {
            $query->where('risk_level', $risk);
        }

        $flags = $query->paginate(20);

        return response()->json(['data' => $flags]);
    }

    public function update(Request $request, FraudFlag $flag): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:investigating,resolved,dismissed'],
            'resolution_notes' => ['required', 'string', 'max:1000'],
        ]);

        $flag->update([
            'status' => $validated['status'],
            'resolution_notes' => $validated['resolution_notes'],
            'reviewed_by' => $request->user()->id,
        ]);

        AuditService::record($request->user()->id, 'fraud.reviewed', 'fraud_flag', $flag->id, [
            'status' => $validated['status'],
        ]);

        return response()->json(['data' => $flag->load('reviewer')]);
    }

    public function scan(Request $request): JsonResponse
    {
        $detected = 0;

        // 1. Detect users with >= 2 cancellations in last 48 hours
        $frequentCancellers = DB::table('bookings')
            ->select('user_id', DB::raw('count(*) as cancel_count'))
            ->where('status', 'cancelled')
            ->where('updated_at', '>=', now()->subHours(48))
            ->groupBy('user_id')
            ->having('cancel_count', '>=', 2)
            ->get();

        foreach ($frequentCancellers as $item) {
            $exists = FraudFlag::where('user_id', $item->user_id)
                ->where('flag_type', 'repeated_last_minute_cancellations')
                ->where('status', 'pending')
                ->exists();

            if (! $exists) {
                $flag = FraudFlag::create([
                    'user_id' => $item->user_id,
                    'flag_type' => 'repeated_last_minute_cancellations',
                    'description' => "Automated detection: Account has {$item->cancel_count} cancellations within a 48-hour window.",
                    'risk_level' => 'high',
                    'status' => 'pending',
                ]);
                AdminNotificationService::notifyAdmins(
                    'High-Risk Fraud Flag Detected',
                    "User ID {$item->user_id} flagged for repeated cancellations ({$item->cancel_count} in 48h).",
                    'fraud',
                    '/admin/fraud',
                    ['flag_id' => $flag->id, 'user_id' => $item->user_id, 'risk_level' => 'high']
                );
                $detected++;
            }
        }

        // 2. Detect accounts with >= 3 failed payment attempts
        $failedAttempts = DB::table('payment_attempts')
            ->select('user_id', DB::raw('count(*) as fail_count'))
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subHours(24))
            ->groupBy('user_id')
            ->having('fail_count', '>=', 3)
            ->get();

        foreach ($failedAttempts as $item) {
            $exists = FraudFlag::where('user_id', $item->user_id)
                ->where('flag_type', 'repeated_payment_failures')
                ->where('status', 'pending')
                ->exists();

            if (! $exists) {
                $flag = FraudFlag::create([
                    'user_id' => $item->user_id,
                    'flag_type' => 'repeated_payment_failures',
                    'description' => "Automated detection: {$item->fail_count} failed payment attempts recorded within 24 hours.",
                    'risk_level' => 'medium',
                    'status' => 'pending',
                ]);
                AdminNotificationService::notifyAdmins(
                    'Fraud Risk Detected: Payment Velocity',
                    "User ID {$item->user_id} recorded {$item->fail_count} payment failures within 24h.",
                    'fraud',
                    '/admin/fraud',
                    ['flag_id' => $flag->id, 'user_id' => $item->user_id, 'risk_level' => 'medium']
                );
                $detected++;
            }
        }

        AuditService::record($request->user()->id, 'fraud.scan_executed', 'system', null, [
            'detected' => $detected,
        ]);

        return response()->json([
            'message' => "Fraud scan complete. {$detected} new suspicious patterns flagged.",
            'new_flags' => $detected,
        ]);
    }
}
