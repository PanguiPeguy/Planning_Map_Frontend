"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, IdCard, Mail, Edit2, Lock, Car, Building, Trash2 } from "lucide-react";
import LoadingScreen from "@/src/components/layout/Loading";
import { useAuth } from "@/src/contexts/AuthContext";
import { userService } from "@/src/services/userService";

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="group">
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all duration-300">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
        <Icon className="text-white" size={20} />
      </div>
      <div className="flex-1">
        <span className="text-blue-400 font-semibold text-xs uppercase tracking-wider block mb-1">
          {label}
        </span>
        <p className="font-medium text-base text-gray-800 break-all">
          {value || "Non renseigné"}
        </p>
      </div>
    </div>
  </div>
);

export default function UserProfile() {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userService.getMyProfile();
        setUser(response.data);
        setForm(response.data);
      } catch (error) {
        console.error("Erreur profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleOpen = () => {
    setForm(user);
    setOpen(true);
  };

  const handleDelete = async (id) => {
      try {
        await userService.deleteMyAccount();
        localStorage.clear();
        setDeleteConfirm(null);
        window.location.href = '/Connexion';
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression du compte");
      }
    };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await userService.updateProfile({
        username: form.username,
        companyName: form.companyName,
        phone: form.phone,
        city: form.city,
        transportmode: form.transportmode
      });
      setUser(response.data);
      await refreshUser(); // Update context
      setOpen(false);
    } catch (error) {
      console.error("Erreur update:", error);
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex justify-center items-center bg-white to-purple-50 p-4 mt-20 md:p-12">
      <div className="max-w-5xl mx-auto pt-24 w-full">
        {/* CONTENEUR PRINCIPAL */}
        <div className="relative">
          {/* IMAGE DE PROFIL */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <img
                src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=0D8ABC&color=fff`}
                alt="Profile"
                className="relative w-40 h-40 rounded-full border-4 border-white shadow-2xl object-cover ring-4 ring-blue-200"
              />
            </div>
          </div>

          {/* CARTE PRINCIPALE */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            
            {/* Contenu */}
            <div className="p-6 md:p-10">
              <div className="flex justify-center items-center mb-8 mt-16">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  {user?.companyName || user?.username}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colonne 1 */}
                <div className="space-y-4">
                  <InfoItem icon={IdCard} label="Nom d'utilisateur" value={user?.username} />
                  <InfoItem icon={Mail} label="Email professionnel" value={user?.email} />
                  <InfoItem icon={Phone} label="Téléphone" value={user?.phone} />
                </div>

                {/* Colonne 2 */}
                <div className="space-y-4">
                  <InfoItem icon={Building} label="Entreprise" value={user?.companyName} />
                  <InfoItem icon={MapPin} label="Ville" value={user?.city} />
                  <InfoItem icon={Car} label="Transport" value={user?.transportmode} />
                </div>
              </div>

              <div className="flex justify-center items-center mt-8 mb-8">
                  <div className="flex gap-4">
                    <button
                      onClick={handleOpen}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <Edit2 size={18} />
                      Mettre à jour
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(user?.id)}
                      title="Supprimer"
                      className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      {deleting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Suppression...
                          </span>
                        ) : (
                          'Supprimer'
                        )}
                    </button>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PERSONNALISÉE */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 mt-20">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* En-tête du modal */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Modifier les informations</h2>
              <button
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu du modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom d'utilisateur</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Entreprise</label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>              

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mode de transport</label>
                  <input
                    type="text"
                    name="transportmode"
                    value={form.transportmode || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
            {/* Pied du modal */}
            <div className="p-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal suppression */}
            {deleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
                  <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <Trash2 size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Supprimer votre Compte</h2>
                    <p className="text-gray-600">
                      Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Supprimer définitivement
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}