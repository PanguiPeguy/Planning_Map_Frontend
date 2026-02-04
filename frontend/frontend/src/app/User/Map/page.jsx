'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useState, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { poiService } from "@/src/services/poiService";
import { Filter, MapPin, Layers, Info, X, ChevronDown, ChevronUp, Heart, Bookmark, MessageCircle } from 'lucide-react';

// Fix icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icônes personnalisées pour chaque catégorie
const getCategoryIcon = (categoryName, color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color || '#3498DB'};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export default function AdminMap() {
  const [pois, setPois] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllLegend, setShowAllLegend] = useState(false);

  // Gérer les interactions Like/Favorite
  const handleLike = async (poi) => {
    if (!poi) return;

    // UI optimiste
    const newIsLiked = !poi.isLiked;
    const updatedPois = pois.map(p =>
      p.poiId === poi.poiId
        ? { ...p, isLiked: newIsLiked, likeCount: newIsLiked ? (p.likeCount || 0) + 1 : Math.max((p.likeCount || 0) - 1, 0) }
        : p
    );
    setPois(updatedPois);
    if (selectedPoi?.poiId === poi.poiId) {
      setSelectedPoi({ ...poi, isLiked: newIsLiked, likeCount: newIsLiked ? (poi.likeCount || 0) + 1 : Math.max((poi.likeCount || 0) - 1, 0) });
    }

    try {
      if (poi.isLiked) {
        await poiService.unlikePoi(poi.poiId);
      } else {
        await poiService.likePoi(poi.poiId);
      }
    } catch (error) {
      console.error('Erreur like:', error);
      setPois(pois); // Rollback
    }
  };

  const handleFavorite = async (poi) => {
    if (!poi) return;

    // UI optimiste
    const newIsFavorite = !poi.isFavorite;
    const updatedPois = pois.map(p =>
      p.poiId === poi.poiId
        ? { ...p, isFavorite: newIsFavorite, favoriteCount: newIsFavorite ? (p.favoriteCount || 0) + 1 : Math.max((p.favoriteCount || 0) - 1, 0) }
        : p
    );
    setPois(updatedPois);
    if (selectedPoi?.poiId === poi.poiId) {
      setSelectedPoi({ ...poi, isFavorite: newIsFavorite, favoriteCount: newIsFavorite ? (poi.favoriteCount || 0) + 1 : Math.max((poi.favoriteCount || 0) - 1, 0) });
    }

    try {
      if (poi.isFavorite) {
        await poiService.removeFromFavorites(poi.poiId);
      } else {
        await poiService.addToFavorites(poi.poiId);
      }
    } catch (error) {
      console.error('Erreur favorite:', error);
      setPois(pois); // Rollback
    }
  };

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Charger les catégories
        const categoriesResponse = await poiService.getCategories();
        const categoriesData = categoriesResponse.data?.categories || [];
        setCategories(categoriesData);

        // Charger les POIs (tous, via pagination automatique)
        const poisData = await poiService.getAllPaginated({}, 50); // Jusqu'à 5000 POIs

        setPois(poisData);
      } catch (err) {
        console.error('Erreur chargement:', err);
      } finally {
        setLoading(false);
        setMapInitialized(true);
      }
    };

    fetchData();
  }, []);

  // Filtrer les POIs
  const filteredPois = selectedCategory === 'all'
    ? pois
    : pois.filter(poi => poi.category?.name === selectedCategory);

  // Statistiques
  const totalPois = pois.length;
  const visiblePois = filteredPois.length;
  const categoriesCount = categories.length;

  // Gérer le clic sur un marqueur
  const handleMarkerClick = (poi) => {
    setSelectedPoi(poi);
    setShowInfoPanel(true);
  };

  // Toutes les catégories disponibles (avec "Tous")
  const allCategories = useMemo(() => [
    {
      id: 'all',
      name: 'Tous les POIs',
      count: pois.length,
      color: '#6B7280',
      icon: '🏷️'
    },
    ...categories.map(cat => ({
      id: cat.name,
      name: cat.name,
      count: pois.filter(p => p.category?.name === cat.name).length,
      color: cat.color,
      icon: cat.icon || '📍'
    }))
  ], [categories, pois]);

  // Catégories à afficher dans la légende (limitée à 5 si on n'a pas cliqué sur "Voir plus")
  const displayedCategories = showAllLegend
    ? categories
    : categories.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Carte Interactive</h1>
            <p className="text-gray-600">Visualisez tous les points d'intérêt du Cameroun</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Filter size={20} />
              {showFilters ? 'Masquer filtres' : 'Afficher filtres'}
            </button>

            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                {visiblePois} POIs visibles
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {totalPois} au total
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
        {/* Panneau latéral des filtres */}
        {showFilters && (
          <div className="lg:w-80 bg-white border-r shadow-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Layers size={24} />
                  Filtres
                </h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sélection de catégorie */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Filter size={18} />
                  Catégories ({categoriesCount})
                </h3>
                <div className="space-y-2">
                  {allCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedCategory === cat.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.icon}
                        </div>
                        <div className="text-left">
                          <span className={`font-medium ${selectedCategory === cat.id ? 'text-blue-700' : 'text-gray-800'
                            }`}>
                            {cat.name}
                          </span>
                          {cat.id !== 'all' && (
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">
                              {categories.find(c => c.name === cat.name)?.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${selectedCategory === cat.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistiques */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total POIs</span>
                    <span className="font-bold">{totalPois}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catégories</span>
                    <span className="font-bold">{categoriesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Affichés</span>
                    <span className="font-bold text-blue-600">{visiblePois}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filtrés</span>
                    <span className="font-bold text-orange-600">
                      {totalPois - visiblePois}
                    </span>
                  </div>
                </div>
              </div>

              {/* Légende des couleurs */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-3">Légende des couleurs</h4>
                <div className="space-y-2">
                  {displayedCategories.map(cat => (
                    <div key={cat.categoryId} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-700">{cat.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({pois.filter(p => p.category?.name === cat.name).length})
                      </span>
                    </div>
                  ))}

                  {categories.length > 5 && (
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                      onClick={() => setShowAllLegend(!showAllLegend)}
                    >
                      {showAllLegend ? (
                        <>
                          <ChevronUp size={16} />
                          Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          Voir {categories.length - 5} autres
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Bouton pour tout voir en grand écran */}
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setShowInfoPanel(false);
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-medium"
                >
                  Tout réinitialiser
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carte principale */}
        <div className="flex-1 relative">
          {/* Bouton de contrôle flottant */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {!showFilters && (
              <button
                onClick={() => setShowFilters(true)}
                className="p-3 bg-white rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2"
                title="Afficher les filtres"
              >
                <Filter size={20} />
                <span className="text-sm hidden md:inline">Filtres</span>
              </button>
            )}
            {selectedPoi && (
              <button
                onClick={() => setShowInfoPanel(!showInfoPanel)}
                className={`p-3 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2 ${showInfoPanel ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'
                  }`}
                title="Informations POI"
              >
                <Info size={20} />
                <span className="text-sm hidden md:inline">Infos</span>
              </button>
            )}
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="p-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 hover:shadow-xl transition flex items-center gap-2"
                title="Afficher tous les POIs"
              >
                <Layers size={20} />
                <span className="text-sm hidden md:inline">Tous</span>
              </button>
            )}
          </div>

          {/* Panneau d'information */}
          {selectedPoi && showInfoPanel && (
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPoi.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: selectedPoi.category?.color + '20',
                          color: selectedPoi.category?.color
                        }}
                      >
                        {selectedPoi.category?.name || 'Non classé'}
                      </span>
                      {selectedPoi.rating && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <span>★</span>
                          <span className="font-bold">{selectedPoi.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInfoPanel(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedPoi.description && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-600 text-sm">{selectedPoi.description}</p>
                    </div>
                  )}

                  {selectedPoi.address && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Adresse</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {selectedPoi.address.street && <p>{selectedPoi.address.street}</p>}
                        <p>
                          {[selectedPoi.address.city, selectedPoi.address.town, selectedPoi.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedPoi.phone && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Téléphone</h4>
                      <p className="text-gray-600 text-sm">{selectedPoi.phone}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Coordonnées</h4>
                      <p className="text-gray-600 text-sm font-mono">
                        {selectedPoi.latitude?.toFixed(6)}, {selectedPoi.longitude?.toFixed(6)}
                      </p>
                    </div>
                    {selectedPoi.category && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Catégorie ID</h4>
                        <p className="text-gray-600 text-sm">{selectedPoi.category.categoryId}</p>
                      </div>
                    )}
                  </div>

                  {/* Boutons Like/Favorite/Comment */}
                  <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200">
                    <button
                      onClick={() => handleLike(selectedPoi)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${selectedPoi.isLiked
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      title={selectedPoi.isLiked ? 'Retirer le like' : 'Liker'}
                    >
                      <Heart
                        size={16}
                        className={selectedPoi.isLiked ? 'fill-red-600' : ''}
                      />
                      <span>{selectedPoi.likeCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleFavorite(selectedPoi)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${selectedPoi.isFavorite
                        ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      title={selectedPoi.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Bookmark
                        size={16}
                        className={selectedPoi.isFavorite ? 'fill-amber-600' : ''}
                      />
                    </button>

                    <button
                      onClick={() => window.location.href = `/User/PoiDetails/${selectedPoi.poiId}`}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-medium transition"
                      title="Commenter"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <a
                      href={`https://maps.google.com/?q=${selectedPoi.latitude},${selectedPoi.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition"
                    >
                      📍 Google Maps
                    </a>
                    <button
                      onClick={() => setShowInfoPanel(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 text-center rounded-lg hover:bg-gray-300 transition"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Barre d'état en bas */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-gray-200">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Catégorie</div>
                  <div className="font-bold text-blue-700">
                    {selectedCategory === 'all' ? 'Tous' : selectedCategory}
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-sm text-gray-500">POIs visibles</div>
                  <div className="font-bold text-green-700">{visiblePois}</div>
                </div>
                <div className="h-8 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-sm text-gray-500">Filtrés</div>
                  <div className="font-bold text-orange-700">
                    {totalPois - visiblePois}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carte Leaflet */}
          <div className="h-full w-full">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-xl font-bold text-blue-900">Chargement de la carte...</p>
                <p className="text-gray-600 mt-2">Récupération des POIs et catégories</p>
              </div>
            ) : (
              <MapContainer
                center={[7.3697, 13.0842]}
                zoom={7}
                minZoom={5}
                maxZoom={18}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                <MarkerClusterGroup
                  chunkedLoading
                  maxClusterRadius={50}
                >
                  {filteredPois.map(poi => (
                    <Marker
                      key={poi.poiId || poi.id}
                      position={[poi.latitude, poi.longitude]}
                      icon={getCategoryIcon(poi.category?.name, poi.category?.color)}
                      eventHandlers={{
                        click: () => handleMarkerClick(poi),
                        mouseover: (e) => {
                          e.target.openPopup();
                        },
                        mouseout: (e) => {
                          e.target.closePopup();
                        }
                      }}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-blue-900 text-lg mb-1">{poi.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: poi.category?.color + '20',
                                color: poi.category?.color
                              }}
                            >
                              {poi.category?.name || 'Non classé'}
                            </span>
                            {poi.rating && (
                              <span className="flex items-center gap-1 text-amber-600">
                                <span>★</span>
                                <span className="font-bold">{poi.rating.toFixed(1)}</span>
                              </span>
                            )}
                          </div>
                          {poi.description && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{poi.description}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin size={12} />
                              {poi.address?.city || poi.address?.town || 'Localisation'}
                            </div>
                            {poi.phone && <div>📞 {poi.phone}</div>}
                          </div>

                          {/* Boutons Like/Favorite */}
                          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(poi);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${poi.isLiked
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              <Heart size={12} className={poi.isLiked ? 'fill-red-600' : ''} />
                              <span>{poi.likeCount || 0}</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFavorite(poi);
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition ${poi.isFavorite
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                              <Bookmark size={12} className={poi.isFavorite ? 'fill-amber-600' : ''} />
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedPoi(poi);
                              setShowInfoPanel(true);
                            }}
                            className="mt-2 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Plus de détails →
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            )}
          </div>
        </div>
      </div>

      {/* CSS pour les marqueurs personnalisés */}
      <style jsx global>{`
        .leaflet-popup-content {
          margin: 13px 19px;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}