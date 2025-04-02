export interface Nutrient {
  id: string;
  name: string;
  value: string;
  unit: string;
  depth?: number;
  kjValue?: string;
  collapsed?: boolean;
  parentId?: string;
}

export type NutrientRow = Nutrient;

export interface NutrientRelations {
  [key: string]: string[];
}

export interface DailyValues {
  [key: string]: number;
}
