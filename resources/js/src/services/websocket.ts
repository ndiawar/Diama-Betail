import Pusher from 'pusher-js';

// Fonction pour obtenir les variables d'environnement de manière sûre
function getEnvVar(key: string, defaultValue: string): string {
    try {
        // @ts-ignore - Vite environment variables
        return import.meta.env?.[key] || defaultValue;
    } catch {
        return defaultValue;
    }
}

class WebSocketService {
    private pusher: Pusher;
    private channel: any;

    constructor() {
        this.pusher = new Pusher(getEnvVar('VITE_PUSHER_APP_KEY', 'da023cbd84a0d6e8816b615aafc7e1fd'), {
            cluster: getEnvVar('VITE_PUSHER_APP_CLUSTER', 'mt1'),
            wsHost: getEnvVar('VITE_PUSHER_HOST', '127.0.0.1'),
            wsPort: parseInt(getEnvVar('VITE_PUSHER_PORT', '6001')),
            forceTLS: false,
            disableStats: true,
        });
    }

    connect() {
        this.channel = this.pusher.subscribe('diama-updates');
        console.log('🔌 WebSocket connecté au canal diama-updates');
    }

    disconnect() {
        if (this.channel) {
            this.pusher.unsubscribe('diama-updates');
        }
        this.pusher.disconnect();
    }

    onVacheUpdate(callback: (data: any) => void) {
        if (this.channel) {
            this.channel.bind('vache.updated', callback);
        }
    }

    onStatsUpdate(callback: (data: any) => void) {
        if (this.channel) {
            this.channel.bind('vache.updated', (data: any) => {
                if (data.stats) {
                    callback(data.stats);
                }
            });
        }
    }
}

export const websocketService = new WebSocketService(); 