"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Props = {
  llmSolutions: string[];
  llmCompanies: string[];
  llmConcepts: string[];

  onMatch: (data: {
    solutions?: any[];
    companies?: any[];
    concepts?: any[];
  }) => void;
};

export default function AutoContextMatcher({
  llmSolutions,
  llmCompanies,
  llmConcepts,
  onMatch,
}: Props) {

  const [allSolutions, setAllSolutions] = useState<any[]>([]);
  const [allCompanies, setAllCompanies] = useState<any[]>([]);
  const [allConcepts, setAllConcepts] = useState<any[]>([]);

  // ============================================================
  // LOAD REFERENTIALS ONCE
  // ============================================================

  useEffect(() => {

    async function loadAll() {

      try {

        const [s, c, k] = await Promise.all([
          api.get("/solution/list"),
          api.get("/company/list"),
          api.get("/concept/list"),
        ]);

        setAllSolutions(s.solutions || []);
        setAllCompanies(c.companies || []);
        setAllConcepts(k.concepts || []);

      } catch (e) {

        console.error("Erreur chargement référentiels", e);

      }

    }

    loadAll();

  }, []);

  // ============================================================
  // MATCHING
  // ============================================================

  useEffect(() => {

    function match(
      list: any[],
      llmValues: string[],
      field: string
    ) {

      return list.filter((item) =>
        llmValues.some((text) =>
          item[field]?.toLowerCase().includes(text.toLowerCase())
        )
      );

    }

    const matchedSolutions =
      llmSolutions.length && allSolutions.length
        ? match(allSolutions, llmSolutions, "name")
        : [];

    const matchedCompanies =
      llmCompanies.length && allCompanies.length
        ? match(allCompanies, llmCompanies, "name")
        : [];

    const matchedConcepts =
      llmConcepts.length && allConcepts.length
        ? match(allConcepts, llmConcepts, "title")
        : [];

    onMatch({
      solutions: matchedSolutions,
      companies: matchedCompanies,
      concepts: matchedConcepts,
    });

  }, [
    llmSolutions,
    llmCompanies,
    llmConcepts,
    allSolutions,
    allCompanies,
    allConcepts,
  ]);

  return null; // composant logique uniquement
}
