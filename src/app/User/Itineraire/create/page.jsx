"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import itineraryService from "@/src/services/itineraryService";
import authService from "@/src/services/authService";
import { routingService } from "@/src/services/routingService";
import poiService from "@/src/services/poiService";
import { ArrowBack, Save, Map as MapIcon, Place, PlayArrow, Delete } from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix icons
const icon = L.icon({ iconUrl: "/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] });
const poiIcon = L.icon({ 
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", 
    iconSize: [24, 24], 
    iconAnchor: [12, 12] 
});
const selectedPoiIcon = L.icon({ 
    iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png", 
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Component to handle map clicks for adding waypoints
function MapClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => {
           onMapClick(e.latlng);
        },
    });
    return null;
}

// Dynamic POI Loader
function DynamicPoiMarkers({ onPoiSelect, selectedWaypointIds = [] }) {
  const map = useMap();
  const [pois, setPois] = useState([]);

  const fetchPois = async () => {
     try {
       console.log("Loading ALL POIs for Itinerary map...");
       const allPois = await poiService.getAllPaginated({}, 50);
       setPois(allPois);
     } catch(e) { console.error(e); }
  };

  useEffect(() => {
      fetchPois();
  }, []);

  // On retire les écouteurs moveend/zoomend pour garder tous les POIs affichés

  return (
      <>
        {pois.map(p => {
            const isSelected = selectedWaypointIds.includes(p.poiId);
            return (
                <Marker 
                  key={p.poiId} 
                  position={[p.latitude, p.longitude]} 
                  icon={isSelected ? selectedPoiIcon : poiIcon}
                  eventHandlers={{
                      click: () => onPoiSelect && onPoiSelect(p)
                  }}
                >
                    <Popup>
                        <div className="p-2">
                            <b className="text-blue-600">{p.name}</b><br/>
                            <span className="text-xs text-gray-500">{p.description}</span>
                            <div className="mt-2 pt-2 border-t">
                                <button 
                                  onClick={() => onPoiSelect && onPoiSelect(p)}
                                  className={`text-[10px] w-full py-1 rounded-full border transition ${
                                    isSelected ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                                  }`}
                                >
                                    {isSelected ? 'Retirer des étapes' : 'Ajouter comme étape'}
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

const decodePolyline = (encoded) => {
    if (!encoded) return [];
    if (Array.isArray(encoded)) return encoded;
    if (typeof encoded !== 'string') return [];
    try {
        if (encoded.startsWith("[")) {
            // Sanitize: remove spaces (thousands separator)
            const sanitized = encoded.replace(/\s/g, '');
            const parsed = JSON.parse(sanitized);
            if (!Array.isArray(parsed)) return [];
            
            // Handle cases where comma was used as decimal separator: [[lat_int, lat_dec, lng_int, lng_dec], ...]
            return parsed.map(point => {
                if (Array.isArray(point) && point.length === 4) {
                    const lat = parseFloat(`${point[0]}.${point[1]}`);
                    const lng = parseFloat(`${point[2]}.${point[3]}`);
                    return [lat, lng];
                }
                return point;
            });
        }
    } catch(e) {
        console.error("Polyline parse error:", e);
    }
    return [];
};

function MapBoundsController({ routeGeom }) {
    const map = useMap();
    useEffect(() => {
        if (!routeGeom) return;
        const pts = decodePolyline(routeGeom);
        if (pts.length > 0) {
            const bounds = L.latLngBounds(pts);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [routeGeom, map]);
    return null;
}

export default function CreateItinerary() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState(""); 
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [waypoints, setWaypoints] = useState([]); 
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleCalculateRoute = async () => {
      if (!originCoords || !destCoords) {
          alert("Veuillez sélectionner un point de départ et d'arrivée sur la carte.");
          return;
      }

      setCalculating(true);
      try {
          const waypointIds = waypoints.filter(wp => wp.poiId).map(wp => wp.poiId);
          const response = await routingService.calculate({
              startLatitude: originCoords.lat,
              startLongitude: originCoords.lng,
              endLatitude: destCoords.lat,
              endLongitude: destCoords.lng,
              waypointPoiIds: waypointIds
          });

          if (response.data && response.data.found) {
              setCalculatedRoute(response.data.customRoute || response.data.optimalRoute);
          } else {
              alert("Aucun itinéraire trouvé.");
          }
      } catch (e) {
          console.error(e);
          alert("Erreur lors du calcul de l'itinéraire.");
      } finally {
          setCalculating(false);
      }
  };

  const handleSave = async () => {
     if(!name) return alert("Nom requis");
     if(!calculatedRoute) return alert("Veuillez calculer l'itinéraire avant d'enregistrer.");
     
     setSaving(true);
     try {
       const user = authService.getUser();
       const userId = user?.id || user?.userId || user?.user_id;
       
       await itineraryService.createItinerary({
          userId: userId,
          name,
          originLocation: origin || "Départ personnalisé",
          destinationLocation: destination || "Arrivée personnalisée",
          waypointsJson: JSON.stringify(waypoints),
          geometryEncoded: calculatedRoute.geometryEncoded,
          distanceMeters: calculatedRoute.totalDistanceKm * 1000,
          durationSeconds: calculatedRoute.totalTimeSeconds
       });
       alert("Itinéraire sauvegardé !");
       router.push("/User/Itineraire");
     } catch(e) {
       console.error(e);
       alert("Erreur lors de la sauvegarde.");
     } finally {
       setSaving(false);
     }
  };

  const togglePoiWaypoint = (poi) => {
      if (waypoints.find(w => w.poiId === poi.poiId)) {
          setWaypoints(prev => prev.filter(w => w.poiId !== poi.poiId));
      } else {
          setWaypoints(prev => [...prev, { ...poi, lat: poi.latitude, lng: poi.longitude, id: poi.poiId }]);
      }
      setCalculatedRoute(null); // Reset route when points change
  };

  const handleMapClick = (latlng) => {
      if (!originCoords) {
          setOriginCoords(latlng);
          setOrigin(`Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
      } else if (!destCoords) {
          setDestCoords(latlng);
          setDestination(`Point (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
      } else {
          // Add custom waypoint if already have origin/dest? 
          // Or user must use POIs. Let's allow custom waypoints too.
          const newWp = { 
              lat: latlng.lat, 
              lng: latlng.lng, 
              id: Date.now(),
              name: `Étape ${waypoints.length + 1}` 
          };
          setWaypoints([...waypoints, newWp]);
      }
      setCalculatedRoute(null);
  };

  return (
    <main className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ marginTop: "64px" }}>
       
       {/* Sidebar Control */}
       <aside className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10 p-6 overflow-y-auto">
          <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-black">
             <ArrowBack className="mr-2" /> Annuler
          </button>

          <h2 className="text-2xl font-bold mb-6">Nouvel Itinéraire</h2>

          <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'itinéraire</label>
                <input 
                   type="text" 
                   value={name} 
                   onChange={(e) => setName(e.target.value)}
                   className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                   placeholder="Ex: Route Express Douala"
                />
             </div>

             <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Départ (Cliquez sur la carte)</label>
                    <input type="text" readOnly value={origin} className="w-full p-3 border rounded-lg bg-gray-50 text-sm" placeholder="En attente de clic..." />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrivée (Cliquez sur la carte)</label>
                    <input type="text" readOnly value={destination} className="w-full p-3 border rounded-lg bg-gray-50 text-sm" placeholder="En attente de clic..." />
                </div>
             </div>

             <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <Place fontSize="small" /> Étapes ({waypoints.length})
                    </h3>
                    {(originCoords || destCoords) && (
                        <button 
                            onClick={() => { setOriginCoords(null); setDestCoords(null); setWaypoints([]); setOrigin(""); setDestination(""); setCalculatedRoute(null); }}
                            className="text-xs text-red-500 font-bold hover:underline"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mb-3">Utilisez les POI sur la carte ou cliquez pour ajouter des étapes.</p>
                
                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                   {waypoints.map((wp, idx) => (
                      <li key={wp.id} className="text-sm bg-gray-50 p-2 rounded flex justify-between items-center border border-gray-100">
                         <span className="flex items-center gap-2">
                             <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{idx + 1}</span>
                             {wp.name}
                         </span>
                         <button 
                           onClick={() => { setWaypoints(waypoints.filter(w => w.id !== wp.id)); setCalculatedRoute(null); }}
                           className="text-gray-400 hover:text-red-500"
                         >
                            <Delete fontSize="inherit" />
                         </button>
                      </li>
                   ))}
                </ul>
             </div>

             {calculatedRoute && (
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4 animate-in fade-in slide-in-from-bottom duration-300">
                     <div className="flex justify-between items-center text-sm font-bold text-blue-800 mb-1">
                         <span>Récapitulatif</span>
                         <span>{(calculatedRoute.totalDistanceKm).toFixed(1)} km</span>
                     </div>
                     <div className="text-xs text-blue-600">
                         Temps estimé: {Math.round(calculatedRoute.totalTimeSeconds / 60)} min
                     </div>
                 </div>
             )}

             <div className="grid grid-cols-1 gap-3 mt-6">
                <button 
                    onClick={handleCalculateRoute}
                    disabled={calculating || !originCoords || !destCoords}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md flex justify-center items-center gap-2 transition disabled:opacity-50"
                >
                    <PlayArrow /> {calculating ? "Calcul..." : "Calculer l'Aperçu"}
                </button>

                <button 
                    onClick={handleSave}
                    disabled={saving || !calculatedRoute}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md flex justify-center items-center gap-2 transition disabled:opacity-50"
                >
                    <Save /> {saving ? "Enregistrement..." : "Enregistrer Itinéraire"}
                </button>
             </div>
          </div>
       </aside>

       {/* Map Space */}
       <div className="flex-1 bg-gray-100 relative">
          <MapContainer center={[3.86, 11.51]} zoom={7} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                  attribution='&copy; OSM'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              <DynamicPoiMarkers 
                  onPoiSelect={togglePoiWaypoint} 
                  selectedWaypointIds={waypoints.map(w => w.poiId).filter(Boolean)}
              />

              {originCoords && (
                 <Marker position={[originCoords.lat, originCoords.lng]} icon={L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
                    <Popup>Départ</Popup>
                 </Marker>
              )}
              {destCoords && (
                 <Marker position={[destCoords.lat, destCoords.lng]} icon={L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
                    <Popup>Arrivée</Popup>
                 </Marker>
              )}
              
              {waypoints.map((wp) => !wp.poiId && (
                 <Marker key={wp.id} position={[wp.lat, wp.lng]} icon={L.icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
                    <Popup>{wp.name}</Popup>
                 </Marker>
              ))}

              {calculatedRoute && (
                  <>
                    <MapBoundsController routeGeom={calculatedRoute.geometryEncoded} />
                    <Polyline 
                        positions={decodePolyline(calculatedRoute.geometryEncoded) || []}
                        pathOptions={{ color: '#3b82f6', weight: 8, opacity: 0.8 }}
                    />
                  </>
              )}
          </MapContainer>
          
          <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-xl z-[1000] text-sm max-w-xs border-l-4 border-blue-600">
             <span className="font-bold block mb-2 text-gray-800">Mode Construction</span>
             {!originCoords ? "1. Cliquez pour définir le DÉPART" : 
              !destCoords ? "2. Cliquez pour définir l'ARRIVÉE" : 
              "3. Sélectionnez des POI ou cliquez pour ajouter des ÉTAPES, puis calculez."}
          </div>
       </div>

    </main>
  );
}
