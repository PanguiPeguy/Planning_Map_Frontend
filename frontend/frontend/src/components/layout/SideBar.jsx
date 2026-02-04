"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Icons MUI
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from '@mui/icons-material/EventNote';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import PlaceIcon from '@mui/icons-material/Place';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MapIcon from '@mui/icons-material/Map';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import ListIcon from '@mui/icons-material/List';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Notifications from '@mui/icons-material/Notifications';

export default function SideBar({ isOpen, setIsOpen, role }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigate = (path) => router.push(path);

  const menuItems = {
    client: [
      { id: 'dashboard', icon: <DashboardIcon />, text: 'Dashboard', path: '/User/Dashboard' },
      {
        id: 'poi',
        icon: <PlaceIcon />,
        text: 'Mes POI',
        path: '/User/PoIList',
      },
      { id: 'planning', icon: <EventNoteIcon />, text: 'Planning', path: '/User/Planning' },
      { id: 'itineraire', icon: <AltRouteIcon />, text: 'Itinéraire', path: '/User/Itineraire' },
      { id: 'map', icon: <MapIcon />, text: 'Carte', path: '/User/Map' },
      { id: 'profil', icon: <PersonIcon />, text: 'Profil', path: '/User/Profil' },
      { id: 'notifications', icon: <Notifications />, text: 'Notifications', path: '/User/NotificationCenter'},
    ],

    admin: [
      { id: 'dashboard', icon: <DashboardIcon />, text: 'Dashboard', path: '/Admin/Dashboard' },
      {
        id: 'poi',
        icon: <PlaceIcon />,
        text: 'POI',
        hasSubMenu: true,
        subItems: [
          { id: 'add-poi', icon: <AddLocationIcon />, text: 'Ajouter un POI', path: '/Admin/ajouterPoI' },
          { id: 'poi-list', icon: <ListIcon />, text: 'Liste des POI', path: '/Admin/PoIList' },
        ]
      },

      {
        id: 'user',
        icon: <PersonIcon />,
        text: 'Liste des utilisateurs',
        path: '/Admin/UserList',
        
      },
      { id: 'map', icon: <MapIcon />, text: 'Carte', path: '/Admin/Map' },
      { id: 'profil', icon: <PersonIcon />, text: 'Profil', path: '/Admin/Profil' },
      { id: 'notifications', icon: <Notifications />, text: 'Notifications', path: '/Admin/NotificationCenter'},
    ],
  };

  const items = menuItems[role] || [];

  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    items.forEach((item) => {
      if (item.hasSubMenu) {
        const isChildActive = item.subItems.some((s) => pathname.startsWith(s.path));
        if (isChildActive) {
          setExpanded((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [pathname]);

  const toggleSubMenu = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const iconWrapper = "min-w-[40px] text-center text-2xl";

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-blue-600 text-white rounded-xl shadow-lg"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-20 left-0 bg-white shadow-xl border-r border-gray-200
          transition-all duration-300 z-40 h-[calc(100vh-80px)]
          ${isOpen ? "w-80" : "w-0 lg:w-24"}
          overflow-hidden
        `}
      >
        <nav className="pt-6 px-3 pb-10 overflow-y-auto h-full space-y-2">

          {items.map((item) => {
            const isActive = pathname === item.path;
            const isChildActive = item.hasSubMenu
              ? item.subItems.some((s) => pathname === s.path)
              : false;

            if (item.hasSubMenu) {
              return (
                <div key={item.id}>
                  <button
  onClick={() => toggleSubMenu(item.id)}
  className={`
    w-full flex items-center px-4 py-4 rounded-xl transition gap-3
    ${isChildActive ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-700"}
    ${!isOpen && "lg:justify-center"}
  `}
>
  <span className={iconWrapper}>{item.icon}</span>

  {isOpen && (
    <>
      <div className="flex-1 text-left font-medium">{item.text}</div>
      <div>{expanded[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}</div>
    </>
  )}
</button>


                  {isOpen && expanded[item.id] && (
                    <div className="ml-8 mt-2 space-y-2 border-l pl-4 border-gray-300">
                      {item.subItems.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => router.push(sub.path)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg
                            ${pathname === sub.path ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-600"}
                          `}
                        >
                          <span className="text-xl min-w-8.75 text-center">{sub.icon}</span>
                          <span className="text-sm">{sub.text}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-4 px-4 py-4 rounded-xl transition
                  ${isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"}
                  ${!isOpen && "lg:justify-center"}
                `}
              >
                <span className={iconWrapper}>{item.icon}</span>
                {isOpen && <span className="font-medium">{item.text}</span>}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 bg-white text-black rounded-full shadow-md"
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </aside>
    </>
  );
}
