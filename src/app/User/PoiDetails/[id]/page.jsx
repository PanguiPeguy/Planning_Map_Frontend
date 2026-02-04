'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { poiService } from "@/src/services/poiService";
import { getImageURL } from "@/src/services/api";
import LoadingScreen from "@/src/components/layout/Loading";
import { MapPin, Phone, Globe, Clock, Star, Tag, ArrowLeft, Edit, Trash2, Navigation, Mail, Map, Heart, Bookmark, MessageCircle, X } from 'lucide-react';
import dynamic from 'next/dynamic';

// Carte dynamique pour éviter les problèmes SSR
const DynamicMap = dynamic(() => import('@/src/components/Map/PositionMap'), {
    ssr: false,
    loading: () => <div className="w-full h-96 bg-gray-200 animate-pulse rounded-xl"></div>
});

export default function POIDetails() {
    const params = useParams();
    const router = useRouter();
    const poiId = params?.id;

    const [poi, setPoi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    // Charger le POI
    useEffect(() => {
        const loadPoi = async () => {
            if (!poiId) return;

            try {
                setLoading(true);
                const response = await poiService.getById(poiId);
                setPoi(response.data);
                setError(null);

                // Charger les avis
                loadReviews();
            } catch (err) {
                console.error('Erreur chargement POI:', err);
                setError(err.response?.data?.message || "Impossible de charger les détails du point d'intérêt");
            } finally {
                setLoading(false);
            }
        };

        loadPoi();
    }, [poiId]);

    // Charger les avis
    const loadReviews = async () => {
        if (!poiId) return;
        try {
            setLoadingReviews(true);
            const response = await poiService.getReviews(poiId);
            setReviews(response.data || []);
        } catch (err) {
            console.error('Erreur chargement avis:', err);
        } finally {
            setLoadingReviews(false);
        }
    };

    // Like/Unlike POI
    const handleLike = async () => {
        if (!poi) return;

        // UI optimiste
        const newIsLiked = !poi.isLiked;
        setPoi({
            ...poi,
            isLiked: newIsLiked,
            likeCount: newIsLiked ? (poi.likeCount || 0) + 1 : Math.max((poi.likeCount || 0) - 1, 0)
        });

        try {
            if (poi.isLiked) {
                await poiService.unlikePoi(poiId);
            } else {
                await poiService.likePoi(poiId);
            }
            // Recharger le POI pour synchroniser l'état exact du backend
            const response = await poiService.getById(poiId);
            setPoi(response.data);
        } catch (err) {
            console.error('Erreur lors du like:', err);
            // Rollback en cas d'erreur - recharger depuis le backend
            const response = await poiService.getById(poiId);
            setPoi(response.data);
        }
    };

    // Add/Remove Favorite
    const handleFavorite = async () => {
        if (!poi) return;

        // UI optimiste
        const newIsFavorite = !poi.isFavorite;
        setPoi({
            ...poi,
            isFavorite: newIsFavorite,
            favoriteCount: newIsFavorite ? (poi.favoriteCount || 0) + 1 : Math.max((poi.favoriteCount || 0) - 1, 0)
        });

        try {
            if (poi.isFavorite) {
                await poiService.removeFromFavorites(poiId);
            } else {
                await poiService.addToFavorites(poiId);
            }
        } catch (err) {
            console.error('Erreur lors de la mise en favoris:', err);
            // Rollback
            setPoi(poi);
        }
    };

    // Soumettre un avis
    const handleSubmitReview = async () => {
        if (!newReview.comment.trim()) {
            alert('Veuillez entrer un commentaire');
            return;
        }

        try {
            // Envoyer le rating comme STRING pour BigDecimal Java
            await poiService.createReview(poiId, {
                rating: newReview.rating, // Number (e.g. 5)
                comment: newReview.comment.trim()
            });

            // Recharger les avis
            await loadReviews();

            // Réinitialiser le formulaire
            setNewReview({ rating: 5, comment: '' });
            setShowCommentModal(false);

            // Recharger le POI pour mettre à jour la note moyenne
            const response = await poiService.getById(poiId);
            setPoi(response.data);
        } catch (err) {
            console.error('Erreur lors de la création de l\'avis:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Erreur inconnue';
            alert(`Erreur lors de l'ajout de votre avis: ${errorMsg}`);
        }
    };

    // Supprimer le POI
    const handleDelete = async () => {
        try {
            await poiService.delete(poiId);
            router.push("/User/PoIList");
        } catch (err) {
            console.error('Erreur suppression:', err);
            alert("Erreur lors de la suppression du POI");
            setDeleteConfirm(false);
        }
    };

    // Formatage des données
    const formatOpeningHours = (hours) => {
        if (!hours) return "Non spécifié";
        if (typeof hours === 'string') return hours;
        if (typeof hours === 'object') {
            return Object.entries(hours)
                .map(([day, time]) => `${day}: ${time}`)
                .join('\n');
        }
        return hours;
    };

    const formatServices = (services) => {
        if (!services) return [];
        if (typeof services === 'string') {
            return services.split(',').map(s => s.trim());
        }
        if (Array.isArray(services)) return services;
        return [];
    };

    // Loading state
    if (loading) return <LoadingScreen />;

    // Error state
    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="text-red-500 text-4xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => router.back()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <ArrowLeft size={20} className="inline mr-2" />
                            Retour
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No data state
    if (!poi) {
        return (
            <div className="bg-gray-50 min-h-screen py-10">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center py-20">
                        <div className="text-gray-400 text-5xl mb-4">🗺️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">POI non trouvé</h2>
                        <p className="text-gray-600 mb-6">Le point d'intérêt demandé n'existe pas ou a été supprimé.</p>
                        <button
                            onClick={() => router.push("/User/PoIList")}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Voir tous les POIs
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-12" style={{ marginTop: '70px' }}>
            {/* Header Hero Image */}
            <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 group">
                {poi.imageUrl ? (
                    <img
                        src={getImageURL(poi.imageUrl)}
                        alt={poi.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-900">
                        <MapPin size={80} className="text-white/20 mb-4" />
                        <p className="text-white/40 font-medium">Aucune image disponible</p>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                    <div className="max-w-6xl mx-auto">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full w-fit group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour à la liste</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-lg"
                                        style={{ backgroundColor: poi.category?.color, color: 'white' }}
                                    >
                                        {poi.category?.icon || '📍'} {poi.category?.name || 'Non classé'}
                                    </span>
                                    {poi.isVerified && (
                                        <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                            VÉRIFIÉ
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl">
                                    {poi.name}
                                </h1>
                                <div className="flex items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} className="text-blue-400" />
                                        <span className="font-medium">{poi.addressCity || poi.address?.city || 'Localisation inconnue'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                                        <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                        <span className="font-bold text-xl">{poi.rating?.toFixed(1) || '0.0'}</span>
                                        <span className="text-sm opacity-80">({poi.reviewCount || 0} avis)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {/* Like Button */}
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition shadow-xl font-bold uppercase tracking-widest text-sm backdrop-blur-md border border-white/10 ${poi.isLiked
                                        ? 'bg-red-500 text-white scale-105'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    <Heart size={20} className={poi.isLiked ? 'fill-white' : ''} />
                                    <span>{poi.likeCount || 0}</span>
                                </button>

                                {/* Favorite Button */}
                                <button
                                    onClick={handleFavorite}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition shadow-xl font-bold uppercase tracking-widest text-sm backdrop-blur-md border border-white/10 ${poi.isFavorite
                                        ? 'bg-amber-500 text-white scale-105'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                >
                                    <Bookmark size={20} className={poi.isFavorite ? 'fill-white' : ''} />
                                    <span>Favori</span>
                                </button>

                                <button
                                    onClick={() => window.open(`https://maps.google.com/?q=${poi.latitude},${poi.longitude}`, '_blank')}
                                    className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-xl font-bold uppercase tracking-widest text-sm"
                                >
                                    <Navigation size={20} />
                                    Y aller
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Overview & Description */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Tag size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">À propos</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {poi.description || "Aucune description fournie pour ce point d'intérêt. Contactez l'administrateur pour plus de détails."}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                            <StatCard label="Note moyenne" value={`${poi.rating?.toFixed(1) || '0.0'}/5`} icon={<Star className="text-yellow-500" />} />
                            <StatCard label="Likes" value={poi.likeCount || 0} icon={<Heart className="text-red-500" />} />
                            <StatCard label="Favoris" value={poi.favoriteCount || 0} icon={<Bookmark className="text-amber-500" />} />
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Location Details */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                    <MapPin size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Localisation</h2>
                            </div>
                            <div className="space-y-4">
                                <InfoItem label="Adresse" value={poi.addressStreet} />
                                <InfoItem label="Ville" value={poi.addressCity} />
                                <InfoItem label="Quartier" value={poi.addressNeighborhood} />
                                <InfoItem label="Région" value={poi.addressRegion} />
                                <InfoItem label="Code Postal" value={poi.addressPostalCode} />
                                <InfoItem label="Pays" value={poi.addressCountry || 'Cameroun'} />
                                <div className="pt-4 border-t border-gray-50 flex items-center gap-4 text-sm font-mono text-gray-400">
                                    <span>Lat: {poi.latitude?.toFixed(6)}</span>
                                    <span>Lon: {poi.longitude?.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Hours */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Phone size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Contact</h2>
                            </div>
                            <div className="space-y-4">
                                <ContactItem icon={<Phone size={18} />} value={poi.phone} label="Téléphone" />
                                <ContactItem icon={<Mail size={18} />} value={poi.email} label="Email" isMail />
                                <ContactItem icon={<Globe size={18} />} value={poi.website} label="Site Web" isExternal />
                                {poi.priceRange && (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mt-4">
                                        <span className="text-gray-500 font-medium">Gamme de prix</span>
                                        <span className="text-green-600 font-black tracking-widest">{poi.priceRange}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Services & Amenities */}
                    {(poi.services?.length > 0 || poi.amenities?.length > 0) && (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <Tag size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Services & Équipements</h2>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {formatServices(poi.services).map((service, idx) => (
                                    <span key={idx} className="px-5 py-2 bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                        {service}
                                    </span>
                                ))}
                                {formatServices(poi.amenities).map((amenity, idx) => (
                                    <span key={idx} className="px-5 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section Avis */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <MessageCircle size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Avis et Commentaires ({reviews.length})</h2>
                            </div>
                            <button
                                onClick={() => setShowCommentModal(true)}
                                className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition text-sm"
                            >
                                Ajouter un avis
                            </button>
                        </div>

                        {loadingReviews ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-400">Chargement des avis...</p>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-12 px-6 bg-gray-50 rounded-[2rem]">
                                <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">Aucun avis pour le moment. Soyez le premier !</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {reviews.map((review, index) => (
                                    <div key={index} className="p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-xl">
                                                    {(review.username || 'U')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-gray-900 leading-none mb-1">
                                                        {review.username || 'Utilisateur anonyme'}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                                                {review.createdAt && new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    
                    {/* Opening Hours Card */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Horaires</h3>
                        </div>
                        {poi.openingHours ? (
                            <div className="space-y-3">
                                {Object.entries(poi.openingHours).map(([day, hours]) => (
                                    <div key={day} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                        <span className="capitalize font-bold text-gray-700">{day}</span>
                                        <span className="text-blue-600 font-medium">{hours}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-2xl italic">
                                Horaires non disponibles
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Ajout d'avis */}
            {showCommentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-gray-900">Votre avis</h2>
                            <button
                                onClick={() => setShowCommentModal(false)}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Rating Selector */}
                        <div className="mb-8 p-6 bg-blue-50 rounded-3xl text-center">
                            <label className="block text-xs font-black text-blue-400 uppercase tracking-widest mb-4">
                                Quelle note donnez-vous ?
                            </label>
                            <div className="flex justify-center gap-3">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setNewReview({ ...newReview, rating })}
                                        className="transition transform hover:scale-125"
                                    >
                                        <Star
                                            size={40}
                                            className={
                                                rating <= newReview.rating
                                                    ? 'text-amber-500 fill-amber-500'
                                                    : 'text-blue-200'
                                            }
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Textarea */}
                        <div className="mb-10">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">
                                Votre expérience
                            </label>
                            <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="C'était génial ! L'accueil était parfait..."
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-blue-500 min-h-[150px] text-gray-700 font-medium placeholder:text-gray-300 transition-all shadow-inner"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSubmitReview}
                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                Publier mon avis
                            </button>
                            <button
                                onClick={() => setShowCommentModal(false)}
                                className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------
// UTILITY COMPONENTS
// ----------------------------------
function InfoItem({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start py-1">
            <span className="text-gray-500 font-medium text-sm">{label}</span>
            <span className="text-gray-900 font-bold text-right text-sm">{value}</span>
        </div>
    );
}

function ContactItem({ icon, value, label, isExternal, isMail }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 cursor-pointer"
             onClick={() => {
                 if(isExternal) window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
                 if(isMail) window.location.href = `mailto:${value}`;
             }}>
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-black text-gray-800 truncate">{value}</p>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="text-xl font-black text-gray-900">{value}</div>
        </div>
    );
}