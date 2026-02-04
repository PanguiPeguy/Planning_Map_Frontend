'use client';

import { useState , useEffect} from 'react';
import { useRouter } from 'next/navigation';
import PlaceAutocomplete from '@/src/components/common/PlaceAutocomplete'; 
import LoadingScreen from '@/src/components/layout/Loading';
import { poiService } from '@/src/services/poiService';

const AMENITIES = [
    'wifi', 'parking', 'outdoor_seating', 'wheelchair_accessible',
    'air_conditioning', 'takeout', 'delivery', 'reservations'
];

export default function CreatePOI() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [poiData, setPoiData] = useState({
        name: '',
        type: '',
        latitude: '',
        longitude: '',
        address: {
            street: '',
            city: '',
            postal_code: '',
            region: '',
            neighborhood: ''
        },
        contact: {
            phone: '',
            email: '',
            website: ''
        },
        opening_hours: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: ''
        },
        description: '',
        price_level: 1,
        tags: [],
        amenities: [],
        image: null
    });

    useEffect(() => {
    loadCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPoiData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setPoiData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

      const loadCategories = async () => {
    try {
      const response = await poiService.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Erreur lors du chargement des catégories');
    } finally {
      setLoadingCategories(false);
    }
  };

    const handlePlaceSelect = (place) => {
    setPoiData(prev => ({
      ...prev,
      address: place.display_name || place.address?.display_name || place.name,
      latitude: place.latitude || place.lat,
      longitude: place.longitude || place.lon,
      // On peut aussi pré-remplir le nom si vide
      name: prev.name || place.name.split(',')[0]
    }));
  };

    const handleAmenityChange = (amenity) => {
        setPoiData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
            ? prev.amenities.filter(a => a !== amenity)
            : [...prev.amenities, amenity]
        }));
    };

    const handleTagsChange = (e) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        setPoiData(prev => ({ ...prev, tags }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPoiData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Création du FormData
            const formData = new FormData();

            for (let key in poiData) {
                if (key !== "image") {
                    formData.append(
                        key,
                        typeof poiData[key] === "object"
                            ? JSON.stringify(poiData[key])
                            : poiData[key]
                    );
                }
            }

            // Ajouter l'image si présente
            if (poiData.image) {
                formData.append("image", poiData.image);
            }

            // Envoi de la requête
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/v1/pois', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Pas de Content-Type ici, le navigateur le mettra automatiquement avec le boundary pour FormData
                },
                body: formData
            });

            if (response.ok) {
                // Redirection vers la liste des POI
                router.push('/Admin/PoIList');
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Erreur backend:', errorData);
                throw new Error(errorData.message || 'Erreur lors de la création');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert(`Erreur lors de la création du POI: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (loadingCategories) {
    return <LoadingScreen />;
  }

    return (
        
        <div className="min-h-screen bg-gray-50 py-8 mt-15">
            <div className="max-w-4xl mx-auto px-4"> 
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-blue-800 mb-6">
                        Créer un nouveau Point d'Intérêt
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-8">

                        <Section title="Image du POI">
                            <div>
                                <Label htmlFor="image">Ajouter une image <span className='text-red-500'>*</span></Label>
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-700 
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                    required
                                />
                            </div>

                            {/* Aperçu */}
                            {poiData.image && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                                    <img
                                        src={URL.createObjectURL(poiData.image)}
                                        alt="Prévisualisation"
                                        className="h-32 w-32 object-cover rounded-md border"
                                    />
                                </div>
                            )}
                        </Section>

        
                            {/* Section Informations de Base */}
                        <Section title="Informations de Base">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nom du POI <span className='text-red-500'>*</span></Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={poiData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                <Label htmlFor="categoryId">
                                  Catégorie <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  style={{ height: '50px' }} // Fix CSS
                                  id="categoryId"
                                  name="categoryId"
                                  value={poiData.categoryId}
                                  onChange={handleInputChange}
                                  required
                                >
                                  <option value="">Sélectionnez une catégorie</option>
                                  {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>
                                      {cat.name}
                                    </option>
                                  ))}
                                </Select>
                            </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <TextArea
                                    id="description"
                                    name="description"
                                    value={poiData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>
                        </Section> 

                        {/* Localisation */}
                        <Section title="Localisation">
                          {/* Autocomplete Search */}
                          <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-semibold text-blue-800 mb-2">Rechercher une adresse (Remplissage auto)</h3>
                            <PlaceAutocomplete 
                              label=""
                              onSelect={handlePlaceSelect}
                              value={poiData.address}
                            />
                            <p className="text-xs text-blue-600 mt-2">
                              💡 Sélectionnez une adresse dans la liste pour remplir automatiquement les coordonnées.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="latitude">
                                Latitude <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="latitude"
                                name="latitude"
                                type="number"
                                step="any"
                                value={poiData.latitude}
                                onChange={handleInputChange}
                                placeholder="Ex: 3.8480"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="longitude">
                                Longitude <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="longitude"
                                name="longitude"
                                type="number"
                                step="any"
                                value={poiData.longitude}
                                onChange={handleInputChange}
                                placeholder="Ex: 11.5021"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address">Adresse complète</Label>
                            <Input
                              id="address"
                              name="address"
                              value={poiData.address}
                              onChange={handleInputChange}
                              placeholder="Ex: Avenue de la Réunification, Yaoundé"
                            />
                          </div>
                        </Section>

                        {/* Section Contact */}
                        <Section title="Informations de Contact">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="contact.phone">Téléphone</Label>
                                    <Input
                                        id="contact.phone"
                                        name="contact.phone"
                                        type="phone"
                                        value={poiData.contact.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact.email">Email</Label>
                                    <Input
                                        id="contact.email"
                                        name="contact.email"
                                        type="email"
                                        value={poiData.contact.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contact.website">Site web</Label>
                                    <Input
                                        id="contact.website"
                                        name="contact.website"
                                        type="url"
                                        value={poiData.contact.website}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </Section>

                        {/* Section Heures d'Ouverture */}
                        <Section title="Heures d'Ouverture">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {Object.entries(poiData.opening_hours).map(([day, hours]) => (
                                    <div key={day}>
                                        <Label htmlFor={`opening_hours.${day}`}>
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </Label>
                                        <Input
                                            id={`opening_hours.${day}`}
                                            name={`opening_hours.${day}`}
                                            value={hours}
                                            onChange={handleInputChange}
                                            placeholder="ex: 09:00-18:00"
                                        />
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Section Attributs */}
                        <Section title="Attributs et Équipements">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="price_level">Niveau de prix (1-4)</Label>
                                    <Select
                                        id="price_level"
                                        name="price_level"
                                        value={poiData.price_level}
                                        onChange={handleInputChange}
                                    >
                                        <option value={1}>€ (Économique)</option>
                                        <option value={2}>€€ (Moyen)</option>
                                        <option value={3}>€€€ (Élevé)</option>
                                        <option value={4}>€€€€ (Luxe)</option>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="tags">Étiquettes (séparées par des virgules)</Label>
                                    <Input
                                        id="tags"
                                        name="tags"
                                        value={poiData.tags.join(', ')}
                                        onChange={handleTagsChange}
                                        placeholder="ex: romantique, terrasse, vue"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Équipements et Services</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                    {AMENITIES.map(amenity => (
                                        <label key={amenity} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={poiData.amenities.includes(amenity)}
                                                onChange={() => handleAmenityChange(amenity)}
                                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />                                                <span className="text-sm text-gray-700">
                                                {amenity.replace('_', ' ')}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* Boutons de soumission */}
                        <div className="flex justify-end space-x-4 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 border border-red-500 rounded-md text-red-500 hover:bg-gray-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Création...' : 'Créer le POI'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
            
        
    );
}

// Composants réutilisables
function Section({ title, children }) {
    return (
        <div className="border-b border-gray-200 pb-6">
<h2 className="text-lg font-semibold bg-clip-text text-transparent bg-linear-to-r from-orange-400 via-yellow-300 to-amber-300 mb-4">
    {title}
</h2>        {children}
        </div>
    );
}

function Label({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
            {children}
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
    );
}

function Select(props) {
    return (
        <select
            {...props}
            className="w-full border bg-gray-100 border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
    );
}

function TextArea(props) {
    return (
        <textarea
            {...props}
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
    );
}