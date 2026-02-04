export const POI_TYPES = [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hôtel' },
    { value: 'cafe', label: 'Café' },
    { value: 'museum', label: 'Musée' },
    { value: 'park', label: 'Parc' },
    { value: 'shop', label: 'Magasin' },
    { value: 'gas_station', label: 'Station-service' },
    { value: 'hospital', label: 'Hôpital' },
    { value: 'school', label: 'École' },
    { value: 'bank', label: 'Banque' },
    { value: 'pharmacy', label: 'Pharmacie' },
    { value: 'other', label: 'Autre' }
];

export const TRIP_STATUS = {
    DRAFT: 'Brouillon',
    PLANNED: 'Planifié',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé'
};

export const MEMBER_ROLES = {
    OWNER: 'Propriétaire',
    EDITOR: 'Éditeur',
    VIEWER: 'Lecteur'
};

export const AMENITIES = [
    'wifi', 'parking', 'outdoor_seating', 'wheelchair_accessible',
    'air_conditioning', 'takeout', 'delivery', 'reservations'
];