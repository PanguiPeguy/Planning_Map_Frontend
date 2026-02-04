"use client";

import Notifications from "@/src/components/layout/Notifications";

export default function NotificationsPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Mes Notifications
                    </span>
                </h1>
                <Notifications />
            </div>
        </div>
    );
}
