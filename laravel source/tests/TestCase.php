<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();
        if (config('database.default') === 'mysql' && ! str_ends_with((string) config('database.connections.mysql.database'), '_test')) {
            throw new \RuntimeException('Tests require a separate MySQL database whose name ends in _test.');
        }

        return $app;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Origin', config('travelease.frontend_url'));
    }
}
