"use client";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

export type PersonRef = {
  id_person: string;
  name: string;
  title?: string;
};

export type ArticlePerson = {
  id_person: string;
  name: string;
  title?: string;
  role: string;
};

type Props = {
  /** Personnes actuellement sélectionnées */
  values: ArticlePerson[];

  /** Personnes disponibles (déjà filtrées par société) */
  availablePersons: PersonRef[];

  /** Désactive le selector (ex: aucune société sélectionnée) */
  disabled?: boolean;

  /** Chargement en cours */
  loading?: boolean;

  /** Callback */
  onChange: (persons: ArticlePerson[]) => void;
};

export default function PersonSelector({
  values,
  availablePersons,
  disabled = false,
  loading = false,
  onChange,
}: Props) {
  const selectedIds = values.map((v) => v.id_person);

  /* ---------------------------------------------------------
     TOGGLE SELECTION (IMMÉDIAT)
  --------------------------------------------------------- */
  function toggle(person: PersonRef) {
    if (disabled) return;

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
          role: "contributeur",
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

      {disabled ? (
        <div className="text-sm text-gray-400 italic">
          Sélectionnez d’abord une société
        </div>
      ) : loading ? (
        <div className="text-sm text-gray-500">
          Chargement des personnes…
        </div>
      ) : availablePersons.length === 0 ? (
        <div className="text-sm text-gray-400 italic">
          Aucune personne associée à cette société
        </div>
      ) : (
        <div className="border rounded p-3 space-y-2 bg-white max-h-64 overflow-auto">
          {availablePersons.map((p) => {
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
                  <div className="text-xs text-gray-500">
                    {p.title}
                  </div>
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

