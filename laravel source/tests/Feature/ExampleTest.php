<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_backend_home_redirects_to_the_react_application(): void
    {
        $this->get('/')->assertRedirect(config('travelease.frontend_url'));
    }

    public function test_original_hello_route_is_preserved(): void
    {
        $this->get('/hello')->assertOk()->assertSee('Hello Frederic!');
    }
}
