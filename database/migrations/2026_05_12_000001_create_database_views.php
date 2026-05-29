<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Vista 1: resumen de edificios con stats agregadas ─────────────────
        DB::statement("
            CREATE OR REPLACE VIEW v_buildings_summary AS
            SELECT
                b.id              AS building_id,
                b.name            AS building_name,
                b.type            AS building_type,
                b.description,
                b.latitude,
                b.longitude,
                b.public_token,
                b.created_at,
                b.updated_at,
                u.id              AS owner_id,
                u.name            AS owner_name,
                u.email           AS owner_email,
                COUNT(DISTINCT s.id)                                    AS spaces_count,
                COUNT(DISTINCT sc.id)                                   AS total_schedules_count,
                COUNT(DISTINCT CASE WHEN sc.is_active THEN sc.id END)  AS active_schedules_count
            FROM buildings b
            INNER JOIN users u  ON u.id  = b.user_id
            LEFT  JOIN spaces s ON s.building_id = b.id
            LEFT  JOIN schedules sc ON sc.space_id = s.id
            GROUP BY
                b.id, b.name, b.type, b.description,
                b.latitude, b.longitude, b.public_token,
                b.created_at, b.updated_at,
                u.id, u.name, u.email
        ");

        // ── Vista 2: resumen de espacios con info de su edificio ──────────────
        DB::statement("
            CREATE OR REPLACE VIEW v_spaces_overview AS
            SELECT
                s.id              AS space_id,
                s.name            AS space_name,
                s.type            AS space_type,
                s.color,
                s.created_at,
                b.id              AS building_id,
                b.name            AS building_name,
                b.type            AS building_type,
                u.name            AS owner_name,
                COUNT(DISTINCT sc.id)                                   AS total_schedules_count,
                COUNT(DISTINCT CASE WHEN sc.is_active THEN sc.id END)  AS active_schedules_count
            FROM spaces s
            INNER JOIN buildings b ON b.id  = s.building_id
            INNER JOIN users u     ON u.id  = b.user_id
            LEFT  JOIN schedules sc ON sc.space_id = s.id
            GROUP BY
                s.id, s.name, s.type, s.color, s.created_at,
                b.id, b.name, b.type,
                u.name
        ");

        // ── Vista 3: estadísticas por usuario ─────────────────────────────────
        DB::statement("
            CREATE OR REPLACE VIEW v_user_statistics AS
            SELECT
                u.id              AS user_id,
                u.name            AS user_name,
                u.email,
                u.created_at      AS registered_at,
                COUNT(DISTINCT b.id)                                    AS buildings_count,
                COUNT(DISTINCT s.id)                                    AS spaces_count,
                COUNT(DISTINCT CASE WHEN sc.is_active THEN sc.id END)  AS active_schedules_count,
                COUNT(DISTINCT sc.id)                                   AS total_schedules_count
            FROM users u
            LEFT JOIN buildings b  ON b.user_id     = u.id
            LEFT JOIN spaces s     ON s.building_id = b.id
            LEFT JOIN schedules sc ON sc.space_id   = s.id
            GROUP BY u.id, u.name, u.email, u.created_at
        ");
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_user_statistics');
        DB::statement('DROP VIEW IF EXISTS v_spaces_overview');
        DB::statement('DROP VIEW IF EXISTS v_buildings_summary');
    }
};
