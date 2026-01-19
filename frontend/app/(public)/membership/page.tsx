"use client";

import Image from "next/image";
import Link from "next/link";

const PAGE_TITLE = "Offre Ratecard Membership";
const PAGE_DESCRIPTION =
  "Le Ratecard Membership est une offre de visibilité et de relais éditorial pour les entreprises du marché AdTech / MarTech.";

export default function MembershipPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">

      {/* HERO */}
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {PAGE_TITLE}
        </h1>
        <p className="text-lg text-gray-700">
          Plateforme d’accompagnement éditorial, visibilité et relais de contenu pour les entreprises du marché.
        </p>
      </header>

      {/* INTRO */}
      <section className="space-y-6">
        <p className="text-gray-800">
          Le Ratecard Membership permet à votre entreprise d’augmenter sa visibilité et
          d’élargir son impact à travers les canaux éditoriaux de Ratecard : site web,
          newsletter hebdomadaire, LinkedIn et événements de communauté.:contentReference[oaicite:1]{index=1}
        </p>

        <p className="text-gray-800">
          C’est une offre pensée pour les acteurs AdTech / MarTech souhaitant fédérer
          leur audience autour de contenus stratégiques, partager leurs insights,
          et s’inscrire dans un écosystème d’influence professionnel.:contentReference[oaicite:2]{index=2}
        </p>
      </section>

      {/* OFFRE — NIVEAUX */}
      <section className="grid gap-8 md:grid-cols-3">
        {/* Basic */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Basic Membership
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Relai illimité de news sur Ratecard.fr</li>
            <li>Relai illimité dans la newsletter hebdomadaire</li>
            <li>Relai illimité des offres d’emploi</li>
            <li>Relayage LinkedIn</li>
            <li>Profil entreprise sur Ratecard</li>
          </ul>
        </div>

        {/* Classic */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Classic Membership
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Toutes les prestations Basic</li>
            <li>Rencontres éditoriales mensuelles avec l’équipe</li>
            <li>Visibilité sur événements spécifiques</li>
            <li>Possibilités de contenus co-créés</li>
          </ul>
        </div>

        {/* Premium */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Premium Membership
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Toutes les prestations Classic</li>
            <li>Analyse et rapports de marché réguliers</li>
            <li>Accompagnement stratégique dédié</li>
            <li>Contenus éditoriaux personnalisés</li>
          </ul>
        </div>
      </section>

      {/* VANTAGES */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Pourquoi choisir Ratecard Membership ?
        </h2>

        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Vous gagnez en visibilité sur un média professionnel reconnu.</li>
          <li>Vos contenus (news, offres, prises de parole) sont relayés sur plusieurs canaux.</li>
          <li>Vous bénéficiez d’un accompagnement marketing ciblé.:contentReference[oaicite:3]{index=3}</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <p className="text-lg text-gray-800">
          Intéressé(e) par le Ratecard Membership ?
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
