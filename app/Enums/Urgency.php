<?php

namespace App\Enums;

enum Urgency: int
{
    case Low      = 0;
    case Medium   = 1;
    case Critical = 2;

    public function label(): string
    {
        return match ($this) {
            Urgency::Low      => 'Low',
            Urgency::Medium   => 'Medium',
            Urgency::Critical => 'Critical',
        };
    }

    public function color(): string
    {
        return match ($this) {
            Urgency::Low      => 'green',
            Urgency::Medium   => 'yellow',
            Urgency::Critical => 'red',
        };
    }
}
