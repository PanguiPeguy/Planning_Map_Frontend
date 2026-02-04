
// Formater distance (ex: 245.8 km)
export const formatDistance = (km) => {
  if (!km) return '0 km';
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
};

// Formater durée (ex: 2h 30min)
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

// Formater date (ex: 15 janvier 2025)
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

// Formater datetime (ex: 15 jan 2025, 14:30)
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Temps relatif (ex: "il y a 2 heures")
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'à l\'instant';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)}j`;
  
  return formatDate(dateString);
};

// Formater prix (ex: €€€)
export const formatPriceRange = (level) => {
  if (!level) return '-';
  return '€'.repeat(level);
};

// Formater téléphone (ex: +237 6 XX XX XX XX)
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Format: +237 X XX XX XX XX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  return phone;
};

// Badge couleur statut voyage
export const getTripStatusColor = (status) => {
  const colors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PLANNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700'
  };
  return colors[status] || colors.DRAFT;
};

// Traduction statut voyage
export const translateTripStatus = (status) => {
  const translations = {
    DRAFT: 'Brouillon',
    PLANNED: 'Planifié',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé'
  };
  return translations[status] || status;
};

// Traduction rôle membre
export const translateMemberRole = (role) => {
  const translations = {
    OWNER: 'Propriétaire',
    EDITOR: 'Éditeur',
    VIEWER: 'Lecteur'
  };
  return translations[role] || role;
};

// Badge couleur rôle
export const getMemberRoleColor = (role) => {
  const colors = {
    OWNER: 'bg-purple-100 text-purple-700',
    EDITOR: 'bg-blue-100 text-blue-700',
    VIEWER: 'bg-gray-100 text-gray-700'
  };
  return colors[role] || colors.VIEWER;
};