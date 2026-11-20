<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailOtpNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $code,
        public int $validMinutes = 10
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Your TravelEase Verification Code: {$this->code}")
            ->greeting("Hello {$notifiable->name}!")
            ->line("Thank you for registering with TravelEase. To complete your account registration and verify your email address, please use the One-Time Password (OTP) verification code below:")
            ->line("**{$this->code}**")
            ->line("This verification code is valid for {$this->validMinutes} minutes.")
            ->line("If you did not request this code, no further action is required; your account will remain protected.")
            ->salutation("Best regards, TravelEase Team");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'code' => $this->code,
            'title' => 'Email Verification OTP',
            'message' => "Your OTP verification code is {$this->code}.",
        ];
    }
}
