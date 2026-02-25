<?php

namespace App\Models;

use App\Enums\Urgency;
use Illuminate\Database\Eloquent\Model;

class ClusterData extends Model
{
    protected $fillable = ['duck_id', 'topic', 'message_id', 'payload', 'path', 'hops', 'duck_type'];

    /**
     * Parse LAT/LNG from the payload and return a Google Maps URL, or null
     * if no coordinates are present.
     */
    /**
     * Extract the TEXT: value from a MSG payload, or return the raw payload.
     * e.g. "MSG,URGENCY:low,LAT:6.1,LNG:102.2,TEXT:Lalala" → "Lalala"
     */
    public function getDisplayTextAttribute(): ?string
    {
        if (!$this->payload) {
            return null;
        }

        if (preg_match('/TEXT:(.+)$/i', $this->payload, $matches)) {
            return trim($matches[1]);
        }

        return $this->payload;
    }

    public function getMapUrlAttribute(): ?string
    {
        if (!$this->payload) {
            return null;
        }

        if (preg_match('/LAT:(-?\d+(?:\.\d+)?),LNG:(-?\d+(?:\.\d+)?)/', $this->payload, $matches)) {
            return 'https://www.google.com/maps?q=' . $matches[1] . ',' . $matches[2];
        }

        return null;
    }

    public function getMapEmbedUrlAttribute(): ?string
    {
        if (!$this->payload) {
            return null;
        }

        if (preg_match('/LAT:(-?\d+(?:\.\d+)?),LNG:(-?\d+(?:\.\d+)?)/', $this->payload, $matches)) {
            return 'https://maps.google.com/maps?q=' . $matches[1] . ',' . $matches[2] . '&z=15&output=embed';
        }

        return null;
    }

    /**
     * Returns true when the payload is an SOS triggered from a mobile phone
     * (i.e. contains SOS but NOT SRC:DEVICE).
     */
    public function getSosFromMobileAttribute(): bool
    {
        if (!$this->payload) {
            return false;
        }

        return (bool) preg_match('/\bSOS\b/i', $this->payload)
            && !preg_match('/\bSRC:DEVICE\b/i', $this->payload);
    }

    /**
     * Returns true when the payload is an SOS triggered by a hardware button press.
     * e.g. "SOS,SRC:DEVICE,..."
     */
    public function getSosFromDeviceAttribute(): bool
    {
        if (!$this->payload) {
            return false;
        }

        return (bool) preg_match('/\bSOS\b.*\bSRC:DEVICE\b/i', $this->payload);
    }

    /**
     * Returns true when the payload contains LAT:none or LNG:none,
     * indicating the sender had no GPS fix.
     */
    public function getGpsUnavailableAttribute(): bool
    {
        if (!$this->payload) {
            return false;
        }

        return (bool) preg_match('/LAT:none|LNG:none/i', $this->payload);
    }

    /**
     * Parse the URGENT:<int> field from the payload and return a Urgency enum.
     * e.g. "URGENT:0" → Urgency::Low, "URGENT:1" → Urgency::Medium, "URGENT:2" → Urgency::Critical
     */
    public function getUrgencyAttribute(): ?Urgency
    {
        if (!$this->payload) {
            return null;
        }

        if (preg_match('/URGENCY:(\d+)/i', $this->payload, $matches)) {
            return Urgency::tryFrom((int) $matches[1]);
        }

        return null;
    }
}
