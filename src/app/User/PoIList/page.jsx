'use client';
import PoIListNavBar from "@/src/components/layout/PoIListNavBar";
import LoadingScreen from "@/src/components/layout/Loading";
import { ClipboardList, AlertCircle, Edit, MapPin, Search, Filter, Eye, Trash2, Heart, Bookmark } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { poiService } from "@/src/services/poiService";
import { useAuth } from "@/src/contexts/AuthContext";

import Pagination from "@/src/components/common/Pagination";

export default function MesPOIs() {
  const router = useRouter();
  const { user } = useAuth();
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
  }, [page, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les catégories
      if (categories.length === 0) {
        const categoriesResponse = await poiService.getCategories();
        const categoriesData = categoriesResponse.data?.categories || [];
        setCategories(categoriesData);
      }

      // Récupérer uniquement les POIs favoris de l'utilisateur avec pagination
      const response = await poiService.getFavorites({ page, size: pageSize });
      
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
      console.error('Erreur chargement POIs favoris:', err);
      setError("Impossible de charger vos points d'intérêt favoris.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await poiService.delete(id);
      setPois(prev => prev.filter(p => (p.poiId || p.id) !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression du POI");
    }
  };

  const handleLike = async (targetPoi) => {
    const poiId = targetPoi.poiId || targetPoi.id;
    const isLiked = targetPoi.isLiked;

    // UI optimiste
    setPois(prev => prev.map(p => {
      const pId = p.poiId || p.id;
      if (pId === poiId) {
        return {
          ...p,
          isLiked: !isLiked,
          likeCount: !isLiked ? (p.likeCount || 0) + 1 : Math.max((p.likeCount || 0) - 1, 0)
        };
      }
      return p;
    }));

    try {
      if (isLiked) {
        await poiService.unlikePoi(poiId);
      } else {
        await poiService.likePoi(poiId);
      }
    } catch (err) {
      console.error('Erreur lors du like:', err);
      // Rollback en cas d'erreur
      fetchData();
    }
  };

  const handleFavorite = async (targetPoi) => {
    const poiId = targetPoi.poiId || targetPoi.id;
    const isFavorite = targetPoi.isFavorite;

    // UI optimiste
    setPois(prev => prev.map(p => {
      const pId = p.poiId || p.id;
      if (pId === poiId) {
        return {
          ...p,
          isFavorite: !isFavorite,
          favoriteCount: !isFavorite ? (p.favoriteCount || 0) + 1 : Math.max((p.favoriteCount || 0) - 1, 0)
        };
      }
      return p;
    }));

    try {
      if (isFavorite) {
        await poiService.removeFromFavorites(poiId);
      } else {
        await poiService.addToFavorites(poiId);
      }
    } catch (err) {
      console.error('Erreur lors de la mise en favoris:', err);
      // Rollback
      fetchData();
    }
  };

  const handleSearchChange = (term) => setSearchTerm(term);
  const handleSortChange = (criteria) => setSortCriteria(criteria);
  const handleFilterChange = ({ town, type }) => {
    setSelectedTown(town);
    setSelectedCategory(type);
  };

  // Filtrage et Tri (Client-side pour réactivité immédiate sur petits volumes)
  const filteredAndSortedPois = useMemo(() => {
    let results = [...pois];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(poi =>
        poi.name?.toLowerCase().includes(lower) ||
        poi.description?.toLowerCase().includes(lower)
      );
    }

    if (selectedTown) {
      results = results.filter(
        poi => poi.address?.city?.toLowerCase() === selectedTown.toLowerCase() ||
          poi.address?.town?.toLowerCase() === selectedTown.toLowerCase()
      );
    }

    if (selectedCategory) {
      results = results.filter(
        poi => poi.category?.name === selectedCategory
      );
    }

    if (sortCriteria) {
      const [field, direction] = sortCriteria.split('_');

      results.sort((a, b) => {
        let aVal = "";
        let bVal = "";

        if (field === "town") {
          aVal = (a.address?.city || a.address?.town || "").toLowerCase();
          bVal = (b.address?.city || b.address?.town || "").toLowerCase();
        } else if (field === "date") {
          aVal = a.createdAt || "";
          bVal = b.createdAt || "";
        } else if (field === "category") {
          aVal = a.category?.name || "";
          bVal = b.category?.name || "";
        } else {
          aVal = (a[field] || "").toLowerCase();
          bVal = (b[field] || "").toLowerCase();
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return results;
  }, [pois, searchTerm, selectedTown, selectedCategory, sortCriteria]);

  // Extraction des options pour les filtres
  const { availableTowns, availableTypes } = useMemo(() => {
    // Villes disponibles
    const towns = [...new Set(pois.map(p => p.address?.city || p.address?.town).filter(Boolean))].sort();

    // Catégories disponibles (avec comptage)
    const categoryCounts = {};
    pois.forEach(poi => {
      const categoryName = poi.category?.name;
      if (categoryName) {
        categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
      }
    });

    // Convertir en tableau de noms triés
    const types = Object.keys(categoryCounts).sort();

    return { availableTowns: towns, availableTypes: types };
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

  const displayPois = filteredAndSortedPois;

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
                  Mes POI Favoris ({displayPois.length})
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {pois.length} POI{pois.length > 1 ? 's' : ''} en favoris • {categories.length} catégories
                </p>
              </div>

              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition text-sm font-medium"
                >
                  ✕ Effacer filtre catégorie
                </button>
              )}
            </div>

            {error && (
              <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
                  <AlertCircle size={24} />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!error && displayPois.length === 0 ? (
              <div className="text-center py-20 px-6">
                <div className="inline-flex bg-gray-100 p-6 rounded-full mb-6 text-gray-400">
                  <ClipboardList size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun point d'intérêt favori</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  {selectedCategory || selectedTown || searchTerm
                    ? "Aucun résultat avec les filtres actuels."
                    : "Vous n'avez pas encore ajouté de POI à vos favoris. Explorez la carte et ajoutez vos lieux préférés !"}
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
                  onClick={() => router.push('/User/Map')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Explorer la carte
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
                      <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Rating</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {displayPois.map((poi) => {
                      const categoryName = poi.category?.name;
                      const categoryColor = getCategoryColor(categoryName);
                      const categoryIcon = getCategoryIcon(categoryName);

                      return (
                        <tr key={poi.poiId || poi.id} className="hover:bg-blue-50/50 transition duration-150 group">
                          <td className="py-4 px-6">
                            <div
                              className="font-medium text-gray-900 group-hover:text-blue-700 cursor-pointer"
                              onClick={() => router.push(`/User/PoiDetails/${poi.poiId || poi.id}`)}
                            >
                              {poi.name}
                            </div>
                            {poi.description && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                                {poi.description}
                              </div>
                            )}
                            {poi.phone && (
                              <div className="text-xs text-gray-400 mt-1">
                                📞 {poi.phone}
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
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {poi.poiId || poi.id}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex gap-2">
                              {/* Like Button */}
                              <button
                                onClick={() => handleLike(poi)}
                                className={`p-2 rounded-lg transition hover:scale-110 flex items-center gap-1.5 ${poi.isLiked
                                  ? 'text-red-600 bg-red-50'
                                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                  }`}
                                title={poi.isLiked ? "Retirer le like" : "J'aime"}
                              >
                                <Heart size={18} fill={poi.isLiked ? "currentColor" : "none"} />
                                <span className="text-xs font-semibold">{poi.likeCount || 0}</span>
                              </button>

                              {/* Favorite Button */}
                              <button
                                onClick={() => handleFavorite(poi)}
                                className={`p-2 rounded-lg transition hover:scale-110 flex items-center gap-1.5 ${poi.isFavorite
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                                  }`}
                                title={poi.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                              >
                                <Bookmark size={18} fill={poi.isFavorite ? "currentColor" : "none"} />
                                <span className="text-xs font-semibold">{poi.favoriteCount || 0}</span>
                              </button>

                              <div className="w-px h-6 bg-gray-200 mx-1"></div>

                              <button
                                onClick={() => router.push(`/User/PoiDetails/${poi.poiId || poi.id}`)}
                                title="Voir les détails"
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition hover:scale-110"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

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

      </div>
    </>
  );
}