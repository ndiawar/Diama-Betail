// Fonction pour obtenir l'URL de l'API de manière sûre
function getApiBaseUrl(): string {
    try {
        // @ts-ignore - Vite environment variables
        return import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api';
    } catch {
        return 'http://127.0.0.1:8000/api';
    }
}

const API_BASE_URL = getApiBaseUrl();

export interface Vache {
    id: number;
    id_rfid: string;
    nom: string;
    race: string | null;
    sexe: string;
    age: number | null;
    poids: number;
    temperature: number;
    production_lait: number;
    statut_sante: string;
    dernier_vaccin: string;
    prochaine_vaccination: string | null;
    date_mise_bas: string;
    nb_portees: number;
    latitude: number;
    longitude: number;
    altitude: number;
    gps_actif: boolean;
    derniere_position_at: string;
    derniere_mise_a_jour_at: string;
    position: {
        lat: number;
        lng: number;
    };
    statut_badge: string;
    gps_badge: string;
    age_annees: number;
    positions: Array<{
        id: number;
        vache_id: number;
        latitude: number;
        longitude: number;
        altitude: number;
        timestamp: string;
    }>;
    [key: string]: unknown; // Index signature pour compatibilité avec mantine-datatable
}

export interface Stats {
    total_vaches: number;
    en_bonne_sante: number;
    en_gestation: number;
    gps_actif: number;
    temperature_moyenne: string;
    production_moyenne: string;
    derniere_mise_a_jour: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    count?: number;
}

class ApiService {
    private async request<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Récupérer toutes les vaches
    async getVaches(): Promise<ApiResponse<Vache[]>> {
        return this.request<ApiResponse<Vache[]>>('/vaches');
    }

    // Récupérer les statistiques
    async getStats(): Promise<ApiResponse<Stats>> {
        return this.request<ApiResponse<Stats>>('/vaches/stats');
    }

    // Récupérer une vache spécifique
    async getVache(id: number): Promise<ApiResponse<Vache>> {
        return this.request<ApiResponse<Vache>>(`/vaches/${id}`);
    }

    // Vérifier la santé de l'API
    async getHealth(): Promise<any> {
        return this.request('/health');
    }

    // Supprimer une vache
    async deleteVache(id: number): Promise<ApiResponse<any>> {
        try {
            const response = await fetch(`${API_BASE_URL}/vaches/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Delete vache failed:', error);
            throw error;
        }
    }

    // Modifier une vache
    async updateVache(id: number, data: Partial<Vache>): Promise<ApiResponse<Vache>> {
        try {
            const response = await fetch(`${API_BASE_URL}/vaches/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Update vache failed:', error);
            throw error;
        }
    }

    // Créer une nouvelle vache
    async createVache(data: Partial<Vache>): Promise<ApiResponse<Vache>> {
        try {
            const response = await fetch(`${API_BASE_URL}/vaches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Create vache failed:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService(); 