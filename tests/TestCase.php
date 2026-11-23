<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Page routes render @vite, which needs public/build (gitignored) or a
        // running dev server. Neither exists in CI, so stub asset tags in tests.
        $this->withoutVite();
    }
}
