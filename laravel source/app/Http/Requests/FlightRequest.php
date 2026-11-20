<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['airline_id' => 'required|exists:airlines,id', 'flight_number' => ['required', 'string', 'max:12', Rule::unique('flights')->ignore($this->route('flight')?->id)], 'origin' => 'required|string|max:80|different:destination', 'destination' => 'required|string|max:80', 'departure_at' => 'required|date|after:now', 'arrival_at' => 'required|date|after:departure_at', 'fare_minor' => 'required|integer|min:100|max:100000000', 'tax_minor' => 'required|integer|min:0|max:10000000', 'capacity' => 'required|integer|min:1|max:200', 'cancellation_hours' => 'required|integer|min:0|max:720', 'cancellation_fee_percent' => 'required|integer|min:0|max:100'];
    }
}
