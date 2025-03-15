import type { NutrientRow } from "@/components/types/nutrition";

export const dailyValues = {
  "Valor energético(kcal)": 2000,
  "Carboidratos(g)": 300,
  "Açúcares adicionados(g)": 50,
  "Proteínas(g)": 50,
  "Gorduras totais(g)": 65,
  "Gorduras saturadas(g)": 20,
  "Fibras alimentares(g)": 25,
  "Sódio(mg)": 2000,
};

export const nutrientRelations = {
  "Carboidratos(g)": ["Açúcares totais(g)"],
  "Açúcares totais(g)": ["Açúcares adicionados(g)"],
  "Gorduras totais(g)": ["Gorduras saturadas(g)", "Gorduras trans(g)"],
};

export const isSubNutrient = (nutrientName: string): boolean => {
  return Object.values(nutrientRelations).flat().includes(nutrientName);
};

export const getParentNutrient = (nutrientName: string): string | null => {
  for (const [parent, children] of Object.entries(nutrientRelations)) {
    if (children.includes(nutrientName)) {
      return parent;
    }
  }
  return null;
};

export const getIndentationLevel = (nutrientName: string): number => {
  // subnutrient
  const parent = getParentNutrient(nutrientName);
  if (!parent) return 0;

  const grandparent = getParentNutrient(parent);
  if (grandparent) return 2;

  return 1;
};

export const calculateEnergyKJ = (
  carbs: number,
  proteins: number,
  fats: number
) => {
  // carboidratos: 1g = 4 kcal = 16,8 kJ
  // proteínas: 1g = 4 kcal = 16,8 kJ
  // gorduras: 1g = 9 kcal = 37,8 kJ
  return carbs * 16.8 + proteins * 16.8 + fats * 37.8;
};

export const calculateVD = (
  nutrientName: string,
  value: string,
  servingSize: string,
  nutrients: NutrientRow[]
) => {
  if (nutrientName === "Açúcares totais(g)") return "-";

  const dailyValue = dailyValues[nutrientName as keyof typeof dailyValues];
  if (!dailyValue || !value || !servingSize) return "-";

  const numericValue = Number.parseFloat(value.replace(",", "."));
  const numericServingSize = Number.parseFloat(servingSize.replace(",", "."));

  if (isNaN(numericValue) || isNaN(numericServingSize)) return "-";

  const valuePerServing = (numericValue * numericServingSize) / 100;
  const vd = (valuePerServing / dailyValue) * 100;

  const roundedVD = Math.round(vd);
  return `${roundedVD}%`;
};

export const formatValue = (value: number) => {
  if (value === 0) {
    return "0";
  } else if (value < 10) {
    const rounded = Math.round(value * 10) / 10;
    return rounded.toFixed(1).replace(".", ",");
  } else {
    return Math.round(value).toString();
  }
};

export const calculateValuePerServing = (
  value: string,
  servingSize: string
) => {
  const numericValue = Number.parseFloat(value.replace(",", "."));
  const numericServingSize = Number.parseFloat(servingSize.replace(",", "."));

  if (isNaN(numericValue) || isNaN(numericServingSize)) return "-";

  const result = (numericValue * numericServingSize) / 100;
  return formatValue(result);
};
