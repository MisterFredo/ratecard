export type LLMItem = {
  value: string;
  count: number;

  // 🔥 nouveaux champs
  type_hint?: "company" | "solution" | "unknown";
  suggested_id?: string | null;
  suggested_label?: string | null;
};

export type Solution = {
  id_solution: string;
  name: string;
};

export type Company = {
  id_company: string;
  name: string;
};
