<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PasswordRequest;
use App\Http\Requests\ProfileRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use App\Services\OtpService;
use App\Services\AdminNotificationService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        abort_unless($request->hasSession(), 419, 'Open TravelEase in your browser to initialize a secure session.');

        $role = $request->input('role', 'customer');
        if (! in_array($role, ['customer', 'agent'])) {
            $role = 'customer';
        }

        $user = DB::transaction(function () use ($request, $role): User {
            $user = User::create([
                ...$request->safe()->only(['name', 'email', 'phone', 'password']),
                'terms_accepted_at' => now(),
            ]);
            $user->forceFill([
                'role' => $role,
                'email_verified_at' => null,
            ])->save();

            $user->wallet()->create(['balance_minor' => 0]);
            $user->loyaltyAccount()->create(['points' => 0]);

            if ($role === 'agent') {
                $user->agentProfile()->create([
                    'agency_name' => $user->name.' Travel Solutions',
                    'commission_rate' => 5.00,
                    'status' => 'active',
                ]);
            }

            AuditService::record($user->id, 'auth.register', 'user', $user->id);

            return $user;
        });

        // Generate and dispatch 6-digit OTP code to user's email
        $code = OtpService::generate($user, 'email_verification');

        $res = [
            'message' => 'Account created successfully. A verification code has been sent to your email address.',
            'requires_verification' => true,
            'email' => $user->email,
            'role' => $user->role,
        ];
        if (app()->environment('testing')) {
            $res['demo_otp'] = $code;
        }

        return response()->json($res, 201);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'min:4', 'max:10'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'No account was found with that email address.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Your email is already verified. You have been signed in.',
                'already_verified' => true,
                'data' => new UserResource($user),
            ]);
        }

        if (! OtpService::verify($user->email, $data['code'], 'email_verification')) {
            throw ValidationException::withMessages([
                'code' => 'The verification code is invalid or has expired. Please check your email or request a new code.',
            ]);
        }

        $user->markEmailAsVerified();
        AuditService::record($user->id, 'auth.email_verified');
        AdminNotificationService::notifyAdmins(
            'New ' . ucfirst($user->role) . ' Registered & Verified',
            'User ' . $user->name . ' (' . $user->email . ') successfully verified their email and activated their ' . ucfirst($user->role) . ' account.',
            'user_registered',
            '/admin/users',
            ['user_id' => $user->id, 'role' => $user->role, 'email' => $user->email]
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Email verified successfully! Welcome to TravelEase.',
            'data' => new UserResource($user),
        ]);
    }

    public function resendOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower($data['email']))->first();
        if (! $user) {
            throw ValidationException::withMessages([
                'email' => 'No account was found with that email address.',
            ]);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Your account is already verified. You may log in directly.',
                'already_verified' => true,
            ]);
        }

        $code = OtpService::generate($user, 'email_verification');

        $res = [
            'message' => 'A new One-Time Password (OTP) verification code has been sent to your email address.',
            'email' => $user->email,
        ];
        if (app()->environment('testing')) {
            $res['demo_otp'] = $code;
        }

        return response()->json($res);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        abort_unless($request->hasSession(), 419, 'Open TravelEase in your browser to initialize a secure session.');

        $credentials = [
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'status' => 'active',
        ];

        if (! Auth::guard('web')->validate($credentials)) {
            throw ValidationException::withMessages(['email' => 'The credentials are invalid or the account is inactive.']);
        }

        $user = User::where('email', $credentials['email'])->first();

        if (! $user->hasVerifiedEmail()) {
            $activeOtp = \App\Models\EmailOtp::where('email', $user->email)
                ->where('purpose', 'email_verification')
                ->where('expires_at', '>=', now())
                ->latest()
                ->first();

            $code = $activeOtp ? $activeOtp->code : OtpService::generate($user, 'email_verification');

            $res = [
                'message' => 'Your email address is not verified yet. Please enter the verification code sent to your email address.',
                'requires_verification' => true,
                'email' => $user->email,
            ];
            if (app()->environment('testing')) {
                $res['demo_otp'] = $code;
            }

            return response()->json($res, 403);
        }

        Auth::guard('web')->attempt($credentials, $request->boolean('remember'));
        $request->session()->regenerate();
        AuditService::record($user->id, 'auth.login');

        return (new UserResource($user))->response()->setStatusCode(200);
    }

    public function logout(Request $request): JsonResponse
    {
        AuditService::record($request->user()->id, 'auth.logout');
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::forgetGuards();

        return response()->json(['message' => 'Signed out.']);
    }

    public function me(Request $request): JsonResponse
    {
        return (new UserResource($request->user()))->response()->setStatusCode(200);
    }

    public function profile(ProfileRequest $request): UserResource
    {
        $request->user()->update($request->validated());
        AuditService::record($request->user()->id, 'profile.updated');

        return new UserResource($request->user());
    }

    public function password(PasswordRequest $request): JsonResponse
    {
        $request->user()->update(['password' => $request->validated('password')]);
        $request->user()->forceFill(['remember_token' => Str::random(60)])->save();
        $request->session()->regenerate();
        AuditService::record($request->user()->id, 'auth.password_updated');

        return response()->json(['message' => 'Password updated.']);
    }

    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|max:255']);
        Password::sendResetLink($request->only('email'));

        return response()->json(['message' => 'If an account matches that email, a reset link has been sent. Local development writes email to the mail log.']);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string', 'email' => 'required|email', 'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()]]);
        $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function (User $user, string $password): void {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            event(new PasswordReset($user));
            AuditService::record($user->id, 'auth.password_reset');
        });
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => __($status)]);
        }

        return response()->json(['message' => 'Password reset. You can now sign in.']);
    }
}
