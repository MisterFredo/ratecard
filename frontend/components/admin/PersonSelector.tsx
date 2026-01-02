"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

// Person référentiel (API /person/list)
type PersonRef = {
  id_person: string;
  name: string;
  title?: string;
};

// Person associée à un article (avec rôle)
export type ArticlePerson = {
  id_person: string;
  name: string;
  title?: string;
  role: string;
};

type Props = {
  values: ArticlePerson[];
  onChange: (persons: ArticlePerson[]) => void;
};

export default function PersonSelector({ values, onChange }: Props) {
  const [persons, setPersons] = useState<PersonRef[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------------------------
     LOAD PERSONS
  --------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await api.get("/person/list");
      setPersons(
        (res.persons || []).map((p: any) => ({
          id_person: p.ID_PERSON,
          name: p.NAME,
          title: p.TITLE || "",
        }))
      );

      setLoading(false);
    }

    load();
  }, []);

  /* ---------------------------------------------------------
     TOGGLE SELECTION
  --------------------------------------------------------- */
  const selectedIds = values.map((v) => v.id_person);

  function toggle(person: PersonRef) {
    const already = selectedIds.includes(person.id_person);

    if (already) {
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
     UI
  --------------------------------------------------------- */
  return (
    <div className="space-y-2">
      <label className="font-medium">Personnes</label>

      {loading ? (
        <div className="text-sm text-gray-500">Chargement…</div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {persons.map((p) => {
            const selected = selectedIds.includes(p.id_person);

            return (
              <div
                key={p.id_person}
                onClick={() => toggle(p)}
                className={`p-2 rounded cursor-pointer ${
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
