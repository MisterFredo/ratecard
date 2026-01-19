"use client";

import Link from "next/link";

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

      {/* =====================================================
          HERO — POSITIONNEMENT
      ===================================================== */}
      <header className="text-center space-y-6">
        <span className="text-sm uppercase tracking-widest text-ratecard-blue">
          Programme partenaires
        </span>

        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
          Ratecard Membership
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-700 leading-relaxed">
          Un cadre éditorial structuré pour les acteurs qui souhaitent
          s’inscrire durablement dans l’écosystème AdTech, Retail Media
          et data.
        </p>
      </header>

      {/* =====================================================
          INTRO — INTENTION
      ===================================================== */}
      <section className="space-y-6 text-gray-800 leading-relaxed">
        <p>
          Le Ratecard Membership s’adresse aux entreprises qui souhaitent
          renforcer leur visibilité et structurer leurs prises de parole
          dans un environnement éditorial professionnel, exigeant et
          indépendant.
        </p>

        <p>
          L’objectif n’est pas de multiplier les messages, mais de leur
          donner un cadre cohérent : relayage de news, diffusion dans la
          newsletter, présence sur LinkedIn et inscription dans la durée
          au sein de l’écosystème Ratecard.
        </p>
      </section>

      {/* =====================================================
          OFFRES — PRÉSENTATION ÉDITORIALE
      ===================================================== */}
      <section className="space-y-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Les niveaux de Membership
        </h2>

        <div className="grid gap-12 md:grid-cols-3">

          {/* BASIC */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Membership Basic
            </h3>

            <p className="text-sm text-gray-600">
              Pour les acteurs souhaitant relayer régulièrement
              leurs actualités dans un cadre éditorial structuré.
            </p>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>– Relais de news sur Ratecard.fr</li>
              <li>– Diffusion dans la newsletter hebdomadaire</li>
              <li>– Relais des offres d’emploi</li>
              <li>– Présence LinkedIn</li>
              <li>– Profil entreprise sur Ratecard</li>
            </ul>
          </div>

          {/* CLASSIC */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Membership Classic
            </h3>

            <p className="text-sm text-gray-600">
              Pour les entreprises souhaitant aller au-delà du simple
              relais et engager un dialogue éditorial régulier.
            </p>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>– Toutes les prestations Basic</li>
              <li>– Échanges éditoriaux réguliers</li>
              <li>– Mise en avant sur événements Ratecard</li>
              <li>– Contenus co-créés</li>
            </ul>
          </div>

          {/* PREMIUM */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Membership Premium
            </h3>

            <p className="text-sm text-gray-600">
              Pour les acteurs souhaitant s’inscrire durablement
              comme références du marché.
            </p>

            <ul className="space-y-2 text-sm text-gray-700">
              <li>– Toutes les prestations Classic</li>
              <li>– Accompagnement éditorial dédié</li>
              <li>– Analyses et contenus sur mesure</li>
              <li>– Présence renforcée dans l’écosystème Ratecard</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =====================================================
          VALEUR — CRÉDIBILITÉ
      ===================================================== */}
      <section className="space-y-6 border-t pt-16">
        <p className="text-sm text-gray-500">
          Des acteurs AdTech, Retail Media et data font déjà partie
          de l’écosystème Ratecard.
        </p>

        <p className="text-gray-700">
          Solutions technologiques, agences, plateformes, éditeurs,
          cabinets de conseil… Ratecard fédère des profils variés autour
          d’une lecture commune du marché et d’un haut niveau
          d’exigence éditoriale.
        </p>
      </section>

      {/* =====================================================
          CTA — CONVERSATION
      ===================================================== */}
      <section className="text-center space-y-4 pt-8">
        <p className="text-lg text-gray-800">
          Vous souhaitez échanger sur le Ratecard Membership ?
        </p>

        <Link
          href="mailto:contact@ratecard.fr"
          className="inline-block text-ratecard-blue font-medium hover:underline"
        >
          Échanger avec l’équipe Ratecard →
        </Link>
      </section>
    </div>
  );
}
