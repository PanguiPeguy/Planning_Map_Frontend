"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { notificationService } from "@/src/services/notificationService";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Charger les notifications initialement et configurer le polling
    useEffect(() => {
        if (isAuthenticated()) {
            fetchData();
            const interval = setInterval(() => {
                fetchUnreadCount();
            }, 30000); // Polling toutes les 30s pour le compteur
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [notifsRes, countRes] = await Promise.all([
                notificationService.getAll(),
                notificationService.getUnreadCount()
            ]);
            setNotifications(notifsRes.data || []);
            setUnreadCount(countRes.data || 0);
        } catch (error) {
            console.error("Erreur chargement notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.data || 0);
        } catch (error) {
            console.error("Erreur chargement compteur:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            // Optimiste
            const wasUnread = notifications.find(n => n.notificationId === id && !n.isRead);
            setNotifications(prev => prev.map(n =>
                n.notificationId === id ? { ...n, isRead: true } : n
            ));
            if (wasUnread) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            await notificationService.markAsRead(id);
        } catch (error) {
            console.error("Erreur markAsRead:", error);
            fetchData(); // Revert on error
        }
    };

    const markAllAsRead = async () => {
        try {
            // Optimiste
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            await notificationService.markAllAsRead();
        } catch (error) {
            console.error("Erreur markAllAsRead:", error);
            fetchData();
        }
    };

    const deleteNotification = async (id) => {
        try {
            // Optimiste
            const notif = notifications.find(n => n.notificationId === id);
            setNotifications(prev => prev.filter(n => n.notificationId !== id));
            if (notif && !notif.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            await notificationService.delete(id);
        } catch (error) {
            console.error("Erreur deleteNotification:", error);
            fetchData();
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refresh: fetchData
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => useContext(NotificationContext);
