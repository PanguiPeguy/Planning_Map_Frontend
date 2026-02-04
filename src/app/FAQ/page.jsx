'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Qu’est-ce que Planning-Map ?",
    answer: "Planning-Map est une plateforme qui permet de :\n\n• visualiser une carte interactive,\n• rechercher des lieux,\n• afficher des itinéraires,\n• gérer les utilisateurs,\n• consulter des points d’intérêt (POI),\n• analyser les statistiques d’utilisation."
  },
  {
    question: "Quels types d’itinéraires sont supportés ?",
    answer: "Planning-Map permet de :\n\n• calculer un itinéraire entre deux points,\n• afficher la distance et la durée,\n• visualiser le trajet sur la carte,\n• sauvegarder des itinéraires (si votre compte le permet)."
  },
  {
    question: "Puis-je rechercher une adresse ou un lieu ?",
    answer: "Oui.\nUn champ de recherche permet de trouver :\n\n• des lieux publics,\n• des routes,\n• des points d’intérêt,\n• des coordonnées GPS."
  },
  {
    question: "Comment ajouter un marqueur sur la carte ?",
    answer: "Vous pouvez :\n\n• cliquer directement sur la carte, ou\n• utiliser le bouton “Ajouter un marqueur”.\nLe marqueur peut contenir un nom et une description."
  },
  {
    question: "Qu’est-ce qu’un POI ?",
    answer: "Un POI (Point Of Interest) est un point intéressant sur la carte :\n\n• restaurant\n• école\n• hôpital\n• monument\n• site administratif\nLes POI peuvent être affichés, filtrés ou ajoutés selon vos permissions."
  },
  {
    question: "Comment accéder à mon tableau de bord ?",
    answer: "Si vous êtes administrateur :\n➡️ Allez dans /Admin\nVous y trouverez :\n\n• statistiques globales\n• gestion utilisateurs\n• gestion POI\n• carte avancée (MapView)"
  },
  {
    question: "Comment gérer les utilisateurs ?",
    answer: "Depuis le menu Admin → “Utilisateurs”, vous pouvez :\n\n• voir la liste des comptes,\n• filtrer par nom, email ou statut,\n• consulter les détails d’un utilisateur,\n• désactiver ou activer un compte (si autorisé)."
  },
  {
    question: "Comment réinitialiser mon mot de passe ?",
    answer: "Utilisez la page “Mot de passe oublié”, entrez votre email et suivez les instructions envoyées par mail."
  },
  {
    question: "Qui peut accéder à l’espace administrateur ?",
    answer: "Seulement les utilisateurs disposant du rôle :\n• ADMIN\nLes autres sont automatiquement redirigés vers la page de connexion."
  },
  {
    question: "Les données de navigation sont-elles privées ?",
    answer: "Oui.\nToutes les données (itinéraires, position, POI, utilisateurs) sont stockées de façon sécurisée."
  },
  {
    question: "Que faire si la carte ne s’affiche pas ?",
    answer: "Essayez les solutions suivantes :\n\n• rafraîchir la page,\n• vérifier votre connexion Internet,\n• vérifier que le backend est accessible,\n• désactiver temporairement le bloqueur de publicité."
  },
  {
    question: "Comment signaler un bug ou une erreur ?",
    answer: "Utilisez le bouton \"Support\" ou contactez l’administrateur du système."
  },
  {
    question: "Que faire si un itinéraire ne s’affiche pas ?",
    answer: "Assurez-vous que :\n\n• les deux points (départ et arrivée) sont valides,\n• la carte est bien chargée,\n• aucun mode de navigation n’est désactivé."
  },
  {
    question: "Puis-je exporter un itinéraire ?",
    answer: "Oui.\nUn bouton “Exporter” permet de générer :\n\n• un fichier PDF,\n• une capture du trajet,\n• ou un lien partageable (si activé par l’admin)."
  },
  {
    question: "Comment changer la langue de l’interface ?",
    answer: "Accédez aux paramètres → “Langue”.\nLes langues disponibles sont : Français, Anglais."
  },
  {
    question: "Puis-je utiliser Planning-Map sur mobile ?",
    answer: "Oui, l’interface est entièrement responsive et fonctionne sur :\n\n• Android\n• iOS\n• Tablettes\n• Navigateurs mobiles"
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête simple */}
      <div className="bg-blue-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Planning-Map</h1>
          <p className="text-2xl font-medium">Foire Aux Questions</p>
        </div>
      </div>

      {/* FAQ en accordéon – 2 par ligne sur grand écran */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:border-blue-300 transition"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex justify-between items-center text-left focus:outline-none hover:bg-blue-50 transition"
              >
                <h3 className="text-xl font-bold text-blue-900">{faq.question}</h3>
                <ChevronDown
                  className={`w-7 h-7 text-blue-600 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`px-8 pb-8 text-gray-700 leading-relaxed ${
                  openIndex === index ? 'block' : 'hidden'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        {/* Contact final */}
        <div className="mt-16 text-center">
          <p className="text-xl font-semibold text-blue-900">
            Une autre question ? Contactez-nous à
            <a href="mailto:planning.map@gmail.com" className="text-blue-600 hover:underline ml-2">
              planning.map@gmail.com
            </a>
          </p>
          <p className="text-lg text-gray-600 mt-4">
            © 2025 Planning-Map – Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}