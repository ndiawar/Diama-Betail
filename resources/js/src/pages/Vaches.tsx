import React from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { setPageTitle } from '../store/themeConfigSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { apiService, Vache } from '../services/api';
import { websocketService } from '../services/websocket';
import Notification from '../components/Notification';
import ActionMenu from '../components/ActionMenu';

// Styles CSS pour corriger l'alignement de la pagination
const paginationStyles = `
    .mantine-datatable-pagination {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        flex-wrap: nowrap !important;
        gap: 1rem !important;
        padding: 1rem 0 !important;
    }
    .mantine-datatable-pagination > div {
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
    }
    .mantine-datatable-pagination .mantine-Text-root {
        margin: 0 !important;
    }
`;

const Vaches = () => {
    const dispatch = useDispatch();
    const [vaches, setVaches] = useState<Vache[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<Vache[]>([]);
    const [recordsData, setRecordsData] = useState<Vache[]>([]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'nom',
        direction: 'asc',
    });

    // États pour les modales et actions
    const [selectedVache, setSelectedVache] = useState<Vache | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    } | null>(null);

    // États pour les formulaires
    const [editForm, setEditForm] = useState({
        nom: '',
        race: '',
        statut_sante: 'bonne',
        gps_actif: false,
        sexe: 'Femelle',
        poids: 0,
        temperature: 38.5,
        production_lait: 0
    });

    const [addForm, setAddForm] = useState({
        nom: '',
        race: '',
        sexe: 'Femelle',
        statut_sante: 'bonne',
        poids: 400,
        temperature: 38.5,
        production_lait: 20,
        gps_actif: false,
        id_rfid: ''
    });

    useEffect(() => {
        dispatch(setPageTitle('Liste des Vaches - DIAMA'));
        loadVachesData();
        
        // Connexion WebSocket pour les mises à jour temps réel
        websocketService.connect();
        
        // Écouter les mises à jour des vaches
        websocketService.onVacheUpdate((data) => {
            console.log('🔄 Mise à jour vaches temps réel:', data);
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
    }, [dispatch]);

    const loadVachesData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getVaches();
            setVaches(response.data);
            setInitialRecords(response.data);
            setRecordsData(response.data.slice(0, pageSize));
        } catch (error) {
            console.error('Erreur chargement vaches:', error);
            setVaches([]);
            setInitialRecords([]);
            setRecordsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return vaches.filter((item) => {
                return (
                    item.nom.toLowerCase().includes(search.toLowerCase()) ||
                    (item.race && item.race.toLowerCase().includes(search.toLowerCase())) ||
                    item.statut_sante.toLowerCase().includes(search.toLowerCase()) ||
                    (item.gps_actif ? 'actif' : 'inactif').includes(search.toLowerCase()) ||
                    item.production_lait.toString().includes(search.toLowerCase())
                );
            });
        });
    }, [search, vaches]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

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

    const formatDateDetailed = (date: string) => {
        if (!date) return 'Non disponible';
        
        const dt = new Date(date);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60));
        
        const day = dt.getDate().toString().padStart(2, '0');
        const month = (dt.getMonth() + 1).toString().padStart(2, '0');
        const year = dt.getFullYear();
        const hours = dt.getHours().toString().padStart(2, '0');
        const minutes = dt.getMinutes().toString().padStart(2, '0');
        
        // Si moins de 24h, afficher avec l'heure
        if (diffInHours < 24) {
            if (diffInHours === 0) return `Aujourd'hui à ${hours}:${minutes}`;
            if (diffInHours === 1) return `Il y a 1h (${hours}:${minutes})`;
            return `Il y a ${diffInHours}h (${hours}:${minutes})`;
        }
        
        // Si moins de 7 jours
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            if (diffInDays === 1) return `Hier à ${hours}:${minutes}`;
            return `Il y a ${diffInDays}j (${day}/${month} ${hours}:${minutes})`;
        }
        
        // Sinon, date complète
        return `${day}/${month}/${year} à ${hours}:${minutes}`;
    };

    const getStatusBadge = (statut: string) => {
        switch (statut) {
            case 'bonne':
                return <span className="badge bg-success/20 text-success rounded-full">✅ En bonne santé</span>;
            case 'attention':
                return <span className="badge bg-warning/20 text-warning rounded-full">⚠️ Attention</span>;
            case 'malade':
                return <span className="badge bg-danger/20 text-danger rounded-full">🔴 Malade</span>;
            default:
                return <span className="badge bg-primary/20 text-primary rounded-full">❓ {statut}</span>;
        }
    };

    const getGPSBadge = (gps: boolean) => {
        return gps ? 
            <span className="badge bg-success/20 text-success rounded-full">📍 Actif</span> : 
            <span className="badge bg-danger/20 text-danger rounded-full">❌ Inactif</span>;
    };

    // Fonctions pour gérer les actions
    const handleViewDetails = (vache: Vache) => {
        setSelectedVache(vache);
        setShowDetailsModal(true);
    };



    const handleDelete = (vache: Vache) => {
        setSelectedVache(vache);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedVache) return;
        
        setIsDeleting(true);
        try {
            await apiService.deleteVache(selectedVache.id);
            setShowDeleteModal(false);
            setSelectedVache(null);
            loadVachesData(); // Recharger les données
            setNotification({
                message: `Vache ${selectedVache.nom} supprimée avec succès !`,
                type: 'success'
            });
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            setNotification({
                message: 'Erreur lors de la suppression de la vache',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const closeModals = () => {
        setShowDetailsModal(false);
        setShowEditModal(false);
        setShowAddModal(false);
        setShowDeleteModal(false);
        setSelectedVache(null);
        // Réinitialiser les formulaires
        setEditForm({
            nom: '',
            race: '',
            statut_sante: 'bonne',
            gps_actif: false,
            sexe: 'Femelle',
            poids: 0,
            temperature: 38.5,
            production_lait: 0
        });
        setAddForm({
            nom: '',
            race: '',
            sexe: 'Femelle',
            statut_sante: 'bonne',
            poids: 400,
            temperature: 38.5,
            production_lait: 20,
            gps_actif: false,
            id_rfid: ''
        });
    };

    const handleSaveEdit = async () => {
        if (!selectedVache) return;
        
        setIsSaving(true);
        try {
            await apiService.updateVache(selectedVache.id, editForm);
            setShowEditModal(false);
            setSelectedVache(null);
            loadVachesData(); // Recharger les données
            setNotification({
                message: `Vache ${editForm.nom} modifiée avec succès !`,
                type: 'success'
            });
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            setNotification({
                message: 'Erreur lors de la modification de la vache',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddVache = async () => {
        setIsSaving(true);
        try {
            await apiService.createVache(addForm);
            setShowAddModal(false);
            loadVachesData(); // Recharger les données
            setNotification({
                message: `Vache ${addForm.nom} créée avec succès !`,
                type: 'success'
            });
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            setNotification({
                message: 'Erreur lors de la création de la vache',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (vache: Vache) => {
        setSelectedVache(vache);
        setEditForm({
            nom: vache.nom,
            race: vache.race || '',
            statut_sante: vache.statut_sante,
            gps_actif: vache.gps_actif,
            sexe: vache.sexe,
            poids: vache.poids,
            temperature: vache.temperature,
            production_lait: vache.production_lait
        });
        setShowEditModal(true);
    };

    return (
        <div>
            <style>{paginationStyles}</style>
            <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link to="#" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Liste des Vaches</span>
                </li>
            </ul>

            <div className="panel">
                <div className="flex md:items-center md:flex-row flex-col mb-5 gap-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">🐄 Gestion du Troupeau</h5>
                    <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
                        <input 
                            type="text" 
                            className="form-input w-auto" 
                            placeholder="Rechercher une vache..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Ajouter une vache
                        </button>
                    </div>
                </div>
                <div className="datatables">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-gray-500 mt-2">Chargement des vaches...</p>
                        </div>
                    ) : (
                        <DataTable
                            className="whitespace-nowrap table-hover"
                            records={recordsData}
                            columns={[
                                {
                                    accessor: 'id',
                                    title: 'ID',
                                    sortable: true,
                                    width: 80,
                                },
                                {
                                    accessor: 'nom',
                                    title: 'Nom',
                                    sortable: true,
                                },
                                { 
                                    accessor: 'race', 
                                    title: 'Race', 
                                    sortable: true,
                                },
                                { 
                                    accessor: 'temperature', 
                                    title: 'Température', 
                                    sortable: true,
                                    render: (record) => (
                                        <span className="font-medium">
                                            {(record.temperature as number)}°C
                                        </span>
                                    ),
                                },
                                { 
                                    accessor: 'poids', 
                                    title: 'Poids', 
                                    sortable: true,
                                    render: (record) => (
                                        <span className="font-medium">
                                            {(record.poids as number)} kg
                                        </span>
                                    ),
                                },
                                {
                                    accessor: 'statut_sante',
                                    title: 'Statut',
                                    sortable: true,
                                    render: (record) => (
                                        <div className="flex justify-center">
                                            {getStatusBadge(record.statut_sante as string)}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'gps_actif',
                                    title: 'GPS',
                                    sortable: true,
                                    render: (record) => (
                                        <div className="flex justify-center">
                                            {getGPSBadge(record.gps_actif as boolean)}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'production_lait',
                                    title: 'Production',
                                    sortable: true,
                                    render: (record) => (
                                        <span className="font-medium">
                                            {(record.production_lait as number)} L/j
                                        </span>
                                    ),
                                },
                                {
                                    accessor: 'derniere_mise_a_jour_at',
                                    title: 'Dernière MAJ',
                                    sortable: true,
                                    render: (record) => (
                                        <span className="text-sm">
                                            {formatDate(record.derniere_mise_a_jour_at as string)}
                                        </span>
                                    ),
                                },
                                {
                                    accessor: 'action',
                                    title: 'Actions',
                                    titleClassName: '!text-center',
                                    render: ({ id, nom, ...vache }) => (
                                        <div className="flex justify-center">
                                            <ActionMenu
                                                vache={{ id, nom, ...vache } as Vache}
                                                onViewDetails={handleViewDetails}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                        </div>
                                    ),
                                },
                            ]}
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Affichage de ${from} à ${to} sur ${totalRecords} vaches`}
                        />
                    )}
                </div>
            </div>

            {/* Modal Détails Vache */}
            {showDetailsModal && selectedVache && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">🐄 Détails de {selectedVache.nom}</h3>
                            <button 
                                onClick={closeModals}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">ID</label>
                                    <p className="text-lg">{selectedVache.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom</label>
                                    <p className="text-lg font-semibold">{selectedVache.nom}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Race</label>
                                    <p className="text-lg">{selectedVache.race || 'Non spécifiée'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sexe</label>
                                    <p className="text-lg">{selectedVache.sexe || 'Non spécifié'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut Santé</label>
                                    <div className="mt-1">{getStatusBadge(selectedVache.statut_sante)}</div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Température</label>
                                    <p className="text-lg">{selectedVache.temperature}°C</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Poids</label>
                                    <p className="text-lg">{selectedVache.poids} kg</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Production de Lait</label>
                                    <p className="text-lg">{selectedVache.production_lait} L/jour</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">GPS</label>
                                    <div className="mt-1">{getGPSBadge(selectedVache.gps_actif)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Dernière Mise à Jour</label>
                                    <p className="text-lg">{formatDateDetailed(selectedVache.derniere_mise_a_jour_at)}</p>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button 
                                onClick={closeModals}
                                className="btn btn-outline-secondary"
                            >
                                Fermer
                            </button>
                            <button 
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    handleEdit(selectedVache);
                                }}
                                className="btn btn-primary"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Modification Vache */}
            {showEditModal && selectedVache && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">✏️ Modifier {selectedVache.nom}</h3>
                            <button 
                                onClick={closeModals}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom</label>
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    value={editForm.nom}
                                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Race</label>
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    value={editForm.race}
                                    onChange={(e) => setEditForm({...editForm, race: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sexe</label>
                                <select 
                                    className="form-select w-full" 
                                    value={editForm.sexe}
                                    onChange={(e) => setEditForm({...editForm, sexe: e.target.value})}
                                >
                                    <option value="Femelle">Femelle</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Statut Santé</label>
                                <select 
                                    className="form-select w-full" 
                                    value={editForm.statut_sante}
                                    onChange={(e) => setEditForm({...editForm, statut_sante: e.target.value})}
                                >
                                    <option value="bonne">Bonne</option>
                                    <option value="attention">Attention</option>
                                    <option value="malade">Malade</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Poids (kg)</label>
                                <input 
                                    type="number" 
                                    className="form-input w-full" 
                                    value={editForm.poids}
                                    onChange={(e) => setEditForm({...editForm, poids: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Température (°C)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className="form-input w-full" 
                                    value={editForm.temperature}
                                    onChange={(e) => setEditForm({...editForm, temperature: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Production de Lait (L/jour)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className="form-input w-full" 
                                    value={editForm.production_lait}
                                    onChange={(e) => setEditForm({...editForm, production_lait: parseFloat(e.target.value) || 0})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">GPS Actif</label>
                                <select 
                                    className="form-select w-full" 
                                    value={editForm.gps_actif ? 'true' : 'false'}
                                    onChange={(e) => setEditForm({...editForm, gps_actif: e.target.value === 'true'})}
                                >
                                    <option value="true">Actif</option>
                                    <option value="false">Inactif</option>
                                </select>
                            </div>
                        </form>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button 
                                onClick={closeModals}
                                className="btn btn-outline-secondary"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="btn btn-primary"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sauvegarde...
                                    </>
                                ) : (
                                    'Sauvegarder'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmation Suppression */}
            {showDeleteModal && selectedVache && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="text-center p-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Confirmer la suppression
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer la vache <strong>{selectedVache.nom}</strong> ? 
                                Cette action est irréversible.
                            </p>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button 
                                onClick={closeModals}
                                className="btn btn-outline-secondary"
                                disabled={isDeleting}
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="btn btn-danger"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Suppression...
                                    </>
                                ) : (
                                    'Supprimer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajout Vache */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold">🐄 Ajouter une nouvelle vache</h3>
                            <button 
                                onClick={closeModals}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom *</label>
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    value={addForm.nom}
                                    onChange={(e) => setAddForm({...addForm, nom: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Race</label>
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    value={addForm.race}
                                    onChange={(e) => setAddForm({...addForm, race: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Sexe *</label>
                                <select 
                                    className="form-select w-full" 
                                    value={addForm.sexe}
                                    onChange={(e) => setAddForm({...addForm, sexe: e.target.value})}
                                    required
                                >
                                    <option value="Femelle">Femelle</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Statut Santé *</label>
                                <select 
                                    className="form-select w-full" 
                                    value={addForm.statut_sante}
                                    onChange={(e) => setAddForm({...addForm, statut_sante: e.target.value})}
                                    required
                                >
                                    <option value="bonne">Bonne</option>
                                    <option value="attention">Attention</option>
                                    <option value="malade">Malade</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Poids (kg) *</label>
                                <input 
                                    type="number" 
                                    className="form-input w-full" 
                                    value={addForm.poids}
                                    onChange={(e) => setAddForm({...addForm, poids: parseFloat(e.target.value) || 0})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Température (°C) *</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className="form-input w-full" 
                                    value={addForm.temperature}
                                    onChange={(e) => setAddForm({...addForm, temperature: parseFloat(e.target.value) || 0})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Production de Lait (L/jour) *</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    className="form-input w-full" 
                                    value={addForm.production_lait}
                                    onChange={(e) => setAddForm({...addForm, production_lait: parseFloat(e.target.value) || 0})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">ID RFID</label>
                                <input 
                                    type="text" 
                                    className="form-input w-full" 
                                    value={addForm.id_rfid}
                                    onChange={(e) => setAddForm({...addForm, id_rfid: e.target.value})}
                                    placeholder="Optionnel"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">GPS Actif</label>
                                <select 
                                    className="form-select w-full" 
                                    value={addForm.gps_actif ? 'true' : 'false'}
                                    onChange={(e) => setAddForm({...addForm, gps_actif: e.target.value === 'true'})}
                                >
                                    <option value="true">Actif</option>
                                    <option value="false">Inactif</option>
                                </select>
                            </div>
                        </form>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                            <button 
                                onClick={closeModals}
                                className="btn btn-outline-secondary"
                                disabled={isSaving}
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleAddVache}
                                className="btn btn-primary"
                                disabled={isSaving || !addForm.nom}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Création...
                                    </>
                                ) : (
                                    'Créer la vache'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
};

export default Vaches;

 