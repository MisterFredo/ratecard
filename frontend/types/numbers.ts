export type NumbersItem = {
  entity_type: string;
  entity_id: string;
  entity_name?: string;

  year: number;
  period: number;
  frequency: string;

  nb_contents: number;
  numbers_status: string;
};
