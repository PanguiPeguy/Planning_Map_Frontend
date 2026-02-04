'use client';

import PoIListNavBar from "@/src/components/layout/PoIListNavBar";
import LoadingScreen from "@/src/components/layout/Loading";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ClipboardList, XCircle, MapPin, AlertCircle, Heart, Bookmark } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from "@/src/components/common/Pagination";
import { poiService } from "@/src/services/poiService";

export default function POIList() {
    const router = useRouter();
    const [pois, setPois] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('');
    const [selectedTown, setSelectedTown] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    // Pagination states
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchData();
    }, [page, pageSize, selectedCategory, searchTerm]);

    // ---------------------------------------------------
    // 📌 GET ALL DATA — POIs et Catégories
    // ---------------------------------------------------
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Charger les catégories (une seule fois ou à chaque fois)
            if (categories.length === 0) {
                const categoriesResponse = await poiService.getCategories();
                const categoriesData = categoriesResponse.data?.categories || [];
                setCategories(categoriesData);
            }
            
            // Charger les POIs avec pagination et filtres
            const params = {
                page,
                size: pageSize,
                category: selectedCategory || undefined,
                search: searchTerm || undefined
            };

            const response = await poiService.getAll(params);
            
            if (response.data?.content) {
                setPois(response.data.content);
                setTotalElements(response.data.totalElements || 0);
                setTotalPages(response.data.totalPages || 0);
            } else {
                const poisData = response.data || [];
                setPois(poisData);
                setTotalElements(poisData.length);
                setTotalPages(1);
            }
            
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------------------
    // 🗑️ DELETE POI — via poiService
    // ---------------------------------------------------
    const handleDelete = async (id) => {
        try {
            await poiService.delete(id);
            setPois(prev => prev.filter(p => (p.poiId || p.id) !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Erreur:', err);
            alert("Erreur lors de la suppression du POI");
        }
    };

    // ---------------------------------------------------
    // 🖱️ HANDLE CLICKS
    // ---------------------------------------------------
    const handleEdit = (id, e) => {
        e.stopPropagation();
        router.push(`/Admin/poi/edit/${id}`);
    };

    const handleViewDetails = (id) => {
        router.push(`/Admin/PoiDetails/${id}`);
    };

    const handleRowClick = (id) => {
        router.push(`/Admin/PoiDetails/${id}`);
    };

    const handleSearchChange = (term) => setSearchTerm(term);
    const handleSortChange = (criteria) => setSortCriteria(criteria);
    const handleFilterChange = ({ town, type }) => {
        setSelectedTown(town);
        setSelectedCategory(type);
    };

    // ---------------------------------------------------
    // 🔎 FILTRAGE + TRI — avec catégories réelles
    // ---------------------------------------------------
    const filteredAndSortedPois = useMemo(() => {
        let results = [...pois];

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            results = results.filter(poi => 
                poi.name?.toLowerCase().includes(search) ||
                poi.description?.toLowerCase().includes(search)
            );
        }

        // Filtre par ville
        if (selectedTown) {
            results = results.filter(
                poi => poi.address?.city?.toLowerCase() === selectedTown.toLowerCase() ||
                       poi.address?.town?.toLowerCase() === selectedTown.toLowerCase()
            );
        }

        // Filtre par catégorie
        if (selectedCategory) {
            results = results.filter(
                poi => poi.category?.name === selectedCategory
            );
        }

        // Tri
        if (sortCriteria) {
            const [field, direction] = sortCriteria.split('_');

            results.sort((a, b) => {
                let A, B;

                if (field === 'town') {
                    A = (a.address?.city || a.address?.town || '').toLowerCase();
                    B = (b.address?.city || b.address?.town || '').toLowerCase();
                } else if (field === 'date') {
                    A = a.createdAt || a.date_created || 0;
                    B = b.createdAt || b.date_created || 0;
                } else if (field === 'category') {
                    A = a.category?.name || '';
                    B = b.category?.name || '';
                } else {
                    A = a[field]?.toLowerCase() || '';
                    B = b[field]?.toLowerCase() || '';
                }

                if (A < B) return direction === "asc" ? -1 : 1;
                if (A > B) return direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return results;
    }, [pois, searchTerm, selectedTown, selectedCategory, sortCriteria]);

    // ---------------------------------------------------
    // 🔁 OPTIONS FILTRES — avec vraies catégories
    // ---------------------------------------------------
    const { availableTowns, availableTypes } = useMemo(() => {
        // Villes disponibles
        const towns = [...new Set(
            pois
                .map(p => p.address?.city || p.address?.town)
                .filter(Boolean)
        )].sort();

        // Catégories disponibles (avec comptage)
        const categoryCounts = {};
        pois.forEach(poi => {
            const categoryName = poi.category?.name;
            if (categoryName) {
                categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            }
        });

        // Convertir en tableau avec compteur
        const types = Object.entries(categoryCounts)
            .map(([name, count]) => ({
                name,
                count
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return { 
            availableTowns: towns, 
            availableTypes: types.map(t => t.name) 
        };
    }, [pois]);

    // Obtenir la couleur de la catégorie
    const getCategoryColor = (categoryName) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.color || '#3498DB';
    };

    // Obtenir l'icône de la catégorie
    const getCategoryIcon = (categoryName) => {
        const category = categories.find(c => c.name === categoryName);
        return category?.icon || '📍';
    };

    if (loading) return <LoadingScreen />;

    return (
        <>
            <PoIListNavBar 
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onFilterChange={handleFilterChange}
                availableTowns={availableTowns}
                availableTypes={availableTypes}
            />

            <div className="min-h-screen bg-gray-50 py-8 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        
                        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                    <MapPin className="text-blue-500" />
                                    Points d'Intérêt ({filteredAndSortedPois.length})
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {categories.length} catégories disponibles • {pois.length} POIs au total
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                {selectedCategory && (
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
                                    >
                                        ✕ Effacer filtre catégorie
                                    </button>
                                )}
                                <button
                                    onClick={() => router.push('/Admin/ajouterPoI')}
                                    className="w-12 h-12 font-bold text-4xl flex items-center justify-center bg-blue-700 text-white rounded-full hover:bg-blue-800 transition duration-150 shadow-lg"
                                    title="Ajouter un POI"
                                >
                                    <AddIcon fontSize="inherit" /> 
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-6">
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                                    <AlertCircle size={24} />
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        {!error && (filteredAndSortedPois.length === 0 ? (
                            <div className="text-center py-20 px-6">
                                <div className="inline-flex bg-gray-100 p-6 rounded-full mb-6 text-gray-400">
                                    <ClipboardList size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Aucun point d'intérêt trouvé
                                </h3>
                                <p className="text-gray-500 max-w-sm mx-auto mb-4">
                                    {selectedCategory || selectedTown || searchTerm 
                                        ? "Aucun résultat avec les filtres actuels." 
                                        : "La base de données semble vide."}
                                </p>
                                {selectedCategory || selectedTown || searchTerm ? (
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('');
                                            setSelectedTown('');
                                            setSearchTerm('');
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium mr-3"
                                    >
                                        Réinitialiser les filtres
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => router.push('/Admin/ajouterPoI')}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Ajouter un POI
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Nom</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Catégorie</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Ville</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Likes</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-center">Favoris</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Rating</th>
                                            <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {filteredAndSortedPois.map((poi) => {
                                            const categoryName = poi.category?.name;
                                            const categoryColor = getCategoryColor(categoryName);
                                            const categoryIcon = getCategoryIcon(categoryName);
                                            
                                            return (
                                                <tr 
                                                    key={poi.poiId || poi.id} 
                                                    className="hover:bg-blue-50/50 transition duration-150 cursor-pointer group"
                                                    onClick={() => handleRowClick(poi.poiId || poi.id)}
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="font-medium text-gray-900 group-hover:text-blue-700">
                                                            {poi.name}
                                                        </div>
                                                        {poi.description && (
                                                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                                                                {poi.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span 
                                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                                                                style={{ backgroundColor: categoryColor }}
                                                                title={categoryIcon}
                                                            >
                                                                {categoryIcon || '📍'}
                                                            </span>
                                                            <span 
                                                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                                                                style={{ 
                                                                    backgroundColor: categoryColor + '20',
                                                                    color: categoryColor
                                                                }}
                                                            >
                                                                {categoryName || 'Non classé'}
                                                            </span>
                                                        </div>
                                                        {poi.category?.description && (
                                                            <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                                                                {poi.category.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6 text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={14} className="text-gray-400" />
                                                            <span>{poi.address?.city || poi.address?.town || '-'}</span>
                                                        </div>
                                                        {poi.address?.country && (
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {poi.address.country}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-medium text-sm">
                                                            <Heart size={14} className="fill-red-600" />
                                                            {poi.likeCount || 0}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-medium text-sm">
                                                            <Bookmark size={14} className="fill-amber-600" />
                                                            {poi.favoriteCount || 0}
                                                        </div>
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-1 text-sm font-bold">
                                                            <span className="text-amber-500">★</span>
                                                            <span className={
                                                                poi.rating >= 4 ? 'text-green-600' :
                                                                poi.rating >= 3 ? 'text-amber-600' :
                                                                'text-red-600'
                                                            }>
                                                                {poi.rating?.toFixed(1) || 'N/A'}
                                                            </span>
                                                            <span className="text-xs text-gray-400 font-normal ml-1">
                                                                ({poi.reviewCount || 0})
                                                            </span>
                                                        </div>
                                                        {poi.phone && (
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                📞 {poi.phone}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-4 px-6">
                                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={(e) => handleEdit(poi.poiId || poi.id, e)}
                                                                title="Modifier"
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition hover:scale-110"
                                                            >
                                                                <EditIcon fontSize="medium" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleViewDetails(poi.poiId || poi.id)}
                                                                title="Voir les détails"
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition hover:scale-110"
                                                            >
                                                                <VisibilityIcon fontSize="medium" />
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteConfirm(poi.poiId || poi.id);
                                                                }}
                                                                title="Supprimer"
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition hover:scale-110"
                                                            >
                                                                <DeleteIcon fontSize="medium" />
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-2">
                                                            ID: {poi.poiId || poi.id}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {/* Résumé en bas du tableau avec Pagination */}
                        <div className="bg-white border-t border-gray-200">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                totalElements={totalElements}
                                pageSize={pageSize}
                            />
                            
                            <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    Affichage de <span className="font-bold">{pois.length}</span> POI(s) sur cette page ({totalElements} au total)
                                    {selectedCategory && (
                                        <span className="ml-4">
                                            • Filtre : <span className="font-medium text-blue-700">{selectedCategory}</span>
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="text-gray-600">
                                        Catégories : <span className="font-bold">{categories.length}</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <div className="text-gray-600">
                                        Villes : <span className="font-bold">{availableTowns.length}</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">Taille:</span>
                                        <select 
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(Number(e.target.value));
                                                setPage(0);
                                            }}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal suppression */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                Confirmer la suppression
                            </h2>

                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce point d'intérêt ? Cette action ne peut pas être annulée.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                >
                                    Annuler
                                </button>

                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}