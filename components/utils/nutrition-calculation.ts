import type { NutrientRow } from "@/components/types/nutrition";

// update the dailyValues object to ensure it matches the nutrient names exactly

export const dailyValues = {
  "Valor energético (kcal)": 2000,
  "Carboidratos (g)": 300,
  "Açúcares totais (g)": 50,
  "Açúcares adicionados (g)": 50,
  "Proteínas (g)": 50,
  "Gorduras totais (g)": 65,
  "Gorduras saturadas (g)": 20,
  "Gorduras trans (g)": 0,
  "Fibras alimentares (g)": 25,
  "Sódio (mg)": 2000,
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

// Enhance the getIndentationLevel function to better detect sub-nutrients
export const getIndentationLevel = (nutrientName: string): number => {
  // normalize the nutrient name for comparison
  const normalizedName = nutrientName.toLowerCase().trim();

  // check if it's a direct child of Carboidratos
  if (
    normalizedName.includes("carboidrato") &&
    !normalizedName.includes("fibra")
  ) {
    return 0;
  }

  // check if it's Açúcares totais
  if (
    normalizedName.includes("açúcares totais") ||
    normalizedName.includes("acucares totais")
  ) {
    return 1;
  }

  // check if it's Açúcares adicionados (child of Açúcares totais)
  if (
    normalizedName.includes("açúcares adicionados") ||
    normalizedName.includes("acucares adicionados")
  ) {
    return 2;
  }

  // check if it's Gorduras totais
  if (normalizedName.includes("gorduras totais")) {
    return 0;
  }

  // check if it's a child of Gorduras totais
  if (
    (normalizedName.includes("gordura") ||
      normalizedName.includes("gorduras")) &&
    !normalizedName.includes("totais")
  ) {
    return 1;
  }

  // default case - no indentation
  return 0;
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
  // clean nutrient name to match the keys in dailyValues
  const cleanName =
    nutrientName.split("(")[0].trim() + " (" + nutrientName.split("(")[1];

  // skip calculation for certain nutrients
  if (
    cleanName === "Açúcares totais (g)" ||
    cleanName === "Gorduras trans (g)" ||
    !value ||
    value === "-" ||
    !servingSize
  )
    return "-";

  // get VD
  const dailyValue = dailyValues[cleanName as keyof typeof dailyValues];
  if (!dailyValue) return "-";

  // Parse the numeric values
  const numericValue = Number.parseFloat(value.replace(",", "."));
  const numericServingSize = Number.parseFloat(servingSize.replace(",", "."));

  if (isNaN(numericValue) || isNaN(numericServingSize)) return "-";

  // calculate the value per serving and the percentage of daily value
  const valuePerServing = (numericValue * numericServingSize) / 100;
  const vd = (valuePerServing / dailyValue) * 100;

  // Round and format the result
  const roundedVD = Math.round(vd);
  return isNaN(roundedVD) ? "-" : `${roundedVD}`;
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
