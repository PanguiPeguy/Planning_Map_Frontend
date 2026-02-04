'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { poiService } from "@/src/services/poiService";
import LoadingScreen from "@/src/components/layout/Loading";
import { ArrowLeft, Save, MapPin, Phone, Clock, DollarSign } from 'lucide-react';

export default function EditPOIPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    categoryId: '',
    phone: '',
    rating: 0,
    openingHours: '',
    services: '',
    priceRange: '',
    address: {
      street: '',
      city: '',
      town: '',
      postalCode: '',
      country: ''
    },
    metadata: ''
  });

  // Charger les données du POI et les catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories - CORRECTION ICI
        try {
          const categoriesResponse = await poiService.getCategories();
          console.log('Réponse catégories brute:', categoriesResponse);
          
          // Les catégories sont dans response.data.categories
          const categoriesData = categoriesResponse.data?.categories || [];
          
          console.log('Catégories extraites:', categoriesData);
          console.log('Type:', Array.isArray(categoriesData));
          console.log('Longueur:', categoriesData.length);
          
          setCategories(categoriesData);
        } catch (catError) {
          console.error('Erreur chargement catégories:', catError);
          setCategories([]);
        }
        
        // Charger le POI
        console.log('Chargement POI avec ID:', id);
        try {
          const poiResponse = await poiService.getById(id);
          console.log('Réponse POI:', poiResponse);
          const poi = poiResponse.data;
          
          setFormData({
            name: poi.name || '',
            description: poi.description || '',
            latitude: poi.latitude || 0,
            longitude: poi.longitude || 0,
            categoryId: poi.category?.categoryId || '',
            phone: poi.phone || '',
            rating: poi.rating || 0,
            openingHours: poi.openingHours || '',
            services: poi.services || '',
            priceRange: poi.priceRange || '',
            address: poi.address || {
              street: '',
              city: '',
              town: '',
              postalCode: '',
              country: ''
            },
            metadata: poi.metadata || ''
          });
        } catch (poiError) {
          console.error('Erreur chargement POI:', poiError);
          setError("Impossible de charger les données du POI");
        }
        
      } catch (err) {
        console.error('Erreur générale:', err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Reste du code inchangé...
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  // Pour la version simple sans carte interactive
  const handleLocationChange = (lat, lng) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const submissionData = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        rating: parseFloat(formData.rating),
        categoryId: parseInt(formData.categoryId),
        address: Object.values(formData.address).some(val => val) ? formData.address : null,
        openingHours: formData.openingHours || null,
        services: formData.services || null,
        priceRange: formData.priceRange || null,
        metadata: formData.metadata || null
      };
      
      console.log('Données envoyées:', submissionData);
      await poiService.update(id, submissionData);
      
      setSuccess(true);
      setTimeout(() => {
        router.push('/Admin/PoIList');
      }, 1500);
      
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du POI");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Modifier le POI</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/Admin/PoIList')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            POI mis à jour avec succès ! Redirection...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section Informations de base */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b">Informations de base</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du POI *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Ex: Restaurant Le Biniou"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loading ? 'Chargement des catégories...' : 'Aucune catégorie disponible'}
                    </option>
                  )}
                </select>
                {categories.length > 0 ? (
                  <p className="mt-1 text-xs text-gray-500">
                    {categories.length} catégories disponibles
                  </p>
                ) : !loading && (
                  <p className="mt-1 text-xs text-yellow-600">
                    Aucune catégorie chargée. Veuillez vérifier la connexion.
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Description détaillée du point d'intérêt..."
                />
              </div>
            </div>
          </div>

          {/* Section Localisation - Version simple */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b flex items-center gap-2">
              <MapPin size={20} />
              Localisation
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={20} className="text-blue-500" />
                    <span className="font-medium text-gray-700">Coordonnées GPS</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Modifiez les valeurs ci-dessus pour changer la position
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    📍 Voir sur Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section Adresse */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b">
              Adresse
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rue
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Numéro et nom de rue"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nom de la ville"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commune
                </label>
                <input
                  type="text"
                  name="town"
                  value={formData.address.town}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Commune ou quartier"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code postal
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.address.postalCode}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Code postal"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.address.country}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Pays"
                />
              </div>
            </div>
          </div>

          {/* Section Informations complémentaires */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b">
              Informations complémentaires
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="+237 XXX XXX XXX"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: Lun-Ven: 8h-18h, Sam: 9h-13h"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <DollarSign size={20} className="text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gamme de prix
                  </label>
                  <input
                    type="text"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Ex: €€ (moyen), €€€ (élevé)"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (0-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services disponibles
                </label>
                <textarea
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Liste des services séparés par des virgules (ex: WiFi, Parking, Climatisation)"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Métadonnées (JSON)
                </label>
                <textarea
                  name="metadata"
                  value={formData.metadata}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder='{"capacity": 50, "accessibility": true, "website": "https://..."}'
                />
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/Admin/PoIList')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Mise à jour en cours...' : 'Mettre à jour le POI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}