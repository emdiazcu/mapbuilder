<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    // ── Test 1: Registro ─────────────────────────────────────

    public function test_user_can_register_and_receives_token(): void
    {
        $this->createRole('user');

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Nuevo Usuario',
            'email'                 => 'nuevo@example.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token'])
            ->assertJsonPath('user.email', 'nuevo@example.com');

        $this->assertDatabaseHas('users', ['email' => 'nuevo@example.com']);
    }

    // ── Test 2: Login correcto ───────────────────────────────

    public function test_user_can_login_and_receives_bearer_token(): void
    {
        $user = $this->createUser(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertNotEmpty($response->json('token'));
    }

    // ── Test 3: Credenciales incorrectas ────────────────────

    public function test_login_fails_with_wrong_password(): void
    {
        $user = $this->createUser();

        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // ── Test 4: Logout revoca token ──────────────────────────

    public function test_user_can_logout_and_token_is_revoked(): void
    {
        [$user, $token] = $this->actingAsUser();

        $this->postJson('/api/auth/logout', [], $this->bearerToken($token))
            ->assertOk()
            ->assertJsonPath('message', 'Sesión cerrada correctamente.');

        // Resetear la caché del guard para que la siguiente petición
        // resuelva el token desde la BD (donde ya fue eliminado).
        $this->app['auth']->forgetGuards();

        // Después del logout el token ya no debe funcionar
        $this->getJson('/api/auth/me', $this->bearerToken($token))
            ->assertUnauthorized();
    }

    // ── Test 5: /me devuelve usuario autenticado ─────────────

    public function test_me_returns_authenticated_user_with_role(): void
    {
        [$user, $token] = $this->actingAsUser();

        $response = $this->getJson('/api/auth/me', $this->bearerToken($token));

        $response->assertOk()
            ->assertJsonPath('id', $user->id)
            ->assertJsonPath('email', $user->email)
            ->assertJsonStructure(['roles']);
    }

    // ── Test 6: Rutas protegidas rechazan sin token ──────────

    public function test_protected_routes_require_authentication(): void
    {
        $this->getJson('/api/auth/me', $this->jsonHeaders())
            ->assertUnauthorized();

        $this->getJson('/api/buildings', $this->jsonHeaders())
            ->assertUnauthorized();
    }
}
