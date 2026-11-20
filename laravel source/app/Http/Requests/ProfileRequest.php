<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['name' => 'required|string|max:100', 'phone' => ['required', 'string', 'max:30', 'regex:/^[+0-9 ()-]{7,30}$/'], 'role' => 'prohibited', 'status' => 'prohibited'];
    }
}
