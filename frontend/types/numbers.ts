export type NumbersItem = {
  entity_type: string;
  entity_id: string;
  entity_name?: string;

  year: number;
  period: number;
  frequency: string;

  nb_numbers: number;         // ✅ volume brut
  nb_unique_numbers: number;  // ✅ diversité

  numbers_status: string;
};
