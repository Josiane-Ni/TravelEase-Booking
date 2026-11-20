<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hold_id' => 'required|integer|exists:inventory_holds,id',
            'passengers' => 'required|array|min:1|max:9',
            'passengers.*.name' => 'required|string|max:100',
            'passengers.*.type' => 'required|in:adult,child',
            'payment_method' => 'required|in:wallet,mock_card',
            'mock_result' => 'required_if:payment_method,mock_card|in:success,failure',
            'idempotency_key' => 'required|string|min:16|max:80',
            'promotion_id' => 'nullable|integer|exists:promotions,id',
            'redeem_points' => 'nullable|integer|min:0',
            'corporate_client_id' => 'nullable|integer|exists:corporate_clients,id',
            'price' => 'prohibited',
            'total_minor' => 'prohibited',
        ];
    }
}
