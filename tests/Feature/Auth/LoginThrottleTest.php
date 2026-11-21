<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_login_is_throttled_after_five_attempts(): void
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/staff/login', ['email' => $user->email, 'password' => 'wrong'])->assertStatus(422);
        }

        $this->postJson('/api/staff/login', ['email' => $user->email, 'password' => 'password'])->assertStatus(429);
    }

    public function test_portal_login_is_throttled(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/portal/login', ['email' => 'a@b.test', 'password' => 'wrong']);
        }

        $this->postJson('/api/portal/login', ['email' => 'a@b.test', 'password' => 'wrong'])->assertStatus(429);
    }
}
