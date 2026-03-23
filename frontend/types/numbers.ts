export type NumbersItem = {
  entity_type: string;
  entity_id: string;
  entity_name?: string;

  year: number;
  period: number;
  frequency: string;

  nb_numbers: number;
  nb_unique_numbers: number;

  numbers_status: string;
};


type NumberItem = {
  id_content: string;
  label: string;
  value: string;
  unit: string;

  // 🔥 6 colonnes
  actor: string;
  market: string;
  period: string;

  topics?: {
    id: string;
    label: string;
    checked: boolean;
  }[];
};
