<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function registration(array $overrides = []): array
    {
        return array_replace(['name' => 'Avery Traveler', 'phone' => '+250788123456', 'email' => 'avery@example.test', 'password' => 'Secure!Pass123', 'password_confirmation' => 'Secure!Pass123', 'terms' => true], $overrides);
    }

    public function test_registration_supports_customer_and_agent_and_requires_otp_verification(): void
    {
        $reg = $this->postJson('/api/v1/register', $this->registration());
        $reg->assertCreated()->assertJsonPath('requires_verification', true)->assertJsonPath('role', 'customer');
        $otp = $reg->json('demo_otp');
        $this->assertNotEmpty($otp);

        $user = User::where('email', 'avery@example.test')->first();
        $this->assertNull($user->email_verified_at);
        $this->assertTrue(Hash::check('Secure!Pass123', $user->password));
        $this->assertNotNull($user->wallet);
        $this->assertNotNull($user->loyaltyAccount);

        // Attempting to login before OTP verification returns 403
        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'Secure!Pass123'])
            ->assertStatus(403)
            ->assertJsonPath('requires_verification', true);

        // Submitting wrong OTP fails
        $this->postJson('/api/v1/verify-email-otp', ['email' => $user->email, 'code' => '000000'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        // Submitting valid OTP succeeds and logs in
        $verifyRes = $this->postJson('/api/v1/verify-email-otp', ['email' => $user->email, 'code' => $otp]);
        $verifyRes->assertOk()->assertJsonPath('data.role', 'customer');

        $this->getJson('/api/v1/me')->assertOk()->assertJsonPath('data.email', 'avery@example.test');
        $this->assertNotNull($user->fresh()->email_verified_at);

        // Agent registration
        $agentReg = $this->postJson('/api/v1/register', $this->registration([
            'email' => 'agent.new@example.test',
            'phone' => '+250788999888',
            'role' => 'agent',
        ]));
        $agentReg->assertCreated()->assertJsonPath('role', 'agent');
        $agentUser = User::where('email', 'agent.new@example.test')->first();
        $this->assertEquals('agent', $agentUser->role);
        $this->assertNotNull($agentUser->agentProfile);
    }

    public function test_public_registration_rejects_roles_weak_passwords_and_missing_terms(): void
    {
        $this->postJson('/api/v1/register', $this->registration(['role' => 'admin']))->assertUnprocessable()->assertJsonValidationErrors('role');
        $this->postJson('/api/v1/register', $this->registration(['password' => 'password', 'password_confirmation' => 'password', 'terms' => false]))->assertUnprocessable()->assertJsonValidationErrors(['password', 'terms']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_duplicate_email_and_password_confirmation_are_validated(): void
    {
        User::factory()->create(['email' => 'avery@example.test']);
        $this->postJson('/api/v1/register', $this->registration(['password_confirmation' => 'different']))->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_logout_and_invalid_credentials(): void
    {
        $u = User::factory()->create(['password' => 'Secure!Pass123']);
        $this->postJson('/api/v1/login', ['email' => $u->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/v1/login', ['email' => $u->email, 'password' => 'Secure!Pass123', 'remember' => true])->assertOk();
        $this->getJson('/api/v1/me')->assertOk()->assertJsonMissing(['password' => 'Secure!Pass123']);
        $this->postJson('/api/v1/logout')->assertOk();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_deactivated_users_cannot_login_or_use_protected_endpoints(): void
    {
        $u = User::factory()->create(['password' => 'Secure!Pass123', 'status' => 'inactive']);
        $this->postJson('/api/v1/login', ['email' => $u->email, 'password' => 'Secure!Pass123'])->assertUnprocessable();
        $this->actingAs($u)->getJson('/api/v1/wallet')->assertForbidden();
    }

    public function test_unauthenticated_users_and_wrong_roles_are_denied(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $u = User::factory()->create();
        $this->actingAs($u)->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->getJson('/api/v1/agent/dashboard')->assertForbidden();
    }

    public function test_profile_ownership_and_password_update(): void
    {
        $u = User::factory()->create(['password' => 'Secure!Pass123']);
        $this->actingAs($u);
        $this->putJson('/api/v1/profile', ['name' => 'New Name', 'phone' => '+250788222333', 'role' => 'admin'])->assertUnprocessable();
        $this->putJson('/api/v1/profile', ['name' => 'New Name', 'phone' => '+250788222333'])->assertOk()->assertJsonPath('data.name', 'New Name');
        $this->putJson('/api/v1/password', ['current_password' => 'wrong', 'password' => 'Updated!Pass123', 'password_confirmation' => 'Updated!Pass123'])->assertUnprocessable();
        $this->putJson('/api/v1/password', ['current_password' => 'Secure!Pass123', 'password' => 'Updated!Pass123', 'password_confirmation' => 'Updated!Pass123'])->assertOk();
        $this->assertTrue(Hash::check('Updated!Pass123', $u->fresh()->password));
    }

    public function test_password_reset_uses_a_real_broker_token_and_generic_forgot_response(): void
    {
        Notification::fake();
        $u = User::factory()->create();
        $this->postJson('/api/v1/forgot-password', ['email' => $u->email])->assertOk();
        Notification::assertSentTo($u, ResetPassword::class);
        $this->postJson('/api/v1/forgot-password', ['email' => 'missing@example.test'])->assertOk();
        $token = Password::createToken($u);
        $this->postJson('/api/v1/reset-password', ['email' => $u->email, 'token' => $token, 'password' => 'Reset!Password123', 'password_confirmation' => 'Reset!Password123'])->assertOk();
        $this->assertTrue(Hash::check('Reset!Password123', $u->fresh()->password));
        $this->postJson('/api/v1/reset-password', ['email' => $u->email, 'token' => $token, 'password' => 'Reset!Password123', 'password_confirmation' => 'Reset!Password123'])->assertUnprocessable();
    }

    public function test_login_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/login', ['email' => 'rate@example.test', 'password' => 'wrong'])->assertUnprocessable();
        } $this->postJson('/api/v1/login',['email' => 'rate@example.test', 'password' => 'wrong'])->assertStatus(429);
    }
}
