"use client";

import Image from "next/image";
import WelcomeImg from "@/public/assets/WelcomePageImg.jpeg";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  MapPin, 
  TrendingUp, 
  Map, 
  Navigation, 
  CheckCircle, 
  ShieldCheck,
  Zap,
  ArrowRight,
  Users,
  MessageSquare,
  Menu,
  X
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      title: "Gestion Intelligente",
      description: "Importez et organisez vos points d'intérêt en quelques clics. Visualisez-les instantanément sur une carte interactive.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
      title: "Optimisation de Trajets",
      description: "Algorithmes avancés pour calculer les itinéraires les plus rapides entre vos différentes étapes.",
    },
    {
      icon: <Navigation className="w-8 h-8 text-indigo-500" />,
      title: "Navigation Fluide",
      description: "Suivez votre progression et recevez des mises à jour sur vos trajets directement depuis une interface claire.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      title: "Données Sécurisées",
      description: "Vos données de planning sont cryptées, garantissant la confidentialité de vos déplacements.",
    }
  ];

  const faqs = [
    {
      q: "Qu’est-ce que Planning-Map ?",
      a: "Planning-Map est une plateforme qui permet de visualiser une carte interactive, rechercher des lieux, afficher des itinéraires, et gérer vos points d'intérêt (POI) avec simplicité."
    },
    {
      q: "Puis-je rechercher une adresse ou un lieu ?",
      a: "Oui. Un champ de recherche permet de trouver des lieux publics, des routes, des points d’intérêt et même des coordonnées GPS précises."
    },
    {
      q: "Qu’est-ce qu’un POI ?",
      a: "Un POI (Point Of Interest) est un point stratégique sur la carte: restaurant, client, site touristique ou administratif. Vous pouvez les gérer facilement."
    },
    {
      q: "Comment calculer un itinéraire ?",
      a: "Il suffit de sélectionner un point de départ et d'arrivée. L'application calcule automatiquement la meilleure route et affiche la distance et la durée estimée."
    },
    {
        q: "L'application fonctionne-t-elle sur mobile ?",
        a: "Absolument. L'interface est entièrement responsive (" + "'mobile-first'" + ") et s'adapte à tous vos écrans: téléphone, tablette et ordinateur."
    },
    {
        q: "Puis-je exporter mes itinéraires ?",
        a: "Oui, des options d'export et de sauvegarde sont disponibles pour conserver vos trajets optimisés."
    }
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Map className="w-6 h-6" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? "text-slate-900" : "text-slate-800"}`}>
              Planning <span className="text-blue-600">Map</span>
            </span>
          </div>
          
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-blue-600 transition-colors">Fonctionnalités</button>
            <button onClick={() => scrollToSection('about')} className="text-slate-600 hover:text-blue-600 transition-colors">À Propos</button>
            <button onClick={() => scrollToSection('faq')} className="text-slate-600 hover:text-blue-600 transition-colors">FAQ</button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/Connexion" className="px-5 py-2.5 text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Connexion
            </Link>
            <Link href="/Inscription" className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold shadow-lg shadow-blue-200">
              S'inscrire
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-xl md:hidden">
            <button onClick={() => scrollToSection('features')} className="text-left py-2 font-medium text-slate-600">Fonctionnalités</button>
            <button onClick={() => scrollToSection('about')} className="text-left py-2 font-medium text-slate-600">À Propos</button>
            <button onClick={() => scrollToSection('faq')} className="text-left py-2 font-medium text-slate-600">FAQ</button>
            <hr className="border-gray-100" />
            <Link href="/Connexion" className="text-center py-3 font-medium text-slate-600 bg-gray-50 rounded-lg">Connexion</Link>
            <Link href="/Inscription" className="text-center py-3 font-medium text-white bg-blue-600 rounded-lg">S'inscrire</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse" />
            <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl mix-blend-multiply opacity-70" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className={`transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 tracking-wide uppercase shadow-sm">
              <Zap className="w-3 h-3" /> Nouvelle Expérience de Voyage
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Planifiez vos trajets avec <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligence et Précision</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              Optimisez vos déplacements professionnels et personnels. Importez, visualisez et naviguez entre vos points d'intérêt sur une carte unifiée.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/Inscription"
                className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:-translate-y-1"
              >
                Commencer maintenant <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/Connexion"
                className="px-8 py-4 rounded-full bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 transition-all font-bold hover:shadow-md"
              >
                Se connecter
              </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 max-w-4xl mx-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Ils nous font confiance</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale">
                    <span className="text-xl font-black font-serif">LOGISTIA</span>
                    <span className="text-xl font-bold">TRAVELCORP</span>
                    <span className="text-xl font-semibold tracking-tighter">MAPIFY</span>
                    <span className="text-xl font-mono font-bold">GLOBEX</span>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">Fonctionnalités Clés</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tout pour réussir vos itinéraires</h3>
            <p className="text-slate-500 text-lg">Des outils puissants emballés dans une interface simple pour une efficacité maximale.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 group"
              >
                <div className="mb-6 w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-blue-600">
                  {f.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION INTEGRATED */}
      <section id="about" className="py-24 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Side */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                 <Image src={WelcomeImg} alt="Application Interface" width={800} height={600} className="object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
              
              {/* Highlight Card */}
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs hidden md:block">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-slate-800">Temps réel</span>
                 </div>
                 <p className="text-sm text-slate-500">Suivi précis des déplacements.</p>
              </div>
            </div>

            {/* Content Side */}
            <div className="order-1 lg:order-2">
              <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">À Propos</h2>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Une nouvelle vision <br /> du voyage et de la logistique.
              </h3>
              
              <div className="space-y-6 text-lg text-slate-600">
                <p>
                  Planning Map est bien plus qu'une simple carte. C'est une plateforme conçue pour donner du sens à vos déplacements en mettant l'accent sur ce qui compte vraiment: les étapes.
                </p>
                <p>
                  Que vous soyez un professionnel gérant une flotte ou un voyageur organisant un road-trip, notre outil transforme la complexité géographique en un plan clair et actionnable.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  "Visualisation Claire: Vos POIs au premier plan.",
                  "Planification Fluide: Du départ à l'arrivée.",
                  "Expérience Intuitive: Pas besoin de manuel."
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ SECTION INTEGRATED */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider text-sm mb-3">Support</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Questions Fréquentes (FAQ)</h3>
            <p className="text-slate-500 text-lg">Tout ce que vous devez savoir pour bien démarrer.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${openFaqIndex === i ? "bg-blue-50 border-blue-200 shadow-md" : "bg-white border-gray-200 hover:border-blue-200"}`}
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full px-8 py-6 flex justify-between items-center text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg ${openFaqIndex === i ? "text-blue-900" : "text-slate-800"}`}>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === i ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
                </button>
                <div 
                  className={`transition-[max-height] duration-300 ease-in-out ${openFaqIndex === i ? "max-h-48" : "max-h-0"}`}
                >
                  <p className="px-8 pb-8 text-slate-600 leading-relaxed border-t border-blue-100/50 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-slate-500">
            Une autre question ? <a href="mailto:contact@planningmap.com" className="text-blue-600 font-semibold hover:underline">Contactez le support</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Map className="w-8 h-8 text-blue-500" />
                <span className="text-2xl font-bold tracking-tight">Planning Map</span>
              </div>
              <p className="text-slate-400 max-w-sm">
                La solution complète pour transformer vos trajets en opportunités. Planifiez, visualisez, réussissez.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-blue-400">Navigation</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition">Fonctionnalités</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition">À Propos</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-blue-400">Légal</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="#" className="hover:text-white transition">Mentions Légales</Link></li>
                <li><Link href="#" className="hover:text-white transition">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-white transition">CGU</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
            <p>© 2026 Planning Map Inc. Tous droits réservés.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <Users className="w-5 h-5 hover:text-white cursor-pointer transition" />
               <MessageSquare className="w-5 h-5 hover:text-white cursor-pointer transition" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}