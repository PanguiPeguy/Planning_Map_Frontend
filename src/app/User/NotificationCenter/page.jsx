import Notifications from "@/src/components/layout/Notifications";

export default function UserNotificationCenter() {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">
                Mes notifications
            </h1>
            <Notifications />
        </div>
    );
}