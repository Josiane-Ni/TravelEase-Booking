<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\AdminNotice;
use Illuminate\Support\Facades\Log;

class AdminNotificationService
{
    /**
     * Send an alert notification to all platform administrators.
     */
    public static function notifyAdmins(
        string $title,
        string $message,
        string $category = 'general',
        ?string $actionUrl = null,
        array $metadata = []
    ): void {
        try {
            $admins = User::where('role', 'admin')->where('status', 'active')->get();
            foreach ($admins as $admin) {
                $admin->notify(new AdminNotice($title, $message, $category, $actionUrl, $metadata));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch admin notification: ' . $e->getMessage());
        }
    }
}
