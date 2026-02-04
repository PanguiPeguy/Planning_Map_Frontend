"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingScreen from "@/src/components/layout/Loading";

// Services
import planningService from "@/src/services/planningService";
import itineraryService from "@/src/services/itineraryService";
import poiService from "@/src/services/poiService";

// Auth Context
import { useAuth } from "@/src/contexts/AuthContext";

// Icons
import { 
  ArrowBack, ArrowForward, PlayArrow, Map as MapIcon, 
  Timeline, DirectionsCar, CheckCircle, Edit, Save, 
  DirectionsBus, AltRoute, Close, FilterList 
} from "@mui/icons-material";

// Map
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Composants POI
import { RoutePOIFilterPanel, RoutePOIMarkers } from "@/src/components/Map/RoutePOIFilter";

// ============================================================
// ICÔNES
// ============================================================
const icon = L.icon({ iconUrl: "/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });
const startIcon = L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [32, 32], iconAnchor: [16, 32] });
const endIcon = L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684850.png", iconSize: [32, 32], iconAnchor: [16, 32] });
const busStopIcon = L.icon({ 
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", 
    iconSize: [24, 24], 
    iconAnchor: [12, 12] 
});

const ICON_TO_EMOJI = {
  'toll': '🚧', 'hotel': '🏨', 'restaurant': '🍽️', 'gas_station': '⛽', 'fuel': '⛽',
  'station': '⛽', 'attraction': '🎡', 'tourism': '🎡', 'pharmacy': '💊', 'bank': '🏦',
  'market': '🛒', 'shop': '🛒', 'hospital': '🏥', 'police': '👮', 'parking': '🅿️', 'default': '📍'
};
const getEmojiFromIcon = (icon) => ICON_TO_EMOJI[icon?.toLowerCase()?.trim()] || ICON_TO_EMOJI.default;

// ============================================================
// DYNAMIC POI LOADER (from first file)
// ============================================================
// ============================================================
// MAP MOVE DISCOVERY RELOAD
// ============================================================
function MapDiscoveryController({ isCustomMode, onMapMove }) {
  const map = useMapEvents({
    moveend: () => {
      if (isCustomMode) {
        const bounds = map.getBounds();
        onMapMove(
          bounds.getSouth(), 
          bounds.getWest(), 
          bounds.getNorth(), 
          bounds.getEast()
        );
      }
    }
  });
  return null;
}

// ============================================================
// DECODE POLYLINE
// ============================================================
const decodePolyline = (encoded) => {
    if (!encoded) return [];
    if (Array.isArray(encoded)) {
        return encoded.filter(p => Array.isArray(p) && p.length >= 2 && 
                                   typeof p[0] === 'number' && typeof p[1] === 'number');
    }
    if (typeof encoded !== 'string') return [];
    
    try {
        if (encoded.startsWith("[")) {
            let sanitized = encoded.replace(/\s/g, '');
            sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');
            sanitized = sanitized.replace(/,+/g, ',');
            sanitized = sanitized.replace(/\](?!\s*[,\[\]]|$)/g, '],');
            sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');
            
            const parsed = JSON.parse(sanitized);
            if (!Array.isArray(parsed)) {
                console.warn("Parsed polyline is not an array:", typeof parsed);
                return [];
            }
            
            return parsed
                .filter(point => point != null)
                .map(point => {
                    if (Array.isArray(point) && point.length === 4) {
                        const lat = parseFloat(`${point[0]}.${point[1]}`);
                        const lng = parseFloat(`${point[2]}.${point[3]}`);
                        if (!isNaN(lat) && !isNaN(lng)) {
                            return [lat, lng];
                        }
                    }
                    if (Array.isArray(point) && point.length >= 2) {
                        const lat = parseFloat(point[0]);
                        const lng = parseFloat(point[1]);
                        if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
                            return [lat, lng];
                        }
                    }
                    return null;
                })
                .filter(p => p != null);
        }
    } catch(e) {
        console.error("Polyline parse error:", e, "Input length:", encoded.length, "First 200 chars:", encoded.substring(0, 200));
        try {
            const coordPattern = /\[(-?\d+\.?\d*),(-?\d+\.?\d*)\]/g;
            const matches = [...encoded.matchAll(coordPattern)];
            if (matches.length > 0) {
                const coords = matches.map(m => [parseFloat(m[1]), parseFloat(m[2])])
                    .filter(c => !isNaN(c[0]) && !isNaN(c[1]));
                if (coords.length > 0) {
                    console.warn("Recovered", coords.length, "coordinates from malformed JSON");
                    return coords;
                }
            }
        } catch(recoveryError) {
            console.error("Failed to recover coordinates:", recoveryError);
        }
    }
    return [];
};

// ============================================================
// MAP BOUNDS CONTROLLER
// ============================================================
function MapBoundsController({ routeGeom, optimalRouteGeom, previewRoute, selectedPoi }) {
    const map = useMap();
    useEffect(() => {
        // Priority 1: Selected POI
        if (selectedPoi) { 
            map.setView([selectedPoi.latitude, selectedPoi.longitude], 14, { animate: true }); 
            return; 
        }

        const allPts = [];
        
        // Priority 2: Preview a specific route
        if (previewRoute === 'optimal' && optimalRouteGeom) {
            const pts = decodePolyline(optimalRouteGeom);
            if (pts.length > 0) {
                const bounds = L.latLngBounds(pts);
                map.fitBounds(bounds, { padding: [50, 50] });
                return;
            }
        } else if (previewRoute === 'custom' && routeGeom) {
            const pts = decodePolyline(routeGeom);
            if (pts.length > 0) {
                const bounds = L.latLngBounds(pts);
                map.fitBounds(bounds, { padding: [50, 50] });
                return;
            }
        }
        
        // Priority 3: Show both routes
        if (routeGeom) {
            const pts = decodePolyline(routeGeom);
            if (pts.length > 0) allPts.push(...pts);
        }
        if (optimalRouteGeom) {
            const pts = decodePolyline(optimalRouteGeom);
            if (pts.length > 0) allPts.push(...pts);
        }
        if (allPts.length > 0) {
            const bounds = L.latLngBounds(allPts);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routeGeom, optimalRouteGeom, previewRoute, selectedPoi, map]);
    return null;
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function PlanningDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // États principaux
  const [planning, setPlanning] = useState(null);
  const [items, setItems] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [previewRoute, setPreviewRoute] = useState(null); // 'custom' | 'optimal' | null

  // POIs - Combined from both files
  const [showPOIPanel, setShowPOIPanel] = useState(true);
  const [allRoutePois, setAllRoutePois] = useState([]);
  const [displayedPois, setDisplayedPois] = useState([]);
  const [filteredPois, setFilteredPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [poisLoading, setPoisLoading] = useState(false);
  const [topPoisLoading, setTopPoisLoading] = useState(false);
  const [selectedWaypoints, setSelectedWaypoints] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modales
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  
  const [newItem, setNewItem] = useState({
      originCity: '',
      originLatitude: null,
      originLongitude: null,
      destinationCity: '',
      destinationLatitude: null,
      destinationLongitude: null,
      departureTime: '',
      plannedDate: new Date().toISOString().split('T')[0]
  });

  // ============================================================
  // NORMALISER POI
  // ============================================================
  const normalizePoi = useCallback((poi) => {
    const cat = poi.category ? {
      categoryId: poi.category.categoryId,
      name: poi.category.name || 'Autre',
      icon: poi.category.icon || 'default',
      color: poi.category.color || '#6b7280',
      emoji: getEmojiFromIcon(poi.category.icon)
    } : { categoryId: 0, name: 'Autre', icon: 'default', color: '#6b7280', emoji: '📍' };

    return {
      poiId: poi.poiId,
      name: poi.name || 'Sans nom',
      description: poi.description || '',
      latitude: parseFloat(poi.latitude),
      longitude: parseFloat(poi.longitude),
      category: cat,
      address: { 
        full: poi.address || '', 
        street: poi.addressStreet || '', 
        city: poi.addressCity || '', 
        region: poi.addressRegion || '' 
      },
      phone: poi.phone || '',
      rating: parseFloat(poi.rating) || 0,
      services: poi.services || [],
      likesCount: poi.likesCount || 0,
      visitCount: poi.visitCount || 0,
      distanceFromRoute: poi.distanceFromRoute
    };
  }, []);

  // ============================================================
  // CHARGER CATÉGORIES
  // ============================================================
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await poiService.getCategories();
        const cats = response.data?.categories || [];
        setCategories(cats.map(c => ({ ...c, emoji: getEmojiFromIcon(c.icon) })));
      } catch (err) { 
        console.error("Erreur catégories:", err); 
      }
    };
    loadCategories();
  }, []);

  // ============================================================
  // CUSTOM EVENTS FOR ORIGIN/DESTINATION
  // ============================================================
  useEffect(() => {
    const handleSetOrigin = (e) => {
        const poi = e.detail;
        setNewItem(prev => ({
            ...prev,
            originCity: poi.name,
            originLatitude: poi.latitude,
            originLongitude: poi.longitude
        }));
        if (!showAddModal) setShowAddModal(true);
    };
    const handleSetDest = (e) => {
        const poi = e.detail;
        setNewItem(prev => ({
            ...prev,
            destinationCity: poi.name,
            destinationLatitude: poi.latitude,
            destinationLongitude: poi.longitude
        }));
        if (!showAddModal) setShowAddModal(true);
    };

    window.addEventListener('set-item-origin', handleSetOrigin);
    window.addEventListener('set-item-destination', handleSetDest);
    return () => {
        window.removeEventListener('set-item-origin', handleSetOrigin);
        window.removeEventListener('set-item-destination', handleSetDest);
    };
  }, [showAddModal]);

  // ============================================================
  // CHARGER DONNÉES
  // ============================================================
  useEffect(() => {
    const loadAllData = async () => {
      if (!currentUser) {
        console.log("En attente de l'utilisateur connecté...");
        return;
      }
      
      try {
        setLoading(true);
        console.log("Utilisateur connecté:", currentUser.id);

        const userId = currentUser.id || currentUser.userId || currentUser.user_id;

        // Load planning details and items
        const [pData, iData, userItineraries] = await Promise.all([
          planningService.getPlanningDetails(id),
          planningService.getPlanningItems(id),
          userId ? itineraryService.getUserItineraries(userId) : Promise.resolve([])
        ]);

        setPlanning(pData);
        setItems(iData);
        setItineraries(userItineraries || []);
        
        // Check for items needing route calculation
        const itemsNeedingCalculation = iData.filter(item => 
          item.status !== 'CALCULATED' && 
          !item.routeGeom && 
          !item.optimalRouteGeom &&
          item.originCity && 
          item.destinationCity
        );
        
        // Auto-calculate routes if needed
        if (itemsNeedingCalculation.length > 0) {
          console.log(`${itemsNeedingCalculation.length} items need route calculation...`);
          planningService.calculateAllRoutes(id).then(updatedItems => {
            setItems(updatedItems);
            if (selectedItem) {
              const fresh = updatedItems.find(i => i.id === selectedItem.id);
              if (fresh) setSelectedItem(fresh);
            }
          }).catch(err => {
            console.error("Error auto-calculating routes:", err);
          });
        }
        
        // Auto-select first item
        if (iData && iData.length > 0) {
            const firstWithRoute = iData.find(i => i.routeGeom || i.optimalRouteGeom) || iData[0];
            setSelectedItem(firstWithRoute);
        }

      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [id, currentUser]);

  // ============================================================
  // CHARGER POIs POUR LA ROUTE SÉLECTIONNÉE
  // ============================================================
  useEffect(() => {
    if (selectedItem) {
      loadAllRoutePois();
    } else {
      setAllRoutePois([]);
      setDisplayedPois([]);
    }
  }, [selectedItem]);

  const loadInArea = async (s, w, n, e) => {
    try {
      setPoisLoading(true);
      const response = await poiService.getInArea(s, w, n, e);
      const rawPois = response.data?.pois || response.data || [];
      const normalized = rawPois.map(p => normalizePoi(p));
      setAllRoutePois(normalized);
      setDisplayedPois(normalized);
    } catch(err) {
      console.error(err);
    } finally {
      setPoisLoading(false);
    }
  };

  const loadAllRoutePois = async (categoryIds = null) => {
    if (!selectedItem) return;
    
    try {
      setPoisLoading(true);
      console.log("Loading POIs for route via Bounding Box...", categoryIds ? `filtered by categories: ${categoryIds}` : "all categories");

      let bbox = null;
      let pts = [];

      // Determine Bounding Box
      if (selectedItem.routeGeom) {
        pts = decodePolyline(selectedItem.routeGeom);
        if (pts.length > 0) {
          const lats = pts.map(p => p[0]);
          const lons = pts.map(p => p[1]);
          bbox = {
            minLat: Math.min(...lats) - 0.05,
            maxLat: Math.max(...lats) + 0.05,
            minLon: Math.min(...lons) - 0.05,
            maxLon: Math.max(...lons) + 0.05
          };
        }
      } 
      
      if (!bbox && selectedItem.originLatitude && selectedItem.destinationLatitude) {
        bbox = {
          minLat: Math.min(selectedItem.originLatitude, selectedItem.destinationLatitude) - 0.1,
          maxLat: Math.max(selectedItem.originLatitude, selectedItem.destinationLatitude) + 0.1,
          minLon: Math.min(selectedItem.originLongitude, selectedItem.destinationLongitude) - 0.1,
          maxLon: Math.max(selectedItem.originLongitude, selectedItem.destinationLongitude) + 0.1
        };
      }

      if (!bbox) {
        setAllRoutePois([]);
        setDisplayedPois([]);
        return;
      }

      // Fetch POIs in Area
      const response = await poiService.getInArea(
          bbox.minLat, 
          bbox.minLon, 
          bbox.maxLat, 
          bbox.maxLon,
          categoryIds || []
      );
      
      const rawPois = response.data?.pois || response.data || [];
      console.log(`POIs found in bounding box: ${rawPois.length}`);

      // Normalize & Refine
      let pois = rawPois.map(p => normalizePoi(p));

      if (pts.length > 0) {
        const MAX_DIST_KM = 10;
        const haversine = (lat1, lon1, lat2, lon2) => {
            const R = 6371; 
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        };

        const sampleRate = Math.max(1, Math.floor(pts.length / 50)); 
        const sampledPts = pts.filter((_, i) => i % sampleRate === 0);

        pois = pois.filter(p => {
          let minDist = Infinity;
          for (const pt of sampledPts) {
            const d = haversine(p.latitude, p.longitude, pt[0], pt[1]);
            if (d < minDist) minDist = d;
            if (d < 1) break;
          }
          return minDist <= MAX_DIST_KM;
        });
      }

      console.log(`POIs after route refinement: ${pois.length}`);
      setAllRoutePois(pois);
      setDisplayedPois(pois);

    } catch (err) {
      console.error("Error loading route POIs:", err);
      setAllRoutePois([]);
      setDisplayedPois([]);
    } finally {
      setPoisLoading(false);
    }
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const handleCategorySelect = (categoryIds) => {
      loadAllRoutePois(categoryIds);
  };

  const loadTopLiked = useCallback(async (limit = 5) => {
    setTopPoisLoading(true);
    const sorted = [...allRoutePois]
      .filter(p => (p.likesCount || 0) > 0)
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, limit);
    await new Promise(r => setTimeout(r, 200));
    setDisplayedPois(sorted);
    setTopPoisLoading(false);
  }, [allRoutePois]);

  const loadTopFavorites = useCallback(async (limit = 5) => {
    setTopPoisLoading(true);
    const sorted = [...allRoutePois]
      .filter(p => (p.visitCount || 0) > 0)
      .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
      .slice(0, limit);
    await new Promise(r => setTimeout(r, 200));
    setDisplayedPois(sorted);
    setTopPoisLoading(false);
  }, [allRoutePois]);

  const loadTopCommented = useCallback(async (limit = 5) => {
    setTopPoisLoading(true);
    const sorted = [...allRoutePois]
      .filter(p => (p.reviewCount || 0) > 0)
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, limit);
    await new Promise(r => setTimeout(r, 200));
    setDisplayedPois(sorted);
    setTopPoisLoading(false);
  }, [allRoutePois]);

  const loadAll = useCallback(() => {
    setDisplayedPois(allRoutePois);
  }, [allRoutePois]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleFilterChange = useCallback((filtered) => { 
    setFilteredPois(filtered); 
  }, []);

  const handleItemClick = (item) => {
      setSelectedItem(item);
      setIsCustomMode(false);
      setPreviewRoute(null);
      setSelectedPoi(null);
  };

  const handlePoiSelect = (poi) => {
      if (isCustomMode) {
          toggleWaypoint(poi);
      } else {
          setSelectedPoi(poi);
      }
  };

  const toggleWaypoint = (poi) => {
      if (selectedWaypoints.find(w => w.poiId === poi.poiId)) {
          setSelectedWaypoints(prev => prev.filter(w => w.poiId !== poi.poiId));
      } else {
          setSelectedWaypoints(prev => [...prev, poi]);
      }
  };

  const handleAddPoiToRoute = (poi) => {
    if (selectedWaypoints.find(w => w.poiId === poi.poiId)) {
      setSelectedWaypoints(prev => prev.filter(w => w.poiId !== poi.poiId));
    } else {
      setSelectedWaypoints(prev => [...prev, poi]);
    }
  };

  const calculateAll = async () => {
    try {
      setCalculating(true);
      const updatedItems = await planningService.calculateAllRoutes(id);
      setItems(updatedItems);
      if(selectedItem) {
          const fresh = updatedItems.find(i => i.id === selectedItem.id);
          if(fresh) setSelectedItem(fresh);
      }
      alert("Calcul terminé !");
    } catch (err) {
      console.error(err);
      alert("Erreur calcul");
    } finally {
      setCalculating(false);
    }
  };

  const handleAssignItinerary = async (itineraryId) => {
      if (!selectedItem) return;
      try {
          const updatedItem = await planningService.assignItinerary(selectedItem.id, itineraryId);
          setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
          setSelectedItem(updatedItem);
          setShowAssignModal(false);
      } catch (e) {
          console.error(e);
          alert("Erreur assignation");
      }
  };

  const handleAddItem = async () => {
      try {
          const created = await planningService.addItem(id, newItem);
          setItems([...items, created]);
          setShowAddModal(false);
          setNewItem({
              originCity: '',
              originLatitude: null,
              originLongitude: null,
              destinationCity: '',
              destinationLatitude: null,
              destinationLongitude: null,
              departureTime: '',
              plannedDate: new Date().toISOString().split('T')[0]
          });
      } catch (e) {
          alert("Erreur ajout départ");
      }
  };

  const handleSaveCustomItinerary = async () => {
      if (!selectedItem) return;
      try {
          setCalculating(true);
          const waypointIds = selectedWaypoints.map(w => w.poiId);
          const updatedItem = await planningService.updateItem(selectedItem.id, {
              ...selectedItem,
              selectedWaypointsJson: JSON.stringify(waypointIds)
          });
          
          const fresh = await planningService.calculateItemRoute(updatedItem.id);
          setItems(prev => prev.map(i => i.id === fresh.id ? fresh : i));
          setSelectedItem(fresh);
          setIsCustomMode(false);
          setSelectedWaypoints([]);
          alert("Itinéraire personnalisé sauvegardé et calculé !");
      } catch (e) {
          alert("Erreur sauvegarde itinéraire");
      } finally {
          setCalculating(false);
      }
  };

  const handlePreviewRoute = (type) => {
      setPreviewRoute(type);
  };

  const calculateRouteMetrics = (geometry, customDistance, customTime) => {
      if (!geometry) return { distance: null, time: null };
      
      const coords = decodePolyline(geometry);
      if (coords.length < 2) return { distance: null, time: null };
      
      let totalDistance = 0;
      for (let i = 1; i < coords.length; i++) {
          const [lat1, lon1] = coords[i - 1];
          const [lat2, lon2] = coords[i];
          const R = 6371e3;
          const φ1 = lat1 * Math.PI / 180;
          const φ2 = lat2 * Math.PI / 180;
          const Δφ = (lat2 - lat1) * Math.PI / 180;
          const Δλ = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          totalDistance += R * c;
      }

      let timeSeconds = null;
      if (customDistance && customTime) {
          const speed = customDistance / customTime;
          timeSeconds = Math.round(totalDistance / speed);
      } else {
          const averageSpeedMs = 60000 / 3600;
          timeSeconds = Math.round(totalDistance / averageSpeedMs);
      }

      return { distance: totalDistance, time: timeSeconds };
  };

  const handleValidateRoute = async () => {
      if (!selectedItem || !previewRoute) return;
      
      try {
          setCalculating(true);
          let updatedData = { ...selectedItem };
          
          if (previewRoute === 'optimal') {
              updatedData.routeGeom = selectedItem.optimalRouteGeom;
              
              const metrics = calculateRouteMetrics(
                  selectedItem.optimalRouteGeom,
                  selectedItem.distanceMeters,
                  selectedItem.travelTimeSeconds
              );
              if (metrics.distance) {
                  updatedData.distanceMeters = metrics.distance;
              }
              if (metrics.time) {
                  updatedData.travelTimeSeconds = metrics.time;
              }
          }

          const updated = await planningService.updateItem(selectedItem.id, updatedData);
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          setSelectedItem(updated);
          setPreviewRoute(null);
          alert(`Trajet ${previewRoute === 'optimal' ? 'direct' : 'personnalisé'} validé !`);
      } catch (e) {
          console.error(e);
          alert("Erreur lors de la validation de la route");
      } finally {
          setCalculating(false);
      }
  };

  const getEstimatedArrival = (dep, dur) => {
    if (!dep || !dur) return null;
    try {
        const [h, m] = dep.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        d.setSeconds(d.getSeconds() + dur);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch(e) { return null; }
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) return <LoadingScreen />;

  const poisToDisplay = filteredPois.length > 0 ? filteredPois : displayedPois;

  return (
    <main className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ marginTop: "64px" }}>
      
      {/* SIDEBAR GAUCHE */}
      <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-lg">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <button onClick={() => router.back()} className="mb-4 flex items-center text-gray-500 hover:text-blue-600">
            <ArrowBack fontSize="small" className="mr-1" /> Retour
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800">{planning?.name || 'Planning'}</h1>
          <div className="text-sm text-gray-500 mt-1">{items.length} départ{items.length > 1 ? 's' : ''} programmé{items.length > 1 ? 's' : ''}</div>

          <div className="grid grid-cols-2 gap-3 mt-6">
             <button
                onClick={calculateAll}
                disabled={calculating}
                className="py-2 bg-blue-600 text-white rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700"
             >
                <PlayArrow /> {calculating ? "..." : "Calculer Tout"}
             </button>
             <button 
                onClick={() => setShowAddModal(true)}
                className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex justify-center items-center gap-2"
             >
                 <span className="text-lg">+</span> Ajouter Départ
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 rounded-xl border transition cursor-pointer relative overflow-hidden group
                ${selectedItem?.id === item.id 
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex justify-between items-start mb-2">
                 <div className="font-semibold text-gray-800">
                   {item.originCity} <ArrowForward style={{fontSize:14}} /> {item.destinationCity}
                 </div>
                 {item.status === 'CALCULATED' && <CheckCircle fontSize="small" className="text-green-500" />}
              </div>
              
              <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                 <span className="flex items-center gap-1"><Timeline fontSize="small" /> {item.departureTime}</span>
                 {item.distanceMeters && <span>{(item.distanceMeters/1000).toFixed(1)} km</span>}
                 {item.travelTimeSeconds && (
                    <span className="text-blue-600 font-medium">
                       Arrivée: {getEstimatedArrival(item.departureTime, item.travelTimeSeconds)}
                    </span>
                 )}
              </div>

              {selectedItem?.id === item.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200 flex gap-2 flex-wrap">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowAssignModal(true); }}
                        className="text-xs bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                      >
                          <AltRoute fontSize="inherit" /> Choisir Itinéraire
                      </button>
                  </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* CARTE */}
      <div className="flex-1 bg-slate-100 relative" style={{ zIndex: "10"}}>
        <MapContainer center={[4.05, 9.7]} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Map Discovery Controller */}
            <MapDiscoveryController 
                isCustomMode={isCustomMode} 
                onMapMove={loadInArea} 
            />
            
            <MapBoundsController 
               routeGeom={selectedItem?.routeGeom}
               optimalRouteGeom={selectedItem?.optimalRouteGeom}
               previewRoute={previewRoute}
               selectedPoi={selectedPoi}
            />

            {/* Routes autres trajets */}
            {items.map(item => {
                if (selectedItem?.id === item.id) return null;
                
                const hasRoute = item.routeGeom && decodePolyline(item.routeGeom).length > 0;
                const hasOptimalRoute = item.optimalRouteGeom && decodePolyline(item.optimalRouteGeom).length > 0;
                
                if (!hasRoute && !hasOptimalRoute) return null;
                
                return (
                    <div key={`legs-${item.id}`}>
                        {hasRoute && (
                            <Polyline 
                                positions={decodePolyline(item.routeGeom)}
                                pathOptions={{ color: '#94a3b8', weight: 3, opacity: 0.4 }}
                            />
                        )}
                        {hasOptimalRoute && (
                            <Polyline 
                                positions={decodePolyline(item.optimalRouteGeom)}
                                pathOptions={{ color: '#86efac', weight: 2, opacity: 0.3, dashArray: '5, 5' }}
                            />
                        )}
                    </div>
                );
            })}

            {/* Marqueurs départ/arrivée */}
            {items.map(item => (
                <div key={`markers-${item.id}`}>
                    {item.originLatitude && item.originLongitude && (
                        <Marker position={[item.originLatitude, item.originLongitude]} icon={startIcon}>
                            <Popup><b>Départ: {item.originCity}</b><br/>{item.plannedDate}</Popup>
                        </Marker>
                    )}
                    {item.destinationLatitude && item.destinationLongitude && (
                        <Marker position={[item.destinationLatitude, item.destinationLongitude]} icon={endIcon}>
                            <Popup><b>Arrivée: {item.destinationCity}</b><br/>{item.plannedDate}</Popup>
                        </Marker>
                    )}
                </div>
            ))}

            {/* Selected Item Routes */}
            {selectedItem && (
                <>
                   {/* Custom Route (Bottom, Wider) */}
                   {selectedItem.routeGeom && decodePolyline(selectedItem.routeGeom).length > 0 && (
                       <Polyline 
                          positions={decodePolyline(selectedItem.routeGeom)} 
                          pathOptions={{ 
                              color: '#3b82f6', 
                              weight: previewRoute === 'custom' ? 12 : 10, 
                              opacity: previewRoute === 'custom' ? 0.8 : (previewRoute === 'optimal' ? 0.2 : 0.4),
                              lineCap: 'round',
                              lineJoin: 'round'
                          }} 
                       >
                           <Popup>
                               <div className="p-2">
                                   <b className="text-blue-600">🔵 Route Personnalisée</b><br/>
                                   <span className="text-xs">
                                       {selectedItem.selectedWaypointsJson ? 'Avec points d\'intérêt' : 'Route calculée'}
                                   </span>
                               </div>
                           </Popup>
                       </Polyline>
                   )}

                   {/* Optimal Route (Top, Thinner, Dashed) */}
                   {selectedItem.optimalRouteGeom && decodePolyline(selectedItem.optimalRouteGeom).length > 0 && (
                       <Polyline 
                          positions={decodePolyline(selectedItem.optimalRouteGeom)} 
                          pathOptions={{ 
                              color: '#10b981', 
                              weight: previewRoute === 'optimal' ? 6 : 5, 
                              opacity: previewRoute === 'optimal' ? 1.0 : (previewRoute === 'custom' ? 0.4 : 0.9), 
                              dashArray: '10, 10',
                              lineCap: 'round',
                              lineJoin: 'round'
                          }} 
                       >
                           <Popup>
                               <div className="p-2">
                                   <b className="text-green-600">🟢 Route Directe (Optimal)</b><br/>
                                   <span className="text-xs">Le chemin le plus court sans détours</span>
                               </div>
                           </Popup>
                       </Polyline>
                   )}
                </>
            )}

            {/* Unified POI Markers (Respective of Filters) */}
            {selectedItem && !poisLoading && poisToDisplay.length > 0 && (
                <RoutePOIMarkers 
                  pois={poisToDisplay} 
                  selectedPoi={selectedPoi} 
                  onPoiSelect={handlePoiSelect} 
                  onAddToRoute={handlePoiSelect} 
                  selectedWaypoints={selectedWaypoints.map(w => w.poiId)}
                />
            )}
        </MapContainer>
        
        {/* Route Selector Overlay */}
        {selectedItem && selectedItem.optimalRouteGeom && selectedItem.routeGeom && 
         decodePolyline(selectedItem.optimalRouteGeom).length > 0 && 
         decodePolyline(selectedItem.routeGeom).length > 0 && (
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-[1000] border-2 border-blue-200 min-w-[300px]">
                <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AltRoute className="text-blue-600" fontSize="small" /> Comparaison des Routes
                </h4>
                <p className="text-xs text-gray-500 mb-3">Cliquez sur une route pour la prévisualiser, puis validez:</p>
                <div className="space-y-2">
                    <button 
                         onClick={() => handlePreviewRoute('custom')}
                         className={`w-full p-3 rounded-xl border-2 flex justify-between items-center transition-all ${
                             previewRoute === 'custom' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 
                             'border-gray-200 bg-white hover:border-blue-300'
                         }`}
                    >
                        <div className="text-left">
                            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                🔵 Route Personnalisée
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                                {selectedItem.selectedWaypointsJson ? 'Via vos POIs' : 'Route calculée'}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-bold text-blue-600">
                                {selectedItem.distanceMeters ? `${(selectedItem.distanceMeters / 1000).toFixed(1)} km` : 'N/A'}
                            </div>
                            {selectedItem.travelTimeSeconds && (() => {
                                const hours = Math.floor(selectedItem.travelTimeSeconds / 3600);
                                const minutes = Math.floor((selectedItem.travelTimeSeconds % 3600) / 60);
                                const timeStr = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
                                return (
                                    <div className="text-[10px] text-gray-600 mt-0.5">
                                        {timeStr}
                                    </div>
                                );
                            })()}
                        </div>
                    </button>

                    {(() => {
                        const calculateRouteDistance = (geometry) => {
                            const coords = decodePolyline(geometry);
                            if (coords.length < 2) return null;
                            let totalDistance = 0;
                            for (let i = 1; i < coords.length; i++) {
                                const [lat1, lon1] = coords[i - 1];
                                const [lat2, lon2] = coords[i];
                                const R = 6371e3;
                                const φ1 = lat1 * Math.PI / 180;
                                const φ2 = lat2 * Math.PI / 180;
                                const Δφ = (lat2 - lat1) * Math.PI / 180;
                                const Δλ = (lon2 - lon1) * Math.PI / 180;
                                const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                                          Math.cos(φ1) * Math.cos(φ2) *
                                          Math.sin(Δλ/2) * Math.sin(Δλ/2);
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                totalDistance += R * c;
                            }
                            return totalDistance;
                        };

                        const formatTime = (seconds) => {
                            if (!seconds) return null;
                            const hours = Math.floor(seconds / 3600);
                            const minutes = Math.floor((seconds % 3600) / 60);
                            if (hours > 0) {
                                return `${hours}h ${minutes}min`;
                            }
                            return `${minutes}min`;
                        };

                        const optimalDistance = selectedItem.optimalRouteGeom ? 
                            calculateRouteDistance(selectedItem.optimalRouteGeom) : null;

                        let optimalTimeSeconds = null;
                        if (optimalDistance && selectedItem.distanceMeters && selectedItem.travelTimeSeconds) {
                            const customSpeed = selectedItem.distanceMeters / selectedItem.travelTimeSeconds;
                            optimalTimeSeconds = Math.round(optimalDistance / customSpeed);
                        } else if (optimalDistance) {
                            const averageSpeedMs = 60000 / 3600;
                            optimalTimeSeconds = Math.round(optimalDistance / averageSpeedMs);
                        }

                        return (
                            <button 
                                 onClick={() => handlePreviewRoute('optimal')}
                                 className={`w-full p-3 rounded-xl border-2 flex justify-between items-center transition-all ${
                                     previewRoute === 'optimal' ? 'border-green-500 bg-green-50 ring-2 ring-green-300' : 
                                     'border-gray-200 bg-white hover:border-green-300'
                                 }`}
                            >
                                <div className="text-left">
                                    <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        🟢 Route Directe (Optimal)
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">Le chemin le plus court</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-green-600">
                                        {optimalDistance ? `${(optimalDistance / 1000).toFixed(1)} km` : 'N/A'}
                                    </div>
                                    {optimalTimeSeconds && (
                                        <div className="text-[10px] text-gray-600 mt-0.5">
                                            {formatTime(optimalTimeSeconds)}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })()}
                </div>
                
                {previewRoute && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleValidateRoute}
                            disabled={calculating}
                            className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {calculating ? 'Calcul en cours...' : '✓ Valider cette route'}
                        </button>
                        <button
                            onClick={() => setPreviewRoute(null)}
                            className="w-full mt-2 py-1.5 text-gray-600 text-sm hover:text-gray-800"
                        >
                            Annuler
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Toggle POI Panel */}
        {!isCustomMode && (
            <button 
              onClick={() => setShowPOIPanel(!showPOIPanel)} 
              className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50"
            >
              {showPOIPanel ? <Close /> : <FilterList />}
            </button>
        )}

        {/* Loading indicator */}
        {(poisLoading || topPoisLoading) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm text-gray-600">Chargement...</span>
          </div>
        )}

        {/* POI counter */}
        {!isCustomMode && selectedItem && !poisLoading && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
            <span className="font-medium">{poisToDisplay.length}</span> POIs
            {filteredPois.length > 0 && filteredPois.length !== displayedPois.length && (
              <span className="text-gray-400 ml-1">(filtrés)</span>
            )}
          </div>
        )}
      </div>

      {/* SIDEBAR DROITE - POIs (Persistent) */}
      {showPOIPanel && selectedItem && (
        <aside className="w-full md:w-80 bg-gray-50 border-l border-gray-200 flex flex-col h-full z-10 flex-shrink-0">
          <RoutePOIFilterPanel
            pois={displayedPois}
            categories={categories}
            onFilterChange={handleFilterChange}
            selectedPoi={selectedPoi}
            onPoiSelect={handlePoiSelect}
            isLoading={poisLoading}
            onLoadTopLiked={loadTopLiked}
            onLoadTopFavorites={loadTopFavorites}
            onLoadTopCommented={loadTopCommented}
            onLoadAll={loadAll}
            onCategorySelect={handleCategorySelect}
            topPoisLoading={topPoisLoading}
          />

          {selectedWaypoints.length > 0 && (
            <div className="p-4 bg-blue-50 border-t border-blue-200 flex-shrink-0">
              <h4 className="font-bold text-blue-800 text-sm mb-2">
                Étapes ({selectedWaypoints.length})
              </h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {selectedWaypoints.map((w, i) => (
                  <span key={w.poiId} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    {w.name}
                    <button onClick={() => handleAddPoiToRoute(w)} className="ml-1">×</button>
                  </span>
                ))}
              </div>
              <button 
                onClick={handleSaveCustomItinerary} 
                disabled={calculating} 
                className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg text-sm"
              >
                {calculating ? 'Calcul...' : 'Recalculer avec ces étapes'}
              </button>
            </div>
          )}
        </aside>
      )}

      {/* MODAL: ASSIGN ITINERARY */}
      {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm shadow-2xl">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Choisir un itinéraire</h3>
                        <p className="text-sm text-gray-500">Pour le départ de {selectedItem?.departureTime}</p>
                    </div>
                    <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                </div>
                <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                    <button 
                        onClick={() => { setShowAssignModal(false); setIsCustomMode(true); }}
                        className="w-full p-4 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
                    >
                        <AltRoute /> Créer un itinéraire personnalisé
                    </button>

                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Itinéraires enregistrés</div>
                    
                    {itineraries.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">
                            Aucun itinéraire enregistré.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {itineraries.map(it => (
                                <button
                                   key={it.id}
                                   onClick={() => handleAssignItinerary(it.id)}
                                   className="w-full text-left p-4 rounded-xl hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition flex justify-between items-center group"
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 group-hover:text-blue-700">{it.name}</div>
                                        <div className="text-xs text-gray-500">{it.originLocation} → {it.destinationLocation}</div>
                                    </div>
                                    <div className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                                        Choisir
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-right text-xs text-gray-400">
                    Sélectionnez un itinéraire pour l'affecter à ce départ.
                </div>
             </div>
          </div>
      )}

      {/* MODAL: ADD DEPARTURE */}
      {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">Ajouter un nouveau départ</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ville d'origine</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ex: Yaoundé"
                            value={newItem.originCity}
                            onChange={(e) => setNewItem({...newItem, originCity: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ville de destination</label>
                        <input 
                            type="text" 
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ex: Douala"
                            value={newItem.destinationCity}
                            onChange={(e) => setNewItem({...newItem, destinationCity: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                            <input 
                                type="date" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={newItem.plannedDate}
                                onChange={(e) => setNewItem({...newItem, plannedDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Heure de départ</label>
                            <input 
                                type="time" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={newItem.departureTime}
                                onChange={(e) => setNewItem({...newItem, departureTime: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button onClick={() => setShowAddModal(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Annuler</button>
                    <button 
                        onClick={handleAddItem}
                        disabled={!newItem.originCity || !newItem.destinationCity || !newItem.departureTime}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Enregistrer
                    </button>
                </div>
             </div>
          </div>
      )}

      {/* OVERLAY: CUSTOM ITINERARY MODE */}
      {isCustomMode && (
          <div className="fixed top-20 right-8 left-auto md:left-[35%] md:right-8 bg-white/90 backdrop-blur shadow-2xl rounded-2xl p-6 z-[1001] border-2 border-blue-500 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                          <DirectionsCar className="text-blue-600" /> Mode Construction d'Itinéraire
                      </h4>
                      <p className="text-sm text-gray-600">Sélectionnez les points d'intérêt sur la carte pour les ajouter comme étapes.</p>
                  </div>
                  <button onClick={() => setIsCustomMode(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                  {selectedWaypoints.length === 0 ? (
                      <span className="text-sm text-gray-400 italic">Aucun point sélectionné...</span>
                  ) : (
                      selectedWaypoints.map((w, idx) => (
                          <div key={w.poiId} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-200">
                              <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{idx + 1}</span>
                              {w.name}
                              <button onClick={() => toggleWaypoint(w)} className="hover:text-blue-900 ml-1">×</button>
                          </div>
                      ))
                  )}
              </div>

              <div className="flex justify-end gap-3">
                  <button onClick={() => { setIsCustomMode(false); setSelectedWaypoints([]); }} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Fermer</button>
                  <button 
                    onClick={handleSaveCustomItinerary}
                    disabled={selectedWaypoints.length === 0 || calculating}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                      {calculating ? 'Calcul...' : 'Calculer cet Itinéraire'}
                  </button>
              </div>
          </div>
      )}

    </main>
  );
}