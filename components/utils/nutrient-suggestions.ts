export interface NutrientSuggestion {
  name: string;
  unit: string;
  category?: string;
}

export const nutrientSuggestions: NutrientSuggestion[] = [
  // macronutrientes
  { name: "Valor energético(kcal)", unit: "kcal" },
  { name: "Carboidratos(g)", unit: "g" },
  { name: "Proteínas(g)", unit: "g" },

  // açúcares
  { name: "Açúcares totais(g)", unit: "g" },
  { name: "Açúcares adicionados(g)", unit: "g" },

  // gorduras
  { name: "Gorduras totais(g)", unit: "g" },
  { name: "Gorduras saturadas(g)", unit: "g" },
  { name: "Gorduras trans(g)", unit: "g" },
  { name: "Gorduras monoinsaturadas(g)", unit: "g" },
  { name: "Gorduras poli-insaturadas(g)", unit: "g" },

  // outros
  { name: "Colesterol(mg)", unit: "mg" },
  { name: "Fibras alimentares(g)", unit: "g" },
  { name: "Sódio(mg)", unit: "mg" },

  // vitaminas
  { name: "Vitamina A(µg)", unit: "µg", category: "Vitaminas" },
  { name: "Vitamina D(µg)", unit: "µg", category: "Vitaminas" },
  { name: "Vitamina E(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Vitamina K(µg)", unit: "µg", category: "Vitaminas" },
  { name: "Vitamina C(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Tiamina(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Riboflavina(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Niacina(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Vitamina B6(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Biotina(µg)", unit: "µg", category: "Vitaminas" },
  { name: "Ácido fólico(µg)", unit: "µg", category: "Vitaminas" },
  { name: "Ácido pantotênico(mg)", unit: "mg", category: "Vitaminas" },
  { name: "Vitamina B12(µg)", unit: "µg", category: "Vitaminas" },

  // minerais
  { name: "Cálcio(mg)", unit: "mg", category: "Minerais" },
  { name: "Cloreto(mg)", unit: "mg", category: "Minerais" },
  { name: "Cobre(µg)", unit: "µg", category: "Minerais" },
  { name: "Cromo(µg)", unit: "µg", category: "Minerais" },
  { name: "Ferro(mg)", unit: "mg", category: "Minerais" },
  { name: "Flúor(mg)", unit: "mg", category: "Minerais" },
  { name: "Fósforo(mg)", unit: "mg", category: "Minerais" },
  { name: "Iodo(µg)", unit: "µg", category: "Minerais" },
  { name: "Magnésio(mg)", unit: "mg", category: "Minerais" },
  { name: "Manganês(mg)", unit: "mg", category: "Minerais" },
  { name: "Molibdênio(µg)", unit: "µg", category: "Minerais" },
  { name: "Potássio(mg)", unit: "mg", category: "Minerais" },
  { name: "Selênio(µg)", unit: "µg", category: "Minerais" },
  { name: "Zinco(mg)", unit: "mg", category: "Minerais" },
  { name: "Colina(mg)", unit: "mg", category: "Minerais" },
];

export function getSuggestions(query: string): NutrientSuggestion[] {
  if (!query) return nutrientSuggestions;

  const normalizedQuery = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return nutrientSuggestions.filter((suggestion) => {
    const normalizedName = suggestion.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return normalizedName.includes(normalizedQuery);
  });
}
