"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockIcon from '@mui/icons-material/Lock';
import { authService } from "@/src/services/authService";

export default function Connexion() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const result = await authService.login(form.email, form.password);
      
      if (result.success) {
        // Rediriger en fonction du rôle retourné par le backend
        if (result.data.role === 'ADMIN') {
          router.push('/Admin/Dashboard');
        } else {
          router.push('/User/Dashboard');
        }
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Une erreur est survenue');
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
            backgroundImage: "url('/assets/car.jpeg')"
          }}
        >
        
        </div>

        {/* Section Formulaire - 60% */}
        <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600 mb-4 text-sm">Connectez vous a votre compte </p>
          
          {error && (
            <div className="w-full max-w-2xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">

          <div className="flex flex-col justify-center items-center gap-6">


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

            {/* Bouton */}
            {/* Bouton submit - Pleine largeur */}
            <button
              type="submit"
              disabled={loading}
              className="w-[360px] bg-blue-800 text-white py-4 rounded-full 
                        hover:shadow-xl hover:scale-105 transition-all duration-300
                        font-semibold text-base mt-8 items-center
                        disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Vous n'avez pas encore de compte ?{" "}
            <a href="/Inscription" className="text-blue-800 hover:underline font-semibold">
              S'inscire
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
