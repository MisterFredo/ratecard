"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { HeaderConfig } from "@/types/newsletter";

type CompanyOption = {
  id_company: string;
  name: string;
  media_logo_rectangle_id?: string | null;
};

type Props = {
  headerConfig: HeaderConfig;
  setHeaderConfig: React.Dispatch<
    React.SetStateAction<HeaderConfig>
  >;
  introText: string;
  setIntroText: (value: string) => void;
};

export default function DigestHeaderConfig({
  headerConfig,
  setHeaderConfig,
  introText,
  setIntroText,
}: Props) {

  const [companies, setCompanies] = useState<CompanyOption[]>([]);

  /* =========================================
     LOAD COMPANIES
  ========================================= */

  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await api.get("/company/list");

        const mapped = (res.companies || []).map((c: any) => ({
          id_company: c.ID_COMPANY,
          name: c.NAME,
          media_logo_rectangle_id: c.MEDIA_LOGO_RECTANGLE_ID,
        }));

        setCompanies(mapped);

      } catch (e) {
        console.error("Erreur chargement sociétés header", e);
      }
    }

    loadCompanies();
  }, []);

  /* ========================================= */

  function handleCompanyChange(id: string) {
    const company = companies.find(
      (c) => c.id_company === id
    );

    if (!company) return;

    setHeaderConfig((prev) => ({
      ...prev,
      headerCompany: {
        id_company: company.id_company,
        name: company.name,
        media_logo_rectangle_id:
          company.media_logo_rectangle_id ?? null,
      },
    }));
  }

  /* ========================================= */

  return (
    <section className="border border-gray-200 rounded-lg bg-white px-4 py-4 space-y-3">

      {/* HEADER TITLE + BAROMÈTRE */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">
          Configuration
        </h2>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={headerConfig.showTopicStats ?? false}
            onChange={(e) =>
              setHeaderConfig((prev) => ({
                ...prev,
                showTopicStats: e.target.checked,
              }))
            }
            className="h-3 w-3"
          />
          <span>Afficher baromètre</span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 gap-3">

        {/* TITRE */}
        <input
          type="text"
          placeholder="Titre newsletter"
          value={headerConfig.title}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              title: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
        />

        {/* SOUS-TITRE */}
        <input
          type="text"
          placeholder="Sous-titre (optionnel)"
          value={headerConfig.subtitle ?? ""}
          onChange={(e) =>
            setHeaderConfig((prev) => ({
              ...prev,
              subtitle: e.target.value,
            }))
          }
          className="border border-gray-200 rounded px-3 py-1.5 text-sm col-span-2"
        />

        {/* SÉLECTION SOCIÉTÉ HEADER */}
        <div className="col-span-2">
          <label className="text-xs text-gray-500 block mb-1">
            Société (logo header)
          </label>

          <select
            value={
              headerConfig.headerCompany?.id_company ?? ""
            }
            onChange={(e) =>
              handleCompanyChange(e.target.value)
            }
            className="border border-gray-200 rounded px-3 py-1.5 text-sm w-full"
          >
            <option value="">
              Sélectionner une société
            </option>

            {companies.map((company) => (
              <option
                key={company.id_company}
                value={company.id_company}
              >
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* INTRODUCTION */}
        <textarea
          placeholder="Introduction de la newsletter..."
          value={introText}
          onChange={(e) =>
            setIntroText(e.target.value)
          }
          className="
            border border-gray-200
            rounded
            px-3 py-2
            text-sm
            min-h-[90px]
            col-span-2
            resize-y
          "
        />
      </div>
    </section>
  );
}
