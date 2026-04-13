<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Building;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\BuildingExport;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ExportController extends Controller
{
    /**
     * GET /api/buildings/{building}/export
     * Descarga Excel con espacios y horarios del edificio.
     */
    public function exportExcel(Request $request, Building $building): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        Gate::authorize('view', $building);

        $filename = 'edificio-' . $building->id . '-' . now()->format('Ymd') . '.xlsx';

        return Excel::download(new BuildingExport($building), $filename);
    }

    /**
     * GET /api/buildings/{building}/qr
     * Genera imagen PNG del QR con la URL pública del mapa.
     */
    public function qrCode(Building $building): Response
    {
        $url = url('/map/' . $building->public_token);

        $qr = QrCode::format('png')
            ->size(300)
            ->margin(1)
            ->generate($url);

        return response($qr, 200, [
            'Content-Type'        => 'image/png',
            'Content-Disposition' => 'inline; filename="qr-' . $building->public_token . '.png"',
        ]);
    }
}
