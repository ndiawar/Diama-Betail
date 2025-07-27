import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import ReactApexChart from 'react-apexcharts';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../store';
import { setPageTitle } from '../store/themeConfigSlice';
import { apiService, Vache, Stats } from '../services/api';
import { websocketService } from '../services/websocket';

const Index = () => {
    const dispatch = useDispatch();
    const [vaches, setVaches] = useState<Vache[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(setPageTitle('Dashboard - DIAMA'));
        loadDashboardData();
        
        // Connexion WebSocket pour les mises à jour temps réel
        websocketService.connect();
        
        // Écouter les mises à jour des vaches
        websocketService.onVacheUpdate((data) => {
            console.log('🔄 Mise à jour temps réel reçue:', data);
            if (data.vache) {
                setVaches(prevVaches => {
                    const updatedVaches = prevVaches.map(vache => 
                        vache.id === data.vache.id ? data.vache : vache
                    );
                    return updatedVaches;
                });
            }
            if (data.stats) {
                setStats(data.stats);
            }
        });
        
        // Nettoyage à la fermeture
        return () => {
            websocketService.disconnect();
        };
    }, [dispatch]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Charger les vaches et les statistiques en parallèle
            const [vachesResponse, statsResponse] = await Promise.all([
                apiService.getVaches(),
                apiService.getStats()
            ]);
            
            setVaches(vachesResponse.data);
            setStats(statsResponse.data);
        } catch (err) {
            console.error('Erreur chargement dashboard:', err);
            setError('Erreur de connexion à l\'API');
        } finally {
            setLoading(false);
        }
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    // Configuration pour le graphique donut de répartition
    const repartitionOptions = {
        series: stats ? [stats.en_bonne_sante, stats.total_vaches - stats.en_bonne_sante] : [0, 0],
        options: {
            chart: {
                type: 'donut' as const,
                height: 200,
            },
            labels: ['En bonne santé', 'Autres'],
            colors: ['#10B981', '#6B7280'],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                fontSize: '16px',
                                fontWeight: 600,
                                color: '#263238',
                            },
                        },
                    },
                },
            },
            legend: {
                position: 'bottom' as const,
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: 200
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        },
    };

    // Fonction pour formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Fonction pour obtenir le badge de statut
    const getStatusBadge = (statut: string) => {
        const badges = {
            'bonne': 'bg-success/20 text-success',
            'attention': 'bg-warning/20 text-warning',
            'malade': 'bg-danger/20 text-danger'
        };
        return badges[statut as keyof typeof badges] || 'bg-primary/20 text-primary';
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <span className="ml-3 text-lg">Chargement des données...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <div className="text-lg text-gray-600 mb-2">Erreur de connexion</div>
                    <div className="text-sm text-gray-500 mb-4">{error}</div>
                    <button 
                        onClick={loadDashboardData}
                        className="btn btn-primary"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Accueil</span>
                </li>
            </ul>

            {/* Section de bienvenue */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">👋 Bonjour</h1>
                            <p className="text-blue-100 text-lg">Bienvenue dans votre tableau de bord DIAMA</p>
                            {stats && (
                                <p className="text-blue-100 text-sm mt-2">
                                    Dernière mise à jour : {formatDate(stats.derniere_mise_a_jour)}
                                </p>
                            )}
                            <div className="flex items-center mt-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                <span className="text-blue-100 text-sm">Temps réel actif</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl mb-2">🐄</div>
                            <div className="text-sm text-blue-100">Gestion du troupeau</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Cartes principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-white text-lg font-semibold">Total Vaches</div>
                            <div className="text-3xl font-bold text-white mt-2">
                                {stats?.total_vaches || 0}
                            </div>
                            <div className="text-cyan-100 text-sm mt-1">
                                {vaches.length > 0 ? '+1 cette semaine' : 'Aucune vache'}
                            </div>
                        </div>
                        <div className="text-4xl">🐄</div>
                    </div>
                </div>

                <div className="panel bg-gradient-to-r from-violet-500 to-violet-400 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-white text-lg font-semibold">En bonne santé</div>
                            <div className="text-3xl font-bold text-white mt-2">
                                {stats?.en_bonne_sante || 0}
                            </div>
                            <div className="text-violet-100 text-sm mt-1">Stable</div>
                        </div>
                        <div className="text-4xl">✅</div>
                    </div>
                </div>

                <div className="panel bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-white text-lg font-semibold">En gestation</div>
                            <div className="text-3xl font-bold text-white mt-2">
                                {stats?.en_gestation || 0}
                            </div>
                            <div className="text-blue-100 text-sm mt-1">
                                {stats?.en_gestation ? '+1 cette semaine' : 'Aucune'}
                            </div>
                        </div>
                        <div className="text-4xl">🤰</div>
                    </div>
                </div>

                <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400 shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-white text-lg font-semibold">GPS Actif</div>
                            <div className="text-3xl font-bold text-white mt-2">
                                {stats?.gps_actif || 0}
                            </div>
                            <div className="text-fuchsia-100 text-sm mt-1">
                                {stats?.total_vaches ? `${Math.round((stats.gps_actif / stats.total_vaches) * 100)}% du troupeau` : 'Aucun GPS'}
                            </div>
                        </div>
                        <div className="text-4xl">📍</div>
                    </div>
                </div>
            </div>

            {/* Section avec 6 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* Troupeau */}
                <div className="panel bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-green-800 dark:text-green-200">🐄 Troupeau</h3>
                        <div className="text-2xl">{stats?.total_vaches || 0}</div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-300">animaux</div>
                </div>

                {/* Température moyenne */}
                <div className="panel bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">🌡️ Température</h3>
                        <div className="text-2xl">{stats?.temperature_moyenne ? parseFloat(stats.temperature_moyenne).toFixed(1) : '0'}°C</div>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300">moyenne</div>
                </div>

                {/* Production moyenne */}
                <div className="panel bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-200">🥛 Production</h3>
                        <div className="text-2xl">{stats?.production_moyenne ? parseFloat(stats.production_moyenne).toFixed(1) : '0'}L</div>
                    </div>
                    <div className="text-sm text-red-600 dark:text-red-300">moyenne/jour</div>
                </div>

                {/* Répartition */}
                <div className="panel bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-purple-800 dark:text-purple-200">📊 Répartition</h3>
                        <div className="text-sm">
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                <span>{stats?.en_bonne_sante || 0} en bonne santé</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                <span>{stats?.en_gestation || 0} en gestation</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-32">
                        <ReactApexChart series={repartitionOptions.series} options={repartitionOptions.options} type="donut" height={120} />
                    </div>
                </div>

                {/* Suivi GPS */}
                <div className="panel bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-orange-800 dark:text-orange-200">📍 Suivi GPS</h3>
                        <div className="text-right">
                            <div className="text-lg font-bold">{stats?.gps_actif || 0}/{stats?.total_vaches || 0}</div>
                            <div className="text-xs text-orange-600 dark:text-orange-300">Localisés</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">GPS actif</span>
                            <span className="text-green-600 font-semibold">{stats?.gps_actif || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">GPS inactif</span>
                            <span className="text-red-600 font-semibold">{(stats?.total_vaches || 0) - (stats?.gps_actif || 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Derniers animaux */}
                <div className="panel bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700">
                    <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-4">🐄 Derniers animaux</h3>
                    <div className="space-y-3">
                        {vaches.slice(0, 2).map((vache) => (
                            <div key={vache.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span>🐄</span>
                                    <span className="font-medium">{vache.nom}</span>
                                </div>
                                <span className={`badge ${getStatusBadge(vache.statut_sante)}`}>
                                    {vache.statut_sante === 'bonne' ? '✅ Stable' : 
                                     vache.statut_sante === 'attention' ? '⚠️ Attention' : '🔴 Malade'}
                                </span>
                            </div>
                        ))}
                        {vaches.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                Aucune vache enregistrée
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tableau Recent Vaches Ajoutées */}
            <div className="panel">
                <div className="mb-5 text-lg font-bold">Vaches en temps réel</div>
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th className="ltr:rounded-l-md rtl:rounded-r-md">ID</th>
                                <th>NOM</th>
                                <th>TEMPÉRATURE</th>
                                <th>PRODUCTION</th>
                                <th>STATUT</th>
                                <th>GPS</th>
                                <th className="text-center ltr:rounded-r-md rtl:rounded-l-md">DERNIÈRE MAJ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vaches.map((vache) => (
                                <tr key={vache.id}>
                                    <td className="font-semibold">#{vache.id}</td>
                                    <td className="whitespace-nowrap">{vache.nom}</td>
                                    <td className="whitespace-nowrap">{vache.temperature}°C</td>
                                    <td className="whitespace-nowrap">{vache.production_lait}L/jour</td>
                                    <td className="text-center">
                                        <span className={`badge ${getStatusBadge(vache.statut_sante)} rounded-full hover:top-0`}>
                                            {vache.statut_sante}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${vache.gps_actif ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'} rounded-full`}>
                                            {vache.gps_actif ? '📍 Actif' : '❌ Inactif'}
                                        </span>
                                    </td>
                                    <td className="text-center whitespace-nowrap">
                                        {formatDate(vache.derniere_mise_a_jour_at)}
                                    </td>
                                </tr>
                            ))}
                            {vaches.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        Aucune vache enregistrée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Index;