<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AdminNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'email' => 'required|email|max:255', 'subject' => 'required|string|max:150', 'message' => 'required|string|min:10|max:5000']);
        DB::table('contact_messages')->insert([...$data, 'created_at' => now(), 'updated_at' => now()]);

        AdminNotificationService::notifyAdmins(
            'New Customer Inquiry: ' . $data['subject'],
            'Message from ' . $data['name'] . ' (' . $data['email'] . '): ' . Str::limit($data['message'], 100),
            'support',
            '/admin/dashboard',
            ['email' => $data['email'], 'name' => $data['name'], 'subject' => $data['subject']]
        );

        return response()->json(['message' => 'Your message has been saved. This local demonstration does not send external email.'], 201);
    }
}
