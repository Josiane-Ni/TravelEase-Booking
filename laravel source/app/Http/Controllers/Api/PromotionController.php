<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function validatePromo(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'amount_minor' => ['required', 'integer', 'min:1'],
        ]);

        $promo = Promotion::where('code', strtoupper(trim($validated['code'])))->first();

        if (! $promo) {
            return response()->json(['message' => 'Invalid promotion code.'], 404);
        }

        if (! $promo->isValidFor((int) $validated['amount_minor'])) {
            if ($promo->status !== 'active') {
                return response()->json(['message' => 'This promotion is no longer active.'], 422);
            }
            if ($promo->times_used >= $promo->usage_limit) {
                return response()->json(['message' => 'This promotion has reached its redemption limit.'], 422);
            }
            if (now()->toDateString() > $promo->expiry_date->toDateString()) {
                return response()->json(['message' => 'This promotion has expired.'], 422);
            }
            if ((int) $validated['amount_minor'] < $promo->min_spend_minor) {
                $minSpend = number_format($promo->min_spend_minor / 100, 2);
                return response()->json(['message' => "Minimum booking amount of \${$minSpend} required."], 422);
            }

            return response()->json(['message' => 'Promotion is not applicable to this order.'], 422);
        }

        $discountMinor = $promo->calculateDiscount((int) $validated['amount_minor']);

        return response()->json([
            'data' => [
                'promotion_id' => $promo->id,
                'code' => $promo->code,
                'title' => $promo->title,
                'discount_minor' => $discountMinor,
                'discount_type' => $promo->discount_type,
                'discount_value' => $promo->discount_value,
            ],
        ]);
    }

    public function index(): JsonResponse
    {
        $promotions = Promotion::orderBy('id', 'desc')->paginate(20);
        return response()->json(['data' => $promotions]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! $request->filled('start_date')) {
            $request->merge(['start_date' => now()->toDateString()]);
        }
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:promotions,code'],
            'title' => ['required', 'string', 'max:100'],
            'discount_type' => ['required', 'in:percentage,fixed'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'min_spend_minor' => ['nullable', 'integer', 'min:0'],
            'max_discount_minor' => ['nullable', 'integer', 'min:0'],
            'start_date' => ['required', 'date'],
            'expiry_date' => ['required', 'date', 'after_or_equal:start_date'],
            'usage_limit' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $validated['code'] = strtoupper(trim($validated['code']));
        $promo = Promotion::create($validated);
        AuditService::record($request->user()->id, 'promotion.created', 'promotion', $promo->id);

        return response()->json(['data' => $promo], 201);
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:100'],
            'discount_type' => ['sometimes', 'in:percentage,fixed'],
            'discount_value' => ['sometimes', 'integer', 'min:1'],
            'min_spend_minor' => ['nullable', 'integer', 'min:0'],
            'max_discount_minor' => ['nullable', 'integer', 'min:0'],
            'start_date' => ['sometimes', 'date'],
            'expiry_date' => ['sometimes', 'date'],
            'usage_limit' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:active,inactive'],
        ]);

        $promotion->update($validated);
        AuditService::record($request->user()->id, 'promotion.updated', 'promotion', $promotion->id);

        return response()->json(['data' => $promotion]);
    }

    public function destroy(Request $request, Promotion $promotion): JsonResponse
    {
        $promotion->update(['status' => 'inactive']);
        AuditService::record($request->user()->id, 'promotion.deactivated', 'promotion', $promotion->id);

        return response()->json(['message' => 'Promotion deactivated.']);
    }
}
