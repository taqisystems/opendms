<?php

namespace App\Http\Controllers;

use App\Services\ClusterDataService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private ClusterDataService $clusterDataService)
    {}

    public function index()
    {
        $clusters  = $this->clusterDataService->getAllOrderedByLatest();
        $stats     = $this->clusterDataService->getDashboardStats();

        return view('dashboard', [
            'clusters'  => $clusters,
            'count'     => $stats['count'],
            'mamaducks' => $stats['mamaducks'],
        ]);
    }

    public function json(): JsonResponse
    {
        return response()->json($this->clusterDataService->getJsonFeed(), 200);
    }

    public function timeline(): JsonResponse
    {
        return response()->json($this->clusterDataService->getTimeline(), 200);
    }
}
