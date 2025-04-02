import type { NutrientRow } from "@/components/types/nutrition";
import {
  calculateVD,
  formatValue,
  getIndentationLevel,
} from "@/components/utils/nutrition-calculation";

interface NutritionTablePreviewProps {
  productName: string;
  servings: string;
  setServings?: (servings: string) => void;
  servingSize: string;
  setServingSize?: (servingSize: string) => void;
  nutrients: NutrientRow[];
  columns: number;
  setColumns: (columns: number) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  hideSettings?: boolean;
}

export default function NutritionTablePreview({
  productName,
  servings,
  setServings,
  servingSize,
  setServingSize,
  nutrients,
  columns,
  setColumns,
  width,
  setWidth,
  height,
  setHeight,
}: NutritionTablePreviewProps) {
  // Modificar a função formatEnergyValue para garantir que não haja quebra de linha
  const formatEnergyValue = (nutrient: NutrientRow) => {
    if (
      nutrient.name.toLowerCase().includes("valor energético") &&
      nutrient.unit === "kcal" &&
      nutrient.kjValue &&
      nutrient.value
    ) {
      return `${nutrient.value || "-"} (${nutrient.kjValue} kJ)`;
    }
    return nutrient.value || "-";
  };

  // Largura base do preview em pixels
  const previewWidth = 300;
  // Altura mínima do preview (pode crescer com base no conteúdo)
  const minPreviewHeight = 360;
  // Altura adicional por nutriente além do número base
  const heightPerExtraNutrient = 20;
  // Número base de nutrientes para o qual a altura mínima foi calculada
  const baseNutrientCount = 10;
  // Calcular altura adicional se houver mais nutrientes que o número base
  const extraHeight =
    Math.max(0, nutrients.length - baseNutrientCount) * heightPerExtraNutrient;
  // Altura final do preview
  const previewHeight = minPreviewHeight + extraHeight;

  return (
    <div className="flex-1 flex items-center justify-center w-full h-full">
      <div className="mx-auto">
        <div className="flex justify-center">
          <div
            className="border border-black shadow-sm nutrition-card"
            style={{
              width: `${previewWidth}px`,
              minHeight: `${minPreviewHeight}px`,
              height: "auto",
              backgroundColor: "white",
            }}
          >
            <div className="font-['Arial'] text-black flex flex-col">
              <div className="border-b border-black">
                <h3
                  className="font-extrabold text-base text-center py-1 tracking-wide"
                  style={{ fontWeight: 900 }}
                >
                  INFORMAÇÃO NUTRICIONAL
                </h3>
              </div>

              <div className="px-2 py-0.5 text-xs leading-tight">
                <p>Porções por embalagem: {servings || "000"}</p>
                <p>Porção: {servingSize || "000"} g (medida caseira)</p>
              </div>

              <div className="border-t-[3px] border-black">
                <table className="w-full border-collapse text-xs table-auto">
                  <thead>
                    <tr>
                      <th className="text-left py-1 px-2 font-normal w-[55%]"></th>
                      <th className="text-center py-1 px-1 border-l border-black font-normal w-[15%] whitespace-nowrap">
                        100 g
                      </th>
                      <th className="text-center py-1 px-1 border-l border-black font-normal w-[15%] whitespace-nowrap">
                        {servingSize || "000"}&nbsp;g
                      </th>
                      <th className="text-center py-1 px-1 border-l border-black font-normal w-[15%]">
                        %VD*
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutrients.map((nutrient, index) => {
                      // use the depth property from the nutrient if available, otherwise use getIndentationLevel
                      const indentLevel =
                        nutrient.depth !== undefined
                          ? nutrient.depth
                          : getIndentationLevel(nutrient.name);

                      const valuePerServing = nutrient.value
                        ? formatValue(
                            (Number.parseFloat(
                              nutrient.value.replace(",", ".")
                            ) *
                              Number.parseFloat(servingSize || "0")) /
                              100
                          )
                        : "-";

                      const displayValue = formatEnergyValue(nutrient);

                      // Calculate VD for this nutrient
                      const vdValue = calculateVD(
                        nutrient.name,
                        nutrient.value,
                        servingSize,
                        nutrients
                      );

                      return (
                        <tr key={nutrient.id} className="border-t border-black">
                          <td
                            className={`py-1 px-2 font-normal whitespace-nowrap ${
                              indentLevel === 1
                                ? "pl-4"
                                : indentLevel === 2
                                ? "pl-6"
                                : ""
                            }`}
                            style={{
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {nutrient.name}
                          </td>
                          {/* avoid line break */}
                          <td className="text-center py-1 px-1 border-l border-black whitespace-nowrap">
                            {displayValue}
                          </td>
                          <td className="text-center py-1 px-1 border-l border-black whitespace-nowrap">
                            {valuePerServing}
                          </td>
                          <td className="text-center py-1 px-1 border-l border-black whitespace-nowrap">
                            {vdValue}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="border-t border-black px-2 py-1 text-[9px]">
                  *Percentual de valores diários fornecidos pela porção.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
