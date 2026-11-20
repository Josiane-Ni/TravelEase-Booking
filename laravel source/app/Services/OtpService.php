<?php

namespace App\Services;

use App\Models\EmailOtp;
use App\Models\User;
use App\Notifications\EmailOtpNotification;

class OtpService
{
    public const VALID_MINUTES = 10;

    public static function generate(User $user, string $purpose = 'email_verification'): string
    {
        EmailOtp::where('email', $user->email)
            ->where('purpose', $purpose)
            ->delete();

        $code = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        EmailOtp::create([
            'email' => $user->email,
            'code' => $code,
            'purpose' => $purpose,
            'expires_at' => now()->addMinutes(self::VALID_MINUTES),
        ]);

        try {
            $user->notify(new EmailOtpNotification($code, self::VALID_MINUTES));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning("Could not send email OTP: {$e->getMessage()}");
        }

        return $code;
    }

    public static function verify(string $email, string $code, string $purpose = 'email_verification'): bool
    {
        $cleanCode = trim($code);
        $otp = EmailOtp::where('email', $email)
            ->where('code', $cleanCode)
            ->where('purpose', $purpose)
            ->where('expires_at', '>=', now())
            ->latest()
            ->first();

        if ($otp) {
            EmailOtp::where('email', $email)
                ->where('purpose', $purpose)
                ->delete();

            return true;
        }

        return false;
    }
}
