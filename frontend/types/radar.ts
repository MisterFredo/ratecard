export type RadarItem = {
  entity_type: string;
  entity_id: string;
  year: number;
  period: number;
  frequency: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  nb_contents: number;
  radar_status: "MISSING" | "EXISTS";
};
