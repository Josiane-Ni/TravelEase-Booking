<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminNotice extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public string $category = 'general',
        public ?string $actionUrl = null,
        public array $metadata = []
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'category' => $this->category,
            'action_url' => $this->actionUrl,
            'metadata' => $this->metadata,
            'created_at' => now()->toIso8601String(),
            'simulated' => true,
        ];
    }
}
