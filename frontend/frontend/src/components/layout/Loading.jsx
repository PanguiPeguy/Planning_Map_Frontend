// Loader Full Screen
export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-linear-to-r from-blue-700 via-blue-600 to-blue-500 flex flex-col items-center justify-center z-[9999]">
            
            {/* Icône Lucide */}
            <div className="animate-spin mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.364-6.364l-2.121 2.121M8.757 15.243l-2.121 2.121m12.728 0l-2.121-2.121M8.757 8.757L6.636 6.636" />
                </svg>
            </div>

            <p className="text-white text-lg tracking-wide">
                Loading...
            </p>
        </div>
    );
}
