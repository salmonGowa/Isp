<?php

namespace Tests\Feature\Portal;

use App\Domain\Subscribers\Models\Subscriber;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WifiPasswordEncryptionTest extends TestCase
{
    use RefreshDatabase;

    public function test_wifi_password_is_encrypted_at_rest_but_readable_by_owner(): void
    {
        $subscriber = Subscriber::factory()->create();

        $plain = $this->actingAs($subscriber, 'subscriber')->getJson('/api/portal/wifi')->assertSuccessful()->json('data.wifi_password');

        $this->assertNotEmpty($plain);
        $this->assertNotSame($plain, DB::table('wifi_networks')->value('wifi_password'));
    }
}
