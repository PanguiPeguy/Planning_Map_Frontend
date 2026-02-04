"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import planningService from "@/src/services/planningService";
import LoadingScreen from "@/src/components/layout/Loading";
import { CalendarToday, Place, ArrowForward, Map } from "@mui/icons-material";

export default function Planning() {
  const router = useRouter();
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await planningService.getLocalPlannings();
      setPlannings(data || []);
    } catch (err) {
      console.error("Error loading plannings:", err);
      // setError("Erreur lors du chargement des plannings");
      // Fallback empty array if API fails or returns null
      setPlannings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportTrip = () => {
    router.push(`/User/importerPlanning`);
  };

  const handleViewDetails = (planningId) => {
    router.push(`/User/Planning/${planningId}`);
  };

  const handleDeleteTrip = async (e, planningId) => {
    e.stopPropagation();
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce planning ?")) {
      return;
    }

    try {
      // Implement delete in service if needed
      // await planningService.delete(planningId);
      // setPlannings(plannings.filter(p => p.id !== planningId));
      alert("Suppression non implémentée pour le moment");
    } catch (err) {
      console.error("Error deleting planning:", err);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6" style={{ marginTop: "100px" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Plannings</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos itinéraires importés et optimisés
          </p>
        </div>
        <button
          onClick={handleImportTrip}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Importer un planning
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Plannings Grid */}
      {plannings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="mb-6">
            <CalendarToday className="text-gray-300 transform scale-150" style={{ fontSize: 60 }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucun planning pour le moment
          </h3>
          <p className="text-gray-500 mb-6">
            Importez un planning externe pour commencer l'optimisation
          </p>
          <button
            onClick={handleImportTrip}
            className="text-blue-600 font-medium hover:underline"
          >
            Aller vers l'importation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plannings.map((planning) => (
            <div
              key={planning.id}
              onClick={() => handleViewDetails(planning.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                  <Map className="text-blue-600" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  planning.status === 'FINALIZED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {planning.status === 'FINALIZED' ? 'Finalisé' : 'Brouillon'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                {planning.name}
              </h3>

              <div className="flex items-center text-gray-500 text-sm mb-4">
                <CalendarToday fontSize="small" className="mr-2" />
                <span>Créé le {new Date(planning.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-blue-600 font-medium text-sm">
                <span>Voir les détails</span>
                <ArrowForward fontSize="small" className="transform group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

