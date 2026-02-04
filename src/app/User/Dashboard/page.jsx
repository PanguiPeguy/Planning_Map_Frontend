"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { statisticsService } from "@/src/services/statisticsService";
import LoadingScreen from "@/src/components/layout/Loading";
import {
  UsersIcon,
  MapIcon,
  CalendarIcon,
  TagIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statisticsService.getCurrentUserStats();
        setStats(response.data || response);
      } catch (error) {
        console.error("Erreur stats admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="p-8 space-y-8 mt-16 " style={{ marginTop: "100px" }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Utilisateur
          </h1>
          <h2 className="text-xl text-gray-800">
            Bienvenue, {user?.username}
          </h2>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Système opérationnel
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-100 hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">POI Likés</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalLikedPois || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowTrendingUpIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <span>Mes mentions j'aime</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-purple-100 hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent uppercase tracking-wider">Favoris</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalFavoritedPois || 0}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <MapIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span>Points mis en favoris</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-100 hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent uppercase tracking-wider">Voyages planifiés</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalTrips || 0}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            <span>En hausse</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-green-100 hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent uppercase tracking-wider">Catégories</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{stats?.totalCategories || 0}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TagIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-400">
            <span>Types de lieux</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution par catégorie (Histogramme des favoris) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ChartPieIcon className="w-5 h-5 text-gray-400" />
            Catégories de mes Favoris
          </h3>
          <div className="space-y-6">
            {stats?.poisByCategory && Object.entries(stats.poisByCategory).map(([category, count], idx) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-gray-700">{category}</span>
                  <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-4 overflow-hidden border border-gray-50">
                  <div
                    className={`h-full rounded-r-lg transition-all duration-1000 ease-out shadow-inner ${['bg-gradient-to-r from-blue-400 to-blue-600', 'bg-gradient-to-r from-purple-400 to-purple-600', 'bg-gradient-to-r from-green-400 to-green-600', 'bg-gradient-to-r from-amber-400 to-amber-600', 'bg-gradient-to-r from-red-400 to-red-600'][idx % 5]}`}
                    style={{ width: `${stats.totalFavoritedPois > 0 ? (count / stats.totalFavoritedPois) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {(!stats?.poisByCategory || Object.keys(stats.poisByCategory).length === 0) && (
              <p className="text-gray-400 text-center py-8 italic border-2 border-dashed border-gray-50 rounded-xl">Vous n'avez pas encore de favoris</p>
            )}
          </div>
        </div>

        {/* Mes Top POIs Favoris */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
            Top Favoris (Les plus likés)
          </h3>
          <div className="space-y-4">
            {stats?.topPois && stats.topPois.map((poi, idx) => (
              <div key={poi.poiId} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition cursor-pointer border border-gray-50 hover:border-gray-100">
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 font-bold text-sm mr-4">
                  #{idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{poi.name}</h4>
                  <p className="text-xs text-gray-500">{poi.categoryName}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-500 text-sm flex items-center justify-end gap-1">
                    <span>★</span> {poi.rating}
                  </div>
                  <p className="text-xs text-gray-400">{poi.reviewCount} avis</p>
                </div>
              </div>
            ))}
            {(!stats?.topPois || stats.topPois.length === 0) && (
              <p className="text-gray-400 text-center py-8">Aucun top POI disponible</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}