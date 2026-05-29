<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── Función 1: estadísticas detalladas de un edificio ─────────────────
        // Uso: SELECT * FROM fn_get_building_stats(1);
        DB::statement("
            CREATE OR REPLACE FUNCTION fn_get_building_stats(p_building_id BIGINT)
            RETURNS TABLE (
                building_id             BIGINT,
                building_name           VARCHAR,
                building_type           VARCHAR,
                owner_name              VARCHAR,
                owner_email             VARCHAR,
                spaces_count            BIGINT,
                total_schedules_count   BIGINT,
                active_schedules_count  BIGINT
            )
            LANGUAGE plpgsql AS \$\$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM buildings WHERE id = p_building_id) THEN
                    RAISE EXCEPTION 'Edificio con id % no encontrado', p_building_id;
                END IF;

                RETURN QUERY
                SELECT
                    b.id,
                    b.name,
                    b.type,
                    u.name,
                    u.email,
                    COUNT(DISTINCT s.id),
                    COUNT(DISTINCT sc.id),
                    COUNT(DISTINCT CASE WHEN sc.is_active THEN sc.id END)
                FROM buildings b
                INNER JOIN users u  ON u.id  = b.user_id
                LEFT  JOIN spaces s ON s.building_id = b.id
                LEFT  JOIN schedules sc ON sc.space_id = s.id
                WHERE b.id = p_building_id
                GROUP BY b.id, b.name, b.type, u.name, u.email;
            END;
            \$\$
        ");

        // ── Función 2: espacios abiertos en un día y hora específicos ─────────
        // Uso: SELECT * FROM fn_get_open_spaces(1, '10:00');
        // day_of_week: 0=Dom, 1=Lun … 6=Sáb
        DB::statement("
            CREATE OR REPLACE FUNCTION fn_get_open_spaces(
                p_day_of_week SMALLINT,
                p_time        TIME
            )
            RETURNS TABLE (
                space_id      BIGINT,
                space_name    VARCHAR,
                space_type    VARCHAR,
                building_id   BIGINT,
                building_name VARCHAR,
                building_type VARCHAR,
                owner_name    VARCHAR,
                start_time    TIME,
                end_time      TIME
            )
            LANGUAGE plpgsql AS \$\$
            BEGIN
                RETURN QUERY
                SELECT
                    s.id,
                    s.name,
                    s.type,
                    b.id,
                    b.name,
                    b.type,
                    u.name,
                    sc.start_time,
                    sc.end_time
                FROM schedules sc
                INNER JOIN spaces s    ON s.id    = sc.space_id
                INNER JOIN buildings b ON b.id    = s.building_id
                INNER JOIN users u     ON u.id    = b.user_id
                WHERE sc.day_of_week = p_day_of_week
                  AND sc.is_active   = TRUE
                  AND p_time BETWEEN sc.start_time AND sc.end_time
                ORDER BY b.name, s.name;
            END;
            \$\$
        ");

        // ── Procedimiento: transferir propiedad de un edificio ────────────────
        // Uso: CALL sp_transfer_building(1, 2);
        DB::statement("
            CREATE OR REPLACE PROCEDURE sp_transfer_building(
                p_building_id   BIGINT,
                p_new_owner_id  BIGINT
            )
            LANGUAGE plpgsql AS \$\$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM buildings WHERE id = p_building_id) THEN
                    RAISE EXCEPTION 'Edificio % no encontrado', p_building_id;
                END IF;

                IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_new_owner_id) THEN
                    RAISE EXCEPTION 'Usuario % no encontrado', p_new_owner_id;
                END IF;

                UPDATE buildings
                SET user_id    = p_new_owner_id,
                    updated_at = NOW()
                WHERE id = p_building_id;
            END;
            \$\$
        ");
    }

    public function down(): void
    {
        DB::statement('DROP FUNCTION IF EXISTS fn_get_open_spaces(SMALLINT, TIME)');
        DB::statement('DROP FUNCTION IF EXISTS fn_get_building_stats(BIGINT)');
        DB::statement('DROP PROCEDURE IF EXISTS sp_transfer_building(BIGINT, BIGINT)');
    }
};
