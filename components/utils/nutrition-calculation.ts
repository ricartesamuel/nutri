import type { NutrientRow } from "@/components/types/nutrition";

export const dailyValues = {
  "Valor energético (kcal)": 2000,
  "Carboídratos (g)": 300,
  "Açúcares adicionados (g)": 50,
  "Proteínas (g)": 75,
  "Gorduras totais (g)": 55,
  "Gorduras saturadas (g)": 22,
  "Fibras alimentares (g)": 25,
  "Sódio (mg)": 2000,
};

export const nutrientRelations = {
  "Carboidratos (g)": ["Açúcares totais (g)"],
  "Açúcares totais (g)": ["Açúcares adicionados (g)"],
  "Gorduras totais (g)": ["Gorduras saturadas (g)", "Gordura trans (g)"],
};

export const calculateEnergyKJ = (
  carbs: number,
  proteins: number,
  fats: number
) => {
  return carbs * 17 + proteins * 17 + fats * 37;
};

export const calculateVD = (
  nutrientName: string,
  value: string,
  servingSize: string,
  nutrients: NutrientRow[]
) => {
  if (nutrientName === "Açúcares totais (g)") return "-";

  const dailyValue = dailyValues[nutrientName as keyof typeof dailyValues];
  if (!dailyValue || !value || !servingSize) return "-";

  const numericValue = Number.parseFloat(value.replace(",", "."));
  const numericServingSize = Number.parseFloat(servingSize.replace(",", "."));

  if (isNaN(numericValue) || isNaN(numericServingSize)) return "-";

  const valuePerServing = (numericValue * numericServingSize) / 100;
  const vd = (valuePerServing / dailyValue) * 100;

  const roundedVD = Math.floor(vd + 0.5);
  return `${roundedVD}%`;
};

export const formatValue = (value: number) => {
  if (value === 0) {
    return "0";
  } else if (value < 1) {
    const roundedValue = Math.round(value * 10) / 10;
    return roundedValue.toFixed(1);
  } else {
    const roundedValue = Math.round(value);
    return roundedValue.toString();
  }
};
