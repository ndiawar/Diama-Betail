<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Vache;

class VacheUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $vache;
    public $stats;

    /**
     * Create a new event instance.
     */
    public function __construct(Vache $vache, array $stats = [])
    {
        $this->vache = $vache;
        $this->stats = $stats;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('diama-updates'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'vache.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'vache' => $this->vache->load(['positions' => function($query) {
                $query->recent(24)->orderBy('timestamp', 'desc');
            }]),
            'stats' => $this->stats,
            'timestamp' => now()->toISOString(),
        ];
    }
} 