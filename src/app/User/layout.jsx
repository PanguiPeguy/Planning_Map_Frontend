"use client";
import { useState } from "react";
import SideBar from "@/src/components/layout/SideBar";
import Header from "@/src/components/layout/Header";
import { AuthProvider } from "@/src/contexts/AuthContext";

export default function Layout({ children }) {
    const [isOpen, setIsOpen] = useState(true); // largeur sidebar

    return (
        <div className="min-h-screen flex flex-col">
            <Header notificationBasePath="/User"/>
            <div className="flex flex-1">
                <SideBar isOpen={isOpen} setIsOpen={setIsOpen} role="client"/>
                <main
                    className={`transition-all duration-300 w-full ${
                        isOpen ? "ml-76" : "ml-20"
                    }`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
