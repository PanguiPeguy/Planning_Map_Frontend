"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { notificationService } from "@/src/services/notificationService";

import NotificationsActive from "@mui/icons-material/NotificationsActive";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import Badge from "@mui/material/Badge";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications seulement si un user existe
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response?.data ?? 0);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/Connexion");
  };

  return (
    <header
      className="fixed w-full h-20 shadow-md px-6 py-4 bg-linear-to-r from-blue-800 via-blue-700 to-blue-600 flex justify-between items-center text-white top-0 z-50"
      style={{ zIndex: 3 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link href="/">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-orange-400 via-yellow-300 to-amber-300 cursor-pointer">
            Planning Map
          </h1>
        </Link>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-5">
        {/* Profil */}
        <button
          onClick={() =>
            router.push(
              user?.role === "ADMIN" ? "/Admin/Profil" : "/User/Profil"
            )
          }
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-yellow-400 bg-gray-200 flex items-center justify-center hover:scale-105 transition"
          title="Profil"
        >
          {user?.profilePhotoUrl ? (
            <img
              src={user.profilePhotoUrl}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <PersonIcon className="text-blue-800" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() =>
            router.push(
              user?.role === "ADMIN"
                ? "/Admin/NotificationCenter"
                : "/User/NotificationCenter"
            )
          }
          className="hover:text-gray-200 transition cursor-pointer"
          title="Notifications"
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            invisible={unreadCount === 0}
          >
            <NotificationsActive fontSize="medium" />
          </Badge>
        </button>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="hover:text-gray-200 transition cursor-pointer"
          title="Se déconnecter"
        >
          <LogoutIcon fontSize="medium" />
        </button>
      </div>
    </header>
  );
}
