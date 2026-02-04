'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/src/components/layout/Loading";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import DownloadIcon from '@mui/icons-material/Download';
import { ArrowRightAlt } from "@mui/icons-material";
import planningService from "@/src/services/planningService";

export default function ImporterPlanning() {

    const router = useRouter();

    const [plannings, setPlannings] = useState([]);
    const [importedNames, setImportedNames] = useState([]);
    const [loading, setLoading] = useState(true);

    const [downloadingId, setDownloadingId] = useState(null);
    const [progress, setProgress] = useState(0);

    // 🔹 Chargement initial
    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [external, local] = await Promise.all([
                    planningService.getExternalPlannings(),
                    planningService.getLocalPlannings()
                ]);
                setPlannings(external);
                setImportedNames(local.map(p => p.name));
            } catch (err) {
                console.error("Erreur chargement plannings:", err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    // 🔹 Téléchargement/Importation
    const downloadPlanning = async (planning) => {
        try {
            setDownloadingId(planning.externalId);
            setProgress(30);

            await planningService.importPlanning(planning.externalId, planning.name);

            setProgress(100);

            // Mise à jour UI
            setImportedNames(prev => [...prev, planning.name]);
            setTimeout(() => setDownloadingId(null), 500);

        } catch (err) {
            console.error("Erreur import:", err);
            alert("Erreur lors de l'importation du planning");
            setDownloadingId(null);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <main className="p-6 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-blue-800">
                Importer un planning
            </h1>

            {plannings.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[60vh] text-amber-400">
                    <EventBusyIcon sx={{ fontSize: 140 }} />
                    <p className="mt-3 text-lg text-amber-500">
                        Aucun nouveau planning disponible
                    </p>
                    <button
                        onClick={() => router.push("/User/Planning")}
                        className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                    >
                        Retour au planning
                    </button>
                </div>
            )}

            <ul className="space-y-5">
                {plannings.map(planning => {
                    const isImported = importedNames.includes(planning.name);
                    const isDownloading = downloadingId === planning.externalId;

                    return (
                        <li
                            key={planning.externalId}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">

                                {/* GAUCHE */}
                                <div className="flex flex-col gap-2">
                                    <h2 className="font-bold text-2xl text-gray-900">
                                        <span className="text-blue-700">
                                            {planning.name}
                                        </span>
                                    </h2>

                                    <p className="text-sm text-gray-600 italic">
                                        {planning.description}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        ID Externe :
                                        <span className="ml-1 text-gray-700 font-medium font-mono">
                                            {planning.externalId.substring(0, 8)}...
                                        </span>
                                    </p>
                                </div>

                                {/* DROITE : ACTION */}
                                <div className="w-48 text-right shrink-0">

                                    {isImported ? (
                                        <span className="text-green-600 font-semibold px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                                            ✔ Déjà importé
                                        </span>
                                    ) : isDownloading ? (
                                        <div className="text-sm text-blue-700">
                                            Téléchargement… {progress}%
                                            <div className="h-2 bg-gray-200 rounded mt-2">
                                                <div
                                                    className="h-2 bg-blue-700 rounded transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => downloadPlanning(planning)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
                                        >
                                            <DownloadIcon />
                                            Télécharger
                                        </button>
                                    )}

                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </main>
    );
}
