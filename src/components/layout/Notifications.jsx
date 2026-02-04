"use client";

import { useState, useEffect } from "react";
import { notificationService } from "@/src/services/notificationService";
import { Bell, Check, Trash2, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import LoadingScreen from "./Loading";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAll();
      setNotifications(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
      setError("Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      // Mise à jour optimiste immédiate
      setNotifications(notifications.map(n =>
        n.notificationId === id ? { ...n, isRead: true } : n
      ));
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("Erreur marquage comme lu:", err);
      // En cas d'erreur, recharger les notifications
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mise à jour optimiste immédiate
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Erreur marquage tout comme lu:", err);
      fetchNotifications();
    }
  };

  const handleDelete = async (id) => {
    try {
      // Mise à jour optimiste immédiate
      setNotifications(notifications.filter(n => n.notificationId !== id));
      await notificationService.delete(id);
    } catch (err) {
      console.error("Erreur suppression notification:", err);
      fetchNotifications();
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (error) return (
    <div className="bg-red-50 p-6 rounded-xl text-center">
      <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
      <p className="text-red-700 font-medium">{error}</p>
      <button
        onClick={fetchNotifications}
        className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-blue-500" size={20} />
          Centre de notifications
        </h2>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition"
          >
            <CheckCircle2 size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100 max-h-150 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-500 font-medium">Vous n'avez aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.notificationId}
              className={`p-6 transition-all hover:bg-gray-50/50 flex gap-4 ${!notif.isRead ? "bg-blue-50/30 border-l-4 border-blue-500" : ""}`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${!notif.isRead ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                <Bell size={24} />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold ${!notif.isRead ? "text-gray-900" : "text-gray-600"}`}>
                    {notif.title || "Notification"}
                  </h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${!notif.isRead ? "text-gray-700" : "text-gray-500"}`}>
                  {notif.message}
                </p>

                <div className="mt-4 flex gap-3">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.notificationId)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.notificationId)}
                    className="text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

