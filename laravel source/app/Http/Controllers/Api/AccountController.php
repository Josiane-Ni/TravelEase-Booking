<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Refund;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function wallet(Request $request): JsonResponse
    {
        return response()->json(['data' => [...$request->user()->wallet->toArray(), 'transactions' => $request->user()->wallet->transactions()->latest()->paginate(20), 'simulated' => true]]);
    }

    public function topUp(Request $request, BookingService $service): JsonResponse
    {
        $data = $request->validate(['amount_minor' => 'required|integer|min:100|max:100000', 'idempotency_key' => 'required|string|min:16|max:80']);

        return response()->json(['data' => $service->topUp($request->user(), $data)]);
    }

    public function loyalty(Request $request): JsonResponse
    {
        return response()->json(['data' => [...$request->user()->loyaltyAccount->toArray(), 'transactions' => $request->user()->loyaltyAccount->transactions()->latest()->paginate(20)]]);
    }

    public function notifications(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->notifications()->latest()->paginate(20), 'unread_count' => $request->user()->unreadNotifications()->count()]);
    }

    public function read(Request $request, string $notification): JsonResponse
    {
        $request->user()->notifications()->findOrFail($notification)->markAsRead();

        return response()->json(['message' => 'Notification read.']);
    }

    public function readAll(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function payments(Request $request): JsonResponse
    {
        return response()->json(['data' => Payment::where('user_id', $request->user()->id)->latest()->paginate(20)]);
    }

    public function refunds(Request $request): JsonResponse
    {
        return response()->json(['data' => Refund::whereHas('booking', fn ($q) => $q->where('user_id', $request->user()->id))->latest()->paginate(20)]);
    }
}
