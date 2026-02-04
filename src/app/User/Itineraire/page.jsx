"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import itineraryService from "@/src/services/itineraryService";
import authService from "@/src/services/authService";
import LoadingScreen from "@/src/components/layout/Loading";
import { Add, Directions, Delete, Edit } from "@mui/icons-material";

export default function MyItineraries() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth
    const currentUser = authService.getUser();
    if (!currentUser) {
      router.push("/Connexion");
      return;
    }
    setUser(currentUser);
    const userId = currentUser.id || currentUser.userId || currentUser.user_id;
    loadItineraries(userId);
  }, []);

  const loadItineraries = async (userId) => {
    try {
      const data = await itineraryService.getUserItineraries(userId);
      setItineraries(data || []);
    } catch (err) {
      console.error(err);
      alert("Erreur chargement itinéraires");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Supprimer cet itinéraire ?")) {
      try {
        await itineraryService.deleteItinerary(id);
        setItineraries(prev => prev.filter(i => i.id !== id));
      } catch (e) {
        alert("Erreur suppression");
      }
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="p-8 mt-16 max-w-7xl mx-auto min-h-screen">
       <div className="flex justify-between items-center mb-8">
         <div>
           <h1 className="text-3xl font-bold text-gray-800">Mes Itinéraires</h1>
           <p className="text-gray-500">Gérez vos modèles de trajets favoris</p>
         </div>
         <button 
           onClick={() => router.push("/User/Itineraire/create")}
           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
         >
           <Add /> Créer un itinéraire
         </button>
       </div>

       {itineraries.length === 0 ? (
         <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
            <Directions style={{ fontSize: 64 }} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">Aucun itinéraire enregistré</h3>
            <p className="text-gray-400 mt-2">Créez votre premier itinéraire personnalisé pour l'utiliser dans vos plannings.</p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map(itinerary => (
               <div key={itinerary.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-6 relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => handleDelete(itinerary.id)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"><Delete fontSize="small" /></button>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{itinerary.name}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4 gap-2">
                     <span className="font-medium text-gray-700">{itinerary.originLocation}</span>
                     <Directions fontSize="small" className="text-blue-500" />
                     <span className="font-medium text-gray-700">{itinerary.destinationLocation}</span>
                  </div>

                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50 text-sm">
                      <div className="text-gray-500">
                          {itinerary.distanceMeters ? (itinerary.distanceMeters / 1000).toFixed(1) + " km" : "-- km"}
                          <span className="mx-2">•</span>
                          {itinerary.durationSeconds ? Math.round(itinerary.durationSeconds / 60) + " min" : "-- min"}
                      </div>
                      {/* Placeholder for small map preview if desired */}
                  </div>
               </div>
            ))}
         </div>
       )}
    </main>
  );
}
