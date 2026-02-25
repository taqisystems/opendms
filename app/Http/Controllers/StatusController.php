<?php

namespace App\Http\Controllers;

use App\Services\ClusterDataService;
use App\Services\MqttService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function __construct(
        private ClusterDataService $clusterDataService,
        private MqttService $mqttService,
    ) {}

    public function index()
    {
        $mamaducks      = $this->clusterDataService->getLatestPerDuck();
        $latestCoordsId = $this->clusterDataService->latestWithCoordsId($mamaducks);

        return view('status', compact('mamaducks', 'latestCoordsId'));
    }

    public function history(): JsonResponse
    {
        return response()->json($this->clusterDataService->buildHistoryResponse());
    }

    public function message(Request $request): JsonResponse
    {
        $this->mqttService->sendCommand(
            message: $request->input('message'),
            target:  $request->input('duck_id'),
        );

        return response()->json(['message' => 'Form submitted successfully!']);
    }
}
