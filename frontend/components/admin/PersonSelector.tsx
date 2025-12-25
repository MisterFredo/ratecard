// frontend/components/admin/PersonSelector.tsx

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PersonSelector({ values, onChange }) {
  const [persons, setPersons] = useState([]);

  useEffect(() => {
    api.get("/person/list").then((res) => {
      setPersons(res.persons || []);
    });
  }, []);

  function toggle(personId: string) {
    if (values.includes(personId)) {
      onChange(values.filter(id => id !== personId));
    } else {
      onChange([...values, personId]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="font-medium">Intervenants</label>

      <div className="space-y-2 border p-2 rounded">
        {persons.map((p) => (
          <label key={p.ID_PERSON} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={values.includes(p.ID_PERSON)}
              onChange={() => toggle(p.ID_PERSON)}
            />
            <span>{p.NAME} ({p.TITLE || "—"})</span>
          </label>
        ))}
      </div>
    </div>
  );
}
