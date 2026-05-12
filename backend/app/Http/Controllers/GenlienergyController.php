<?php

namespace App\Http\Controllers;

use App\Models\Barrio;
use App\Models\Genlienergy;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GenlienergyController extends Controller
{
    /**
     * Display a listing (Modificado para responder JSON a React)
     */
    public function index(Request $request)
    {
        $query = Genlienergy::query();

        $query->when($request->tipo, function ($q) use ($request) {
            return $q->where('tipo', $request->tipo);
        });

        $query->when($request->fecha_inicio, function ($q) use ($request) {
            return $q->whereDate('fecha', '>=', $request->fecha_inicio);
        });

        $query->when($request->fecha_fin, function ($q) use ($request) {
            return $q->whereDate('fecha', '<=', $request->fecha_fin);
        });

        $genlienergy = $query->orderBy('fecha', 'desc')->get();

        // Si la petición viene de React (Axios), respondemos JSON
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($genlienergy);
        }

        return view('index', compact('genlienergy'));
    }

    /**
     * Store (CORREGIDO PARA REACT)
     */
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'barrio' => 'required|string',
                'energiaS' => 'required|numeric',
                'pEnergia' => 'required|numeric',
                'usuario' => 'required|string',
                'tipo' => 'required|string',
                'observaciones' => 'nullable|string',
            ]);

            $data['fecha'] = now();
            Genlienergy::create($data);

            return response()->json(['status' => 'success'], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update (CORREGIDO PARA REACT)
     */
    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'barrio' => 'required|string',
            'energiaS' => 'required|numeric',
            'pEnergia' => 'required|numeric',
            'usuario' => 'required|string',
            'tipo' => 'required|string',
            'observaciones' => 'nullable|string',
        ]);

        $registro = Genlienergy::findOrFail($id);
        $registro->update($data);

        return response()->json([
            'message' => 'Registro actualizado',
            'data' => $registro
        ]);
    }

    /**
     * Destroy (CORREGIDO PARA REACT)
     */
    public function destroy(string $id)
    {
        $genlienergy = Genlienergy::findOrFail($id);
        $genlienergy->delete();

        return response()->json(['message' => 'Eliminado correctamente']);
    }

    /**
     * Estadísticas para los gráficos (NUEVO)
     */
    public function getStats()
    {
        // Verificar rol manualmente usando auth()->user() después del middleware identify
        $user = auth()->user();
        if (!$user || !$user->hasAnyRole(['administrador', 'gerente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $porBarrio = Genlienergy::select(
                'barrio as name',
                DB::raw('CAST(SUM(pEnergia) AS DECIMAL(10,2)) as value')
            )
            ->groupBy('barrio')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => floatval($item->value)
                ];
            })
            ->toArray();

        $porEnergia = Genlienergy::select(
                'barrio as name',
                DB::raw('CAST(SUM(energiaS) AS DECIMAL(10,2)) as value')
            )
            ->groupBy('barrio')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'value' => floatval($item->value)
                ];
            })
            ->toArray();

        $porTipo = Genlienergy::select(
                'tipo',
                DB::raw('CAST(SUM(pEnergia) AS DECIMAL(10,2)) as total')
            )
            ->groupBy('tipo')
            ->get()
            ->map(function ($item) {
                return [
                    'tipo' => $item->tipo,
                    'total' => floatval($item->total)
                ];
            })
            ->toArray();

        return response()->json([
            'porBarrio' => $porBarrio,
            'porEnergia' => $porEnergia,
            'porTipo' => $porTipo
        ]);
    }

    public function getBarrios()
    {
        // Corregido para que devuelva la lista real de barrios
        $barrios = Barrio::orderBy('nombre')->pluck('nombre');
        return response()->json($barrios);
    }

    /**
     * Dashboard stats completo para el dashboard de análisis
     */
    public function getDashboardStats()
    {
        $user = auth()->user();
        if (!$user || !$user->hasAnyRole(['administrador', 'gerente'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        // Datos mensuales (últimos 12 meses)
        $registros = Genlienergy::orderBy('fecha', 'asc')->get();

        $mensual = [];
        $mesesAbrev = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        $mesesData = $registros->groupBy(function ($item) {
            return substr($item->fecha, 0, 7);
        });

        foreach ($mesesData as $mes => $items) {
            $mesNum = (int)substr($mes, 5, 2) - 1;
            $perdida = $items->sum('pEnergia');
            $consumo = $items->sum('energiaS');
            $eficiencia = $consumo > 0 ? round((($consumo - $perdida) / $consumo) * 100, 1) : 0;
            $mensual[] = [
                'mes' => $mesesAbrev[$mesNum] ?? substr($mes, 5, 2),
                'perdida' => floatval($perdida),
                'consumo' => floatval($consumo),
                'eficiencia' => $eficiencia
            ];
        }

        // Si no hay datos mensuales, calcular estadísticas generales
        if (empty($mensual)) {
            $totalPerdida = Genlienergy::sum('pEnergia') ?? 0;
            $totalConsumo = Genlienergy::sum('energiaS') ?? 0;
            $eficienciaGeneral = $totalConsumo > 0 ? round((($totalConsumo - $totalPerdida) / $totalConsumo) * 100, 1) : 0;
            $mensual[] = [
                'mes' => 'General',
                'perdida' => floatval($totalPerdida),
                'consumo' => floatval($totalConsumo),
                'eficiencia' => $eficienciaGeneral
            ];
        }

        // Por zona (barrio) - usando pEnergia
        $porZonaRaw = Genlienergy::select(
                'barrio as zona',
                DB::raw('SUM(pEnergia) as perdida'),
                DB::raw('SUM(energiaS) as consumo'),
                DB::raw('COUNT(*) as cantidad')
            )
            ->groupBy('barrio')
            ->get()
            ->map(function ($item) {
                return [
                    'zona' => $item->zona,
                    'perdida' => floatval($item->perdida),
                    'consumo' => floatval($item->consumo),
                    'casas' => intval($item->cantidad)
                ];
            })
            ->toArray();

        // Por tipo de pérdida (como porcentaje)
        $totales = Genlienergy::select(
                DB::raw('SUM(pEnergia) as total')
            )->first()->total ?? 1;

        $porTipoRaw = Genlienergy::select(
                'tipo',
                DB::raw('SUM(pEnergia) as total')
            )
            ->groupBy('tipo')
            ->get()
            ->map(function ($item) use ($totales) {
                $nombre = $item->tipo === 'Tecnica' ? 'Técnica' : ($item->tipo === 'No Tecnica' ? 'No técnica' : $item->tipo);
                return [
                    'name' => $nombre,
                    'total' => floatval($item->total),
                    'value' => round((floatval($item->total) / floatval($totales)) * 100, 1)
                ];
            })
            ->toArray();

        // Top 5 registros con mayor pérdida
        $topCasas = Genlienergy::orderBy('pEnergia', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item, $index) {
                return [
                    'id' => 'Registro #' . $item->idRegistro,
                    'perdida' => floatval($item->pEnergia),
                    'direccion' => $item->barrio . ' - ' . ($item->observaciones ?: 'Sin obs.')
                ];
            })
            ->toArray();

        return response()->json([
            'mensual' => $mensual,
            'porZona' => $porZonaRaw,
            'tipoPerdida' => $porTipoRaw,
            'topCasas' => $topCasas
        ]);
    }

    public function generarPDF($id)
    {
        $registro = Genlienergy::findOrFail($id);
        $pdf = Pdf::loadView('reporte_individual', compact('registro'));
        return $pdf->stream();
    }
}