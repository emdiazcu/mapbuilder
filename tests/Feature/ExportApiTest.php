<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Space;
use Tests\TestCase;

class ExportApiTest extends TestCase
{
    // ── Test 1: Descargar Excel del edificio propio ───────────

    public function test_user_can_download_excel_export_of_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);
        Space::factory(2)->create(['building_id' => $building->id]);

        $response = $this->get(
            "/api/buildings/{$building->id}/export",
            $this->bearerToken($token)
        );

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    // ── Test 2: No puede exportar edificio ajeno ──────────────

    public function test_user_cannot_export_other_users_building(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);

        $this->get(
            "/api/buildings/{$building->id}/export",
            $this->bearerToken($token)
        )->assertForbidden();
    }

    // ── Test 3: Admin puede exportar cualquier edificio ───────

    public function test_admin_can_export_any_building(): void
    {
        [, $adminToken] = $this->actingAsAdmin();
        $user           = $this->createUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        $response = $this->get(
            "/api/buildings/{$building->id}/export",
            $this->bearerToken($adminToken)
        );

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    // ── Test 4: Generar QR del edificio propio ────────────────

    public function test_user_can_get_qr_code_of_own_building(): void
    {
        [$user, $token] = $this->actingAsUser();
        $building       = Building::factory()->create(['user_id' => $user->id]);

        $response = $this->get(
            "/api/buildings/{$building->id}/qr",
            $this->bearerToken($token)
        );

        $response->assertOk()
            ->assertHeader('Content-Type', 'image/svg+xml');
    }

    // ── Test 5: No puede obtener QR de edificio ajeno ─────────

    public function test_user_cannot_get_qr_of_other_users_building(): void
    {
        [, $token] = $this->actingAsUser();
        $other     = $this->createUser();
        $building  = Building::factory()->create(['user_id' => $other->id]);

        $this->get(
            "/api/buildings/{$building->id}/qr",
            $this->bearerToken($token)
        )->assertForbidden();
    }

    // ── Test 6: Exportar requiere autenticación ───────────────

    public function test_export_endpoints_require_authentication(): void
    {
        $user     = $this->createUser();
        $building = Building::factory()->create(['user_id' => $user->id]);

        $this->get("/api/buildings/{$building->id}/export", $this->jsonHeaders())
            ->assertUnauthorized();

        $this->get("/api/buildings/{$building->id}/qr", $this->jsonHeaders())
            ->assertUnauthorized();
    }
}
