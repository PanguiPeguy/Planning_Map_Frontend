"use client";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import PlaceIcon from "@mui/icons-material/Place";
import RouteIcon from "@mui/icons-material/Route";
import StarIcon from "@mui/icons-material/Star";
import Header from "@/src/components/layout/Header";


export default function Apropos() {
  return (
    <>

    <Header />
    <main className="mx-auto max-w-5xl px-6 py-16 text-gray-800">

      {/* HERO */}
      <section className="mb-20 text-center">
        <div className="mb-6 flex justify-center">
          <TravelExploreIcon
            sx={{ fontSize: 64 }}
            className="text-blue-800"
          />
        </div>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-blue-900 md:text-5xl">
          À propos
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-600">
          Voyager, c’est bien plus qu’un déplacement. C’est une succession de
          lieux, d’étapes et de découvertes qui donnent du sens au trajet.
        </p>
      </section>

      {/* SECTION 1 */}
      <section className="mb-16">
        <div className="mb-4 flex items-center gap-3">
          <RouteIcon className="text-amber-500" />
          <h2 className="text-2xl font-semibold text-blue-900">
            Voyager autrement
          </h2>
        </div>

        <p className="leading-relaxed text-gray-700">
          Notre plateforme vous aide à organiser vos déplacements en mettant
          l’accent sur l’essentiel : le chemin parcouru et les lieux qui le
          composent. Chaque trajet devient une expérience pensée et maîtrisée.
        </p>
      </section>

      {/* SECTION 2 - HIGHLIGHT */}
      <section className="mb-16 rounded-2xl border border-amber-200 bg-gradient-to-br from-blue-50 to-amber-50 p-10 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <PlaceIcon className="text-amber-500" />
          <h2 className="text-2xl font-semibold text-blue-900">
            Les Points d’Intérêt au cœur du voyage
          </h2>
        </div>

        <p className="leading-relaxed text-gray-700">
          Villes, sites touristiques, lieux culturels, stations ou espaces
          naturels deviennent des étapes à part entière. Les{" "}
          <span className="font-semibold text-amber-600">
            Points of Interest (PoI)
          </span>{" "}
          structurent le voyage et enrichissent chaque itinéraire.
        </p>
      </section>

      {/* SECTION 3 */}
      <section className="mb-16">
        <div className="mb-4 flex items-center gap-3">
          <RouteIcon className="text-amber-500" />
          <h2 className="text-2xl font-semibold text-blue-900">
            Une planification fluide
          </h2>
        </div>

        <p className="leading-relaxed text-gray-700">
          Que votre trajet soit simple ou composé de plusieurs étapes, notre
          objectif est de vous offrir une vision claire, fluide et cohérente du
          parcours, du départ jusqu’à la destination finale.
        </p>
      </section>

      {/* SECTION 4 - VISION */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <StarIcon className="text-amber-500" />
          <h2 className="text-2xl font-semibold text-blue-900">
            Notre vision
          </h2>
        </div>

        <ul className="space-y-4">
          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Mettre en valeur les lieux qui rendent chaque voyage unique</span>
          </li>

          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Faciliter les déplacements entre différents points d’intérêt</span>
          </li>

          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Offrir une expérience intuitive, fluide et agréable</span>
          </li>

          <li className="flex items-start gap-4">
            <span className="mt-2 h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Faire du trajet une composante essentielle du voyage</span>
          </li>
        </ul>
      </section>

    </main>
    </>
  );
}
