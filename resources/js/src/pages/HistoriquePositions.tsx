import React, { useState, useEffect } from 'react';
import { DataTable } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import api from '../services/api';

interface Position {
    id: number;
    vache: {
        id: number;
        nom: string;
        id_rfid: string;
    };
    latitude: number;
    longitude: number;
    altitude?: number;
    timestamp: string;
}

interface HistoriqueStats {
    total_positions: number;
    vaches_trackees: number;
    premiere_position: string;
    derniere_position: string;
}

interface FilterData {
    vache_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    page?: number;
}

const HistoriquePositions = () => {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [positions, setPositions] = useState<Position[]>([]);
    const [stats, setStats] = useState<HistoriqueStats>({
        total_positions: 0,
        vaches_trackees: 0,
        premiere_position: '',
        derniere_position: ''
    });
    const [vaches, setVaches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        per_page: 50,
        total: 0,
        has_next: false,
        has_previous: false
    });

    // Filtres
    const [filters, setFilters] = useState<FilterData>({
        limit: 50,
        page: 1
    });

    const [selectedVache, setSelectedVache] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Charger les vaches pour le filtre
    useEffect(() => {
        loadVaches();
    }, []);

    // Charger l'historique
    useEffect(() => {
        loadPositionsHistory();
    }, [filters]);

    const loadVaches = async () => {
        try {
            const response = await api.getVaches();
            if (response.success) {
                setVaches(response.data);
            }
        } catch (error) {
            console.error('Erreur chargement vaches:', error);
        }
    };

    const loadPositionsHistory = async () => {
        try {
            setLoading(true);
            const response = await api.getPositionHistory(filters);
            
            if (response.success) {
                setPositions(response.data);
                setStats(response.stats);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        const newFilters: FilterData = {
            page: 1,
            limit: 50
        };

        if (selectedVache) {
            newFilters.vache_id = parseInt(selectedVache);
        }
        if (startDate) {
            newFilters.start_date = startDate;
        }
        if (endDate) {
            newFilters.end_date = endDate;
        }

        setFilters(newFilters);
    };

    const resetFilters = () => {
        setSelectedVache('');
        setStartDate('');
        setEndDate('');
        setFilters({ limit: 50, page: 1 });
    };

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatCoordinate = (coord: number) => {
        return coord.toFixed(6);
    };

    const columns = [
        {
            accessor: 'vache.nom',
            title: 'Vache',
            render: (row: Position) => (
                <div>
                    <div className="font-semibold text-primary">{row.vache.nom}</div>
                    <div className="text-xs text-gray-500">{row.vache.id_rfid}</div>
                </div>
            )
        },
        {
            accessor: 'latitude',
            title: 'Latitude',
            render: (row: Position) => (
                <span className="font-mono text-sm">{formatCoordinate(row.latitude)}</span>
            )
        },
        {
            accessor: 'longitude',
            title: 'Longitude',
            render: (row: Position) => (
                <span className="font-mono text-sm">{formatCoordinate(row.longitude)}</span>
            )
        },
        {
            accessor: 'altitude',
            title: 'Altitude',
            render: (row: Position) => (
                <span className="text-sm">
                    {row.altitude ? `${row.altitude.toFixed(1)} m` : '-'}
                </span>
            )
        },
        {
            accessor: 'timestamp',
            title: 'Date/Heure',
            render: (row: Position) => (
                <span className="text-sm">{formatDate(row.timestamp)}</span>
            )
        },
        {
            accessor: 'actions',
            title: 'Actions',
            render: (row: Position) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${row.latitude},${row.longitude}`, '_blank')}
                        className="btn btn-sm btn-outline-primary"
                        title="Voir sur Google Maps"
                        aria-label={`Voir la position de ${row.vache.nom} sur Google Maps`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                fill="currentColor"
                            />
                        </svg>
                        <span className="sr-only">Voir sur Google Maps</span>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div className="panel">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">📍 Historique des Positions</h1>
                        <p className="text-gray-600 mt-2">Consultez l'historique complet des déplacements de vos vaches</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{stats.total_positions.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Positions enregistrées</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-success">{stats.vaches_trackees}</div>
                            <div className="text-sm text-gray-500">Vaches trackées</div>
                        </div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label htmlFor="filter-vache" className="block text-sm font-medium text-gray-700 mb-2">Vache</label>
                        <select
                            id="filter-vache"
                            value={selectedVache}
                            onChange={(e) => setSelectedVache(e.target.value)}
                            className="form-select w-full"
                            title="Sélectionner une vache pour filtrer l'historique"
                            aria-label="Sélectionner une vache"
                        >
                            <option value="">Toutes les vaches</option>
                            {vaches.map((vache) => (
                                <option key={vache.id} value={vache.id}>
                                    {vache.nom} ({vache.id_rfid})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                        <input
                            id="filter-start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="form-input w-full"
                            title="Date de début pour filtrer l'historique"
                            placeholder="Sélectionner une date de début"
                            aria-label="Date de début du filtrage"
                        />
                    </div>

                    <div>
                        <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                        <input
                            id="filter-end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="form-input w-full"
                            title="Date de fin pour filtrer l'historique"
                            placeholder="Sélectionner une date de fin"
                            aria-label="Date de fin du filtrage"
                        />
                    </div>

                    <div className="flex items-end space-x-2">
                        <button
                            onClick={applyFilters}
                            className="btn btn-primary flex-1"
                            title="Appliquer les filtres sélectionnés"
                            aria-label="Appliquer les filtres de recherche"
                        >
                            Filtrer
                        </button>
                        <button
                            onClick={resetFilters}
                            className="btn btn-outline-secondary"
                            title="Réinitialiser tous les filtres"
                            aria-label="Réinitialiser les filtres"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Statistiques de période */}
                {stats.premiere_position && stats.derniere_position && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Première position</div>
                            <div className="font-semibold">{formatDate(stats.premiere_position)}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-400">Dernière position</div>
                            <div className="font-semibold">{formatDate(stats.derniere_position)}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tableau des positions */}
            <div className="panel">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className="whitespace-nowrap table-hover"
                        records={positions}
                        columns={columns}
                        fetching={loading}
                        noRecordsText="Aucune position trouvée"
                        page={pagination.current_page}
                        onPageChange={handlePageChange}
                        totalRecords={pagination.total}
                        recordsPerPage={pagination.per_page}
                        paginationText={({ from, to, totalRecords }) => 
                            `Affichage de ${from} à ${to} sur ${totalRecords} positions`
                        }
                    />
                </div>

                {/* Pagination info */}
                {pagination.total > 0 && (
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                        <div>
                            Page {pagination.current_page} sur {pagination.total_pages}
                        </div>
                        <div>
                            {pagination.total.toLocaleString()} positions au total
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoriquePositions;
