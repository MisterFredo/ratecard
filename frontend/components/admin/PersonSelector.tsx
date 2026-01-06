"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

// Person référentiel (API /person/list)
export type PersonRef = {
  id_person: string;
  name: string;
  title?: string;
  id_company?: string; // 🔑 lien société (clé pour le filtrage)
};

// Person associée à un contenu (avec rôle)
export type ArticlePerson = {
  id_person: string;
  name: string;
  title?: string;
  role: string;
};

type Props = {
  /** Personnes actuellement sélectionnées */
  values: ArticlePerson[];

  /** Personnes disponibles à afficher (déjà filtrées par le parent) */
  availablePersons: PersonRef[];

  /** Callback de modification */
  onChange: (persons: ArticlePerson[]) => void;
};

export default function PersonSelector({
  values,
  availablePersons,
  onChange,
}: Props) {
  const [allPersons, setAllPersons] = useState<PersonRef[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD ALL PERSONS (UNE FOIS)
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get("/person/list");

      setAllPersons(
        (res.persons || []).map((p: any) => ({
          id_person: p.ID_PERSON,
          name: p.NAME,
          title: p.TITLE || "",
          id_company: p.ID_COMPANY || null,
        }))
      );

      setLoading(false);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     TOGGLE SELECTION (IMMÉDIAT)
  --------------------------------------------------------- */
  const selectedIds = values.map((v) => v.id_person);

  function toggle(person: PersonRef) {
    const alreadySelected = selectedIds.includes(person.id_person);

    if (alreadySelected) {
      onChange(values.filter((v) => v.id_person !== person.id_person));
    } else {
      onChange([
        ...values,
        {
          id_person: person.id_person,
          name: person.name,
          title: person.title,
          role: "contributeur", // valeur par défaut
        },
      ]);
    }
  }

  /* ---------------------------------------------------------
     PERSONNES À AFFICHER
     - si le parent fournit un filtrage → on l’utilise
     - sinon → fallback sur toutes
  --------------------------------------------------------- */
  const personsToDisplay =
    availablePersons && availablePersons.length > 0
      ? availablePersons
      : allPersons;

  /* ---------------------------------------------------------
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Personnes</label>

      {loading ? (
        <div className="text-sm text-gray-500">Chargement…</div>
      ) : personsToDisplay.length === 0 ? (
        <div className="text-sm text-gray-400 italic">
          Aucune personne disponible pour les sociétés sélectionnées
        </div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {personsToDisplay.map((p) => {
            const selected = selectedIds.includes(p.id_person);

            return (
              <div
                key={p.id_person}
                onClick={() => toggle(p)}
                className={`p-2 rounded cursor-pointer transition ${
                  selected
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="font-medium">{p.name}</div>
                {p.title && (
                  <div className="text-xs text-gray-500">{p.title}</div>
                )}
                {selected && (
                  <div className="text-xs text-blue-600 font-semibold">
                    Sélectionnée
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

