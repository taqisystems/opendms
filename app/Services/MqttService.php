<?php

namespace App\Services;

use PhpMqtt\Client\Facades\MQTT;

class MqttService
{
    /**
     * Publish a command message to the hub via MQTT.
     */
    public function sendCommand(string $message, string $target, int $topic = 22): void
    {
        $payload = json_encode([
            'target'  => $target,
            'topic'   => $topic,
            'message' => $message,
        ]);

        MQTT::publish('hub/command', $payload);
    }
}
