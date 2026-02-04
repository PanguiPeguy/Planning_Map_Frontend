"use client";

import { useState, useEffect, useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  Search, Filter, Star, Eye, MapPin, X, ChevronDown,
  ChevronUp, Heart, Navigation, MessageCircle
} from "lucide-react";

// ============================================================
// MAPPING ICON → EMOJI
// ============================================================
const ICON_TO_EMOJI = {
  'toll': '🚧', 'hotel': '🏨', 'restaurant': '🍽️', 'gas_station': '⛽', 'fuel': '⛽',
  'station': '⛽', 'attraction': '🎡', 'tourism': '🎡', 'pharmacy': '💊', 'bank': '🏦',
  'market': '🛒', 'shop': '🛒', 'hospital': '🏥', 'police': '👮', 'parking': '🅿️', 'default': '📍'
};

const getEmojiFromIcon = (iconString) => {
  if (!iconString) return ICON_TO_EMOJI.default;
  return ICON_TO_EMOJI[iconString.toLowerCase().trim()] || ICON_TO_EMOJI.default;
};

// ============================================================
// ICÔNES POI
// ============================================================
const createPoiIcon = (category, isHighlighted = false) => {
  const color = category?.color || "#6b7280";
  const size = isHighlighted ? 36 : 28;
  const emoji = category?.emoji || getEmojiFromIcon(category?.icon);

  return L.divIcon({
    className: "custom-poi-marker",
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:${isHighlighted ? '16px' : '12px'}">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// ============================================================
// OPTIONS TOP N
// ============================================================
const TOP_LIMIT_OPTIONS = [
  { value: 5, label: 'Top 5' },
  { value: 10, label: 'Top 10' },
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
];

// ============================================================
// PANNEAU DE FILTRAGE
// ============================================================
export function RoutePOIFilterPanel({
  pois = [],
  categories = [],
  onFilterChange,
  selectedPoi,
  onPoiSelect,
  isLoading = false,
  // Callbacks pour appels API
  onLoadTopLiked,
  onLoadTopFavorites,
  onLoadTopCommented,
  onLoadAll,
  onCategorySelect, // New prop for backend filtering
  topPoisLoading = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [showFilters, setShowFilters] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [topLimit, setTopLimit] = useState(5);

  // Catégories
  const displayCategories = useMemo(() => {
    if (categories?.length > 0) {
      return categories.map(cat => ({ ...cat, emoji: cat.emoji || getEmojiFromIcon(cat.icon) }));
    }
    const catsMap = new Map();
    pois.forEach(poi => {
      if (poi.category?.categoryId && !catsMap.has(poi.category.categoryId)) {
        catsMap.set(poi.category.categoryId, { 
          ...poi.category, 
          emoji: poi.category.emoji || getEmojiFromIcon(poi.category.icon) 
        });
      }
    });
    return Array.from(catsMap.values());
  }, [pois, categories]);

  // Changement de filtre
  const handleSortChange = async (newSort) => {
    setSortBy(newSort);
    
    if (newSort === 'distance') {
      onLoadAll?.();
    } else if (newSort === 'likes') {
      onLoadTopLiked?.(topLimit);
    } else if (newSort === 'favorites') {
      onLoadTopFavorites?.(topLimit);
    } else if (newSort === 'comments') {
      onLoadTopCommented?.(topLimit);
    }
  };

  // Changement de limite Top N
  const handleTopLimitChange = (newLimit) => {
    setTopLimit(newLimit);
    
    if (sortBy === 'likes') onLoadTopLiked?.(newLimit);
    else if (sortBy === 'favorites') onLoadTopFavorites?.(newLimit);
    else if (sortBy === 'comments') onLoadTopCommented?.(newLimit);
  };

  // Filtrage local (recherche + catégorie)
  const filteredPois = useMemo(() => {
    let result = [...pois];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(poi =>
        poi.name?.toLowerCase().includes(q) ||
        poi.description?.toLowerCase().includes(q) ||
        poi.category?.name?.toLowerCase().includes(q) ||
        poi.address?.city?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(poi => poi.category?.categoryId == categoryFilter);
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => (a.distanceFromRoute || 0) - (b.distanceFromRoute || 0));
    }

    return result;
  }, [pois, searchQuery, categoryFilter, sortBy]);

  useEffect(() => {
    onFilterChange?.(filteredPois);
  }, [filteredPois, onFilterChange]);

  const isTopFilter = sortBy !== 'distance';
  const loading = isLoading || topPoisLoading;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <h3 className="font-bold">Points d'intérêt</h3>
          </div>
          <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
            {filteredPois.length} {isTopFilter && `/ Top ${topLimit}`}
          </span>
        </div>
      </div>

      {/* Recherche */}
      <div className="p-3 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="border-b border-gray-100 flex-shrink-0">
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2"><Filter size={16} /> Filtres</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFilters && (
          <div className="p-3 space-y-3 bg-gray-50">
            {/* Boutons tri */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Afficher</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleSortChange("distance")} 
                  disabled={loading}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === "distance" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  } disabled:opacity-50`}
                >
                  <Navigation size={14} /> Tous
                </button>
                <button 
                  onClick={() => handleSortChange("likes")} 
                  disabled={loading}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === "likes" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  } disabled:opacity-50`}
                >
                  <Heart size={14} /> Top Likés
                </button>
                <button 
                  onClick={() => handleSortChange("favorites")} 
                  disabled={loading}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === "favorites" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  } disabled:opacity-50`}
                >
                  <Star size={14} /> Top Favoris
                </button>
                <button 
                  onClick={() => handleSortChange("comments")} 
                  disabled={loading}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === "comments" ? "bg-blue-500 text-white" : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  } disabled:opacity-50`}
                >
                  <MessageCircle size={14} /> Top Commentés
                </button>
              </div>
            </div>

            {/* Sélecteur Top N */}
            {isTopFilter && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Nombre</label>
                <div className="flex gap-2">
                  {TOP_LIMIT_OPTIONS.map(opt => (
                    <button 
                      key={opt.value} 
                      onClick={() => handleTopLimitChange(opt.value)} 
                      disabled={loading}
                      className={`flex-1 px-2 py-2 rounded-lg text-sm font-medium transition ${
                        topLimit === opt.value ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-700"
                      } disabled:opacity-50`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Catégories */}
            {displayCategories.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Catégorie</label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
                  <button 
                    onClick={() => {
                        setCategoryFilter("all");
                        onCategorySelect?.(null); // Notify parent (null = all)
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      categoryFilter === "all" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700"
                    }`}
                  >
                    Toutes
                  </button>
                  {displayCategories.map(cat => (
                    <button 
                      key={cat.categoryId} 
                      onClick={() => {
                          setCategoryFilter(cat.categoryId);
                          onCategorySelect?.([cat.categoryId]); // Notify parent with array
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                        categoryFilter == cat.categoryId ? "text-white" : "bg-white border border-gray-200 text-gray-700"
                      }`}
                      style={categoryFilter == cat.categoryId ? { backgroundColor: cat.color } : {}}
                    >
                      <span>{cat.emoji}</span>
                      <span className="max-w-20 truncate">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Liste POIs */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-gray-500">{topPoisLoading ? `Chargement Top ${topLimit}...` : 'Chargement...'}</p>
          </div>
        ) : filteredPois.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun POI trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPois.map((poi, idx) => {
              const catColor = poi.category?.color || '#6b7280';
              const catEmoji = poi.category?.emoji || getEmojiFromIcon(poi.category?.icon);
              const catName = poi.category?.name || 'Autre';

              return (
                <button 
                  key={poi.poiId} 
                  onClick={() => onPoiSelect?.(poi)}
                  className={`w-full p-3 text-left hover:bg-blue-50 transition flex gap-3 ${
                    selectedPoi?.poiId === poi.poiId ? "bg-blue-50 border-l-4 border-blue-600" : ""
                  }`}
                >
                  {/* Rang pour les Tops */}
                  {isTopFilter && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                  )}
                  
                  {/* Icône catégorie */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg" 
                    style={{ backgroundColor: catColor + '25' }}
                  >
                    {catEmoji}
                  </div>
                  
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{poi.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColor }}></span>
                      <span className="truncate">{catName}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      {poi.rating > 0 && (
                        <span className={sortBy === 'favorites' ? 'text-amber-600 font-bold' : ''}>
                          ⭐ {poi.rating.toFixed(1)}
                        </span>
                      )}
                      {poi.likesCount > 0 && (
                        <span className={sortBy === 'likes' ? 'text-red-600 font-bold' : ''}>
                          ❤️ {poi.likesCount}
                        </span>
                      )}
                      {poi.visitCount > 0 && (
                        <span className={sortBy === 'comments' ? 'text-purple-600 font-bold' : ''}>
                          💬 {poi.visitCount}
                        </span>
                      )}
                      {sortBy === 'distance' && poi.distanceFromRoute != null && (
                        <span className="text-blue-600 font-medium">
                          📍 {poi.distanceFromRoute.toFixed(1)}km
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MARQUEURS CARTE
// ============================================================
export function RoutePOIMarkers({ pois = [], selectedPoi, onPoiSelect, onAddToRoute, selectedWaypoints = [] }) {
  return (
    <>
      {pois.map(poi => {
        const isSelected = selectedPoi?.poiId === poi.poiId;
        const isWaypoint = selectedWaypoints.includes(poi.poiId);
        const catColor = poi.category?.color || '#6b7280';
        const catEmoji = poi.category?.emoji || getEmojiFromIcon(poi.category?.icon);
        const catName = poi.category?.name || 'Autre';
        const addr = [poi.address?.street || poi.addressStreet, poi.address?.city || poi.addressCity]
          .filter(Boolean).join(', ');
        
        // Marker styling for waypoints
        const markerIcon = isWaypoint 
            ? L.divIcon({
                className: "custom-waypoint-marker",
                html: `<div style="background:#2563eb;width:32px;height:32px;border-radius:50%;border:4px solid white;box-shadow:0 0 15px rgba(37,99,235,0.6);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;">${poi.category?.emoji || '📍'}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
              })
            : createPoiIcon(poi.category, isSelected);

        return (
          <Marker 
            key={poi.poiId} 
            position={[poi.latitude, poi.longitude]} 
            icon={markerIcon}
            eventHandlers={{ click: () => onPoiSelect?.(poi) }}
          >
            <Popup maxWidth={280}>
              <div className="p-1">
                <h3 className="font-bold text-base text-gray-800 mb-1">{poi.name}</h3>
                <span 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2" 
                  style={{ backgroundColor: catColor + '25', color: catColor }}
                >
                  {catEmoji} {catName}
                </span>
                {poi.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{poi.description}</p>
                )}
                {addr && <p className="text-xs text-gray-500 mb-2">📍 {addr}</p>}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  {poi.rating > 0 && <span>⭐ {poi.rating.toFixed(1)}</span>}
                  {poi.likesCount > 0 && <span>❤️ {poi.likesCount}</span>}
                  {poi.visitCount > 0 && <span>💬 {poi.visitCount}</span>}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddToRoute?.(poi); }}
                    className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                  >
                    {onAddToRoute?.name === 'handleAddPoiToRoute' ? '+ Étape' : '+ Ajouter'}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); window.open(`https://maps.google.com/?q=${poi.latitude},${poi.longitude}`, '_blank'); }}
                    className="px-3 py-1.5 border border-gray-300 text-xs rounded-lg hover:bg-gray-50"
                  >
                    🧭
                  </button>
                </div>
                {/* Optional set origin/dest (Custom Mode) */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button 
                        onClick={() => { window.dispatchEvent(new CustomEvent('set-item-origin', { detail: poi })); }}
                        className="text-[10px] py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                        Origin
                    </button>
                    <button 
                        onClick={() => { window.dispatchEvent(new CustomEvent('set-item-destination', { detail: poi })); }}
                        className="text-[10px] py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100"
                    >
                        Dest.
                    </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default { RoutePOIFilterPanel, RoutePOIMarkers };