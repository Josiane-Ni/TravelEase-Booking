<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class HoldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|in:flight,hotel,package',
            'flight_class_id' => 'required_without:room_type_id|nullable|integer|exists:flight_classes,id',
            'seat_ids' => 'required_with:flight_class_id|array|min:1|max:9',
            'seat_ids.*' => 'required_with:seat_ids|integer|distinct|exists:flight_seats,id',
            'room_type_id' => 'required_without:flight_class_id|nullable|integer|exists:room_types,id',
            'check_in' => 'required_with:room_type_id|nullable|date|after_or_equal:today',
            'check_out' => 'required_with:room_type_id|nullable|date|after:check_in',
            'rooms_quantity' => 'nullable|integer|min:1|max:5',
        ];
    }
}
