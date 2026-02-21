<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\ClusterData;
use Illuminate\Support\Facades\Log;

class ProcessMqttMessage implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(protected $payload)
    {
        $this->payload = $payload;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
	    Log::info("Processing ClusterDuck Data...");
	    $data = json_decode($this->payload, true);
	    ClusterData::create([
	      'duck_id'    => $data["payload"]["DeviceID"],
              'topic'      => $data["eventType"],
              'message_id' => $data["MessageID"],
              'payload'    => $data["payload"]["Message"],
	      'path'       => $data["payload"]["path"] ?? null,
              'hops'       => $data["payload"]["hops"],
              'duck_type'  => $data["payload"]["duckType"]
	    ]);
    }
}
