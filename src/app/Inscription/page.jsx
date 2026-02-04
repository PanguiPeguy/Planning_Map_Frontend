"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Groups2Icon from '@mui/icons-material/Groups2';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import {CarCrash}  from "@mui/icons-material";
import { authService } from "@/src/services/authService";


export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({
    username : "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: "",
    transportmode: "",
    profilePhotoUrl: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profilePhotoUrl: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas !");
      return;
    }
    
    // Vérifiez que le username a au moins 3 caractères
    if (form.username.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }
    
    setLoading(true);
    
    try {
      // Créez l'objet JSON que votre backend attend
      const userData = {
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        transportmode: form.transportmode,
        profilePhotoUrl: form.profilePhotoUrl ? await convertToBase64(form.profilePhotoUrl) : null
      };
      
      const result = await authService.register(userData);
      
      if (result.success) {
        // Redirect to dashboard based on role
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'ADMIN') {
          router.push('/Admin/Dashboard');
        } else {
          router.push('/User/Dashboard');
        }
      } else {
        setError(result.error || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5faf7] p-8">
      <div className="flex w-full max-w-[1550px] min-h-[850px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Section Image - 40% */}
        <div 
          className="w-1/2 bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: "url('/assets/app.jpeg')"
          }}
        >
        
        </div>

        {/* Section Formulaire - 60% */}
        <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Inscription
          </h1>
          <p className="text-gray-600 mb-4 text-sm">Créez votre compte professionnel</p>

          {error && (
            <div className="w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            
            {/* Photo de profil */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-full bg-blue-800
                           flex items-center justify-center cursor-pointer hover:scale-100
                           transition-transform duration-300 shadow-xl overflow-hidden group"
                >
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Aperçu" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <CameraAltIcon className="text-white text-4xl mb-2" />
                      <p className="text-white text-xs font-medium px-2">Ajouter une photo</p>
                    </div>
                  )}
                  
                  {/* Overlay au survol */}
                  <div className="absolute inset-0 bg-black/50 opacity-0  flex items-center justify-center">
                    <CameraAltIcon className="text-white text-3xl" />
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                
                {/* Badge indicateur */}
              </div>
            </div>

            {/* Formulaire en 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Colonne 1 */}
              <div className="space-y-6">
                {/* Nom de l'entreprise */}
                <div className="relative h-14">
                  <Groups2Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="text"
                    name="username" // Changez de companyName à username
                    value={form.username}
                    onChange={handleChange}
                    required
                    minLength={3} // Validation côté client
                    maxLength={20}
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Nom de l'entreprise (3-20 caractères)
                  </label>
                </div>

                {/* Email */}
                <div className="relative h-14">
                  <AlternateEmailIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Email professionnel
                  </label>
                </div>

                {/* Mot de passe */}
                <div className="relative h-14">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Mot de passe
                  </label>
                </div>

                {/* Email */}
                <div className="relative h-14">
                  <CarCrash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="text"
                    name="transportmode"
                    value={form.transportmode}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Mode de transport
                  </label>
                </div>
              </div>

              {/* Colonne 2 */}
              <div className="space-y-6">
                {/* Téléphone */}
                <div className="relative h-14">
                  <LocalPhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Téléphone
                  </label>
                </div>

                {/* city */}
                <div className="relative h-14">
                  <ApartmentIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    city
                  </label>
                </div>

                

                {/* Confirmation mot de passe */}
                <div className="relative h-14">
                  <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base pointer-events-none z-10" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="peer w-full h-full rounded-full text-base outline-none 
                              pl-12 pr-4 bg-gray-50 border-2 border-gray-300
                              transition-all duration-300
                              focus:border-blue-800 focus:bg-white 
                              valid:border-blue-800 valid:bg-white"
                    placeholder=" "
                  />
                  <label className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-500 text-[15px] 
                                  pointer-events-none transition-all duration-300
                                  peer-focus:top-0 peer-focus:left-3 peer-focus:text-[12px]
                                  peer-focus:text-blue-800 peer-focus:bg-white peer-focus:px-2
                                  peer-valid:top-0 peer-valid:left-3 peer-valid:text-[12px]
                                  peer-valid:text-blue-800 peer-valid:bg-white peer-valid:px-2
                                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-[15px]">
                    Confirmer le mot de passe
                  </label>
                </div>
              </div>
            </div>

            {/* Bouton submit - Pleine largeur */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-4 rounded-full 
                        hover:shadow-xl hover:scale-105 transition-all duration-300
                        font-semibold text-base mt-8
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création du compte..." : "Créer un compte"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Déjà inscrit ?{" "}
            <a href="/Connexion" className="text-blue-800 hover:underline font-semibold">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}