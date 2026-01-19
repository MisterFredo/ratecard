"use client";

import Link from "next/link";

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

      {/* HERO */}
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Ratecard Membership
        </h1>

        <p className="text-lg text-gray-700">
          Une offre de visibilité, de relais éditorial et d’accompagnement
          pour les acteurs de l’AdTech, du Retail Media et de l’écosystème data.
        </p>
      </header>

      {/* INTRO */}
      <section className="space-y-6">
        <p className="text-gray-800">
          Le Ratecard Membership permet à votre entreprise d’augmenter sa visibilité
          et d’élargir son impact à travers les canaux éditoriaux de Ratecard :
          site web, newsletter hebdomadaire, LinkedIn et événements de communauté.
        </p>

        <p className="text-gray-800">
          L’objectif est simple : offrir un cadre éditorial structuré pour relayer
          vos prises de parole, valoriser votre expertise et vous inscrire dans
          un écosystème professionnel de référence.
        </p>
      </section>

      {/* OFFRES */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Membership Basic
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Relais illimité de news sur Ratecard.fr</li>
            <li>Relais dans la newsletter hebdomadaire</li>
            <li>Relais des offres d’emploi</li>
            <li>Visibilité LinkedIn</li>
            <li>Profil entreprise sur Ratecard</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Membership Classic
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Toutes les prestations Basic</li>
            <li>Rencontres éditoriales régulières</li>
            <li>Visibilité sur événements Ratecard</li>
            <li>Contenus co-créés</li>
          </ul>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Membership Premium
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Toutes les prestations Classic</li>
            <li>Accompagnement stratégique dédié</li>
            <li>Analyses et contenus sur mesure</li>
            <li>Présence renforcée sur l’écosystème Ratecard</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <p className="text-lg text-gray-800">
          Vous souhaitez en savoir plus sur le Ratecard Membership ?
        </p>

        <Link
          href="mailto:contact@ratecard.fr"
          className="inline-block bg-ratecard-blue text-white font-semibold px-6 py-3 rounded-lg hover:bg-ratecard-blue/90 transition"
        >
          Contactez-nous
        </Link>
      </section>
    </div>
  );
}
