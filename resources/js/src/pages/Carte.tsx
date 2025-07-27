import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiService, Vache } from '../services/api';
import { websocketService } from '../services/websocket';

// Fonction pour formater les dates
const formatDate = (date: string) => {
    if (!date) return '-';
    
    const dt = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60));
    
    // Si moins de 24h, afficher "Il y a Xh"
    if (diffInHours < 24) {
        if (diffInHours === 0) return 'À l\'instant';
        if (diffInHours === 1) return 'Il y a 1h';
        return `Il y a ${diffInHours}h`;
    }
    
    // Si moins de 7 jours, afficher "Il y a Xj"
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        if (diffInDays === 1) return 'Hier';
        return `Il y a ${diffInDays}j`;
    }
    
    // Sinon, afficher la date courte
    const day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
};

// Correction pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte sur une position
function MapCenter({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

// Données des vaches avec positions GPS au Sénégal (fallback)
const vachesDataFallback = [
    {
        id: 1,
        nom: 'Belle',
        position: [14.7167, -17.4677] as [number, number], // Dakar - Plateau
        race: 'Holstein',
        age: 5,
        statut: 'En bonne santé',
        dernierePosition: '2024-07-26 14:30'
    },
    {
        id: 2,
        nom: 'Rosie',
        position: [14.7247, -17.4567] as [number, number], // Dakar - Médina
        race: 'Jersey',
        age: 3,
        statut: 'En gestation',
        dernierePosition: '2024-07-26 14:25'
    },
    {
        id: 3,
        nom: 'Daisy',
        position: [14.7087, -17.4787] as [number, number], // Dakar - Almadies
        race: 'Angus',
        age: 7,
        statut: 'En bonne santé',
        dernierePosition: '2024-07-26 14:20'
    },
    {
        id: 4,
        nom: 'Mimi',
        position: [14.7327, -17.4457] as [number, number], // Dakar - Yoff
        race: 'Zébu',
        age: 4,
        statut: 'En bonne santé',
        dernierePosition: '2024-07-26 14:15'
    },
    {
        id: 5,
        nom: 'Lola',
        position: [14.7007, -17.4897] as [number, number], // Dakar - Ouakam
        race: 'Holstein',
        age: 6,
        statut: 'En gestation',
        dernierePosition: '2024-07-26 14:10'
    }
];

const Carte = () => {
    const [vaches, setVaches] = useState<Vache[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVache, setSelectedVache] = useState<any>(null);
    const [center, setCenter] = useState<[number, number]>([14.7167, -17.4677]); // Dakar - Centre
    const [zoom, setZoom] = useState(13);

    // Charger les données des vaches
    useEffect(() => {
        loadVachesData();
        
        // Connexion WebSocket pour les mises à jour temps réel
        websocketService.connect();
        
        // Écouter les mises à jour des vaches
        websocketService.onVacheUpdate((data) => {
            console.log('🔄 Mise à jour carte temps réel:', data);
            if (data.vache) {
                setVaches(prevVaches => {
                    const updatedVaches = prevVaches.map(vache => 
                        vache.id === data.vache.id ? data.vache : vache
                    );
                    return updatedVaches;
                });
            }
        });
        
        // Nettoyage à la fermeture
        return () => {
            websocketService.disconnect();
        };
    }, []);

    const loadVachesData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getVaches();
            setVaches(response.data);
        } catch (error) {
            console.error('Erreur chargement vaches:', error);
            // Utiliser les données de fallback
            setVaches(vachesDataFallback as any);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkerClick = (vache: any) => {
        setSelectedVache(vache);
        if (vache.latitude && vache.longitude) {
            setCenter([Number(vache.latitude), Number(vache.longitude)]);
            setZoom(15);
        }
    };

    const handleVacheSelect = (vache: any) => {
        setSelectedVache(vache);
        if (vache.latitude && vache.longitude) {
            setCenter([Number(vache.latitude), Number(vache.longitude)]);
            setZoom(15);
        }
    };

    return (
        <div className="panel mt-6">
            <div className="flex items-center justify-between mb-5">
                <h5 className="font-semibold text-lg dark:text-white-light">Carte des Vaches</h5>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            {vaches.filter(vache => vache.latitude && vache.longitude).length} vaches avec GPS
                        </span>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {vaches.length} vaches
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Liste des vaches */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Vaches suivies</h6>
                        <div className="space-y-2">
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                                    <p className="text-sm text-gray-500 mt-2">Chargement...</p>
                                </div>
                            ) : vaches.length > 0 ? (
                                vaches.map((vache) => (
                                    <div
                                        key={vache.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                            selectedVache?.id === vache.id
                                                ? 'bg-primary/10 border border-primary/20'
                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                        }`}
                                        onClick={() => handleVacheSelect(vache)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h6 className="font-medium text-gray-800 dark:text-gray-200">{vache.nom}</h6>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{vache.race || 'Non spécifiée'}</p>
                                            </div>
                                            <div className={`w-2 h-2 rounded-full ${
                                                vache.statut_sante === 'bonne' ? 'bg-green-500' : 
                                                vache.statut_sante === 'attention' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}></div>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-gray-400">
                                                {vache.derniere_mise_a_jour_at ? 
                                                    formatDate(vache.derniere_mise_a_jour_at) : 
                                                    'Position inconnue'
                                                }
                                            </p>
                                            {(!vache.latitude || !vache.longitude) && (
                                                <span className="text-xs text-orange-500 bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
                                                    GPS inactif
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    Aucune vache trouvée
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Carte */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="h-[600px] w-full relative">
                            <MapContainer
                                center={center}
                                zoom={zoom}
                                style={{ height: '100%', width: '100%' }}
                                className="z-0"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                
                                {vaches
                                    .filter(vache => vache.latitude && vache.longitude && 
                                        !isNaN(Number(vache.latitude)) && !isNaN(Number(vache.longitude)))
                                    .map((vache) => (
                                    <Marker
                                        key={vache.id}
                                        position={[Number(vache.latitude), Number(vache.longitude)] as [number, number]}
                                        eventHandlers={{
                                            click: () => handleMarkerClick(vache),
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <h6 className="font-semibold text-gray-800">{vache.nom}</h6>
                                                <p className="text-sm text-gray-600">Race: {vache.race || 'Non spécifiée'}</p>
                                                <p className="text-sm text-gray-600">Température: {vache.temperature}°C</p>
                                                <p className="text-sm text-gray-600">Production: {vache.production_lait}L/jour</p>
                                                <p className="text-sm text-gray-600">Statut: {vache.statut_sante}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Dernière mise à jour: {vache.derniere_mise_a_jour_at ? 
                                                        formatDate(vache.derniere_mise_a_jour_at) : 
                                                        'Inconnue'
                                                    }
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                                
                                <MapCenter center={center} />
                            </MapContainer>
                            
                            {/* Message si aucune vache avec GPS */}
                            {vaches.filter(vache => vache.latitude && vache.longitude).length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                                    <div className="text-center p-6">
                                        <div className="text-6xl mb-4">📍</div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                            Aucune vache avec GPS actif
                                        </h3>
                                        <p className="text-gray-500">
                                            Les vaches créées manuellement n'ont pas de position GPS.<br />
                                            Activez le GPS pour voir leur position sur la carte.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Informations détaillées */}
            {selectedVache && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h6 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Détails de {selectedVache.nom}
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Race</p>
                            <p className="font-medium">{selectedVache.race}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Âge</p>
                            <p className="font-medium">{selectedVache.age} ans</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                            <p className="font-medium">{selectedVache.statut}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Carte; 