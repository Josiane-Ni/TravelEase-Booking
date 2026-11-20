<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public static function record(?int $actor, string $action, ?string $resource = null, ?int $id = null, array $metadata = []): void
    {
        AuditLog::create(['actor_id' => $actor, 'action' => $action, 'resource' => $resource, 'resource_id' => $id, 'metadata' => $metadata]);
    }
}
