"use client";

/**
 * Route Panel Component
 * Displays route instructions, segments, and statistics
 */
export default function RoutePanel({ route, onClose }) {
  if (!route || !route.found) {
    return null;
  }

  const { segments, totalDistanceKm, totalTimeSeconds, statistics, formattedTime } = route;

  // Format duration to hours and minutes
  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gradient">Itinéraire</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-primary text-white rounded-lg p-4 hover-lift">
          <div className="text-sm opacity-90">Distance totale</div>
          <div className="text-2xl font-bold">{totalDistanceKm?.toFixed(1) || 0} km</div>
        </div>
        <div className="bg-gradient-dark text-white rounded-lg p-4 hover-lift">
          <div className="text-sm opacity-90">Durée estimée</div>
          <div className="text-2xl font-bold">{formattedTime || formatDuration(totalTimeSeconds)}</div>
        </div>
      </div>

      {/* Segments List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700 mb-3">Instructions</h3>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {segments && segments.map((segment, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border-l-4 border-blue-500"
            >
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              {/* Instruction */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {segment.instruction || segment.streetName || `Segment ${index + 1}`}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {segment.distanceKm ? `${segment.distanceKm.toFixed(2)} km` : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(segment.timeSeconds)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Details (if available) */}
      {statistics && (
        <div className="pt-4 border-t border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-2">Statistiques</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {statistics.computationTimeMs && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Temps de calcul</div>
                <div className="font-semibold">{statistics.computationTimeMs} ms</div>
              </div>
            )}
            {statistics.nodesExplored && (
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Nœuds explorés</div>
                <div className="font-semibold">{statistics.nodesExplored}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
