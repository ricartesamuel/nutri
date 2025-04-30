"use client";

import { useState, useRef, useEffect } from "react";
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
  const [showDimensions, setShowDimensions] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // min cell height
  const ROW_MIN_HEIGHT = "20px";

  const formatEnergyValue = (nutrient: NutrientRow) => {
    // keep calculate kJ but only display the kcal value
    if (
      nutrient.name.toLowerCase().includes("valor energético") &&
      nutrient.unit === "kcal" &&
      nutrient.value
    ) {
      // return only the kcal value without kj
      return nutrient.value || "-";
    }
    return nutrient.value || "-";
  };

  const tableWidth = 324;
  const baseNutrientCount = 10;

  const cellStyle = {
    minHeight: ROW_MIN_HEIGHT,
    height: ROW_MIN_HEIGHT,
    verticalAlign: "middle" as const,
    lineHeight: "1.4",
  };

  const rowStyle = {
    minHeight: ROW_MIN_HEIGHT, // 20px
  };

  const handleShowDimensions = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowDimensions(true);
  };

  const handleHideDimensions = () => {
    // timeout to hide dimensions
    hideTimeoutRef.current = setTimeout(() => {
      setShowDimensions(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center w-full h-full p-4">
      <div className="table-preview-container">
        <div className="relative">
          {showDimensions && (
            <div
              className="absolute -top-28 left-0 right-0 flex items-center justify-center gap-4 z-10"
              onMouseEnter={handleShowDimensions}
              onMouseLeave={handleHideDimensions}
            >
              <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200 flex gap-3">
                <div className="flex items-center gap-1">
                  <label
                    htmlFor="width-input"
                    className="text-xs text-gray-600"
                  >
                    Largura:
                  </label>
                  <input
                    id="width-input"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-16 h-6 text-xs border border-gray-300 rounded px-1"
                    min="1"
                    max="100"
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
                <div className="flex items-center gap-1">
                  <label
                    htmlFor="height-input"
                    className="text-xs text-gray-600"
                  >
                    Altura:
                  </label>
                  <input
                    id="height-input"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-16 h-6 text-xs border border-gray-300 rounded px-1"
                    min="1"
                    max="100"
                  />
                  <span className="text-xs text-gray-600">cm</span>
                </div>
              </div>
            </div>
          )}

          {showDimensions && (
            <>
              {/* dimension line width */}
              <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
                <div className="relative w-full">
                  <div
                    className="absolute left-0 right-0 border-t border-gray-400"
                    style={{ top: "50%" }}
                  ></div>
                  <div
                    className="absolute left-0 h-2 border-l border-gray-400"
                    style={{ top: "calc(50% - 1px)" }}
                  ></div>
                  <div
                    className="absolute right-0 h-2 border-r border-gray-400"
                    style={{ top: "calc(50% - 1px)" }}
                  ></div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#e6f2f5] px-2 text-xs text-gray-600">
                    {width}cm
                  </div>
                </div>
              </div>

              {/* dimension line height */}
              <div className="absolute -right-8 top-0 bottom-0 flex items-center justify-center">
                <div className="relative h-full">
                  <div
                    className="absolute top-0 bottom-0 border-r border-gray-400"
                    style={{ left: "50%" }}
                  ></div>
                  <div
                    className="absolute top-0 w-2 border-t border-gray-400"
                    style={{ left: "calc(50% - 1px)" }}
                  ></div>
                  <div
                    className="absolute bottom-0 w-2 border-b border-gray-400"
                    style={{ left: "calc(50% - 1px)" }}
                  ></div>
                  <div
                    className="absolute top-1/2 transform -translate-y-1/2 bg-[#e6f2f5] px-2 text-xs text-gray-600"
                    style={{ right: "-24px" }}
                  >
                    {height}cm
                  </div>
                </div>
              </div>
            </>
          )}

          <div
            className="border border-black shadow-sm nutrition-card"
            style={{
              width: `${tableWidth}px`,
              height: "auto",
              backgroundColor: "white",
              margin: "0 auto",
            }}
            onMouseEnter={handleShowDimensions}
            onMouseLeave={handleHideDimensions}
          >
            <div className="font-['Arial','Helvetica',sans-serif] text-black flex flex-col">
              <div className="border-b border-black">
                <h3
                  className="font-bold text-base text-center py-0.5 tracking-tighter"
                  style={{ fontWeight: 700 }}
                >
                  INFORMAÇÃO NUTRICIONAL
                </h3>
              </div>

              <div className="px-2 py-0.5 text-xs leading-tight">
                <p>Porções por embalagem: {servings || "000"}</p>
                <p>Porção: {servingSize || "000"} g (medida caseira)</p>
              </div>

              <div className="border-t-[3px] border-black">
                <table
                  className="w-full border-collapse text-xs table-auto"
                  style={{ minHeight: ROW_MIN_HEIGHT }}
                  id="tabela-nutricional"
                >
                  <thead>
                    <tr style={rowStyle} id="cabecalho-tabela">
                      <th
                        className="text-left py-0.5 px-2 font-normal w-[45%]"
                        style={cellStyle}
                      ></th>
                      <th
                        className="text-center font-medium py-0.5 px-2 border-l border-black w-[18%] whitespace-nowrap"
                        style={cellStyle}
                      >
                        100 g
                      </th>
                      <th
                        className="text-center font-medium py-0.5 px-2 border-l border-black w-[18%] whitespace-nowrap"
                        style={cellStyle}
                      >
                        {servingSize || "000"} g
                      </th>
                      <th
                        className="text-center font-medium py-0.5 px-2 border-l border-black w-[19%]"
                        style={cellStyle}
                      >
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

                      // calculate VD for this nutrient
                      const vdValue = calculateVD(
                        nutrient.name,
                        nutrient.value,
                        servingSize,
                        nutrients
                      );

                      const isAcucaresAdicionados = nutrient.name
                        .toLowerCase()
                        .includes("açúcares adicionados");

                      return (
                        <tr
                          key={nutrient.id}
                          className="border-t border-black linha-nutriente"
                          style={rowStyle}
                          id={`linha-nutriente-${index}`}
                        >
                          <td
                            className={`py-0.5 px-2 font-normal ${
                              isAcucaresAdicionados ? "whitespace-nowrap" : ""
                            } ${
                              indentLevel === 1
                                ? "pl-4 nutrient-indent-level-1"
                                : indentLevel === 2
                                ? "pl-6 nutrient-indent-level-2"
                                : ""
                            }`}
                            style={{
                              ...cellStyle,
                              maxWidth: isAcucaresAdicionados
                                ? "none"
                                : "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              paddingLeft:
                                indentLevel === 1
                                  ? "16px"
                                  : indentLevel === 2
                                  ? "24px"
                                  : "8px", // padding for PDF
                            }}
                          >
                            {nutrient.name}
                          </td>
                          <td
                            className="text-center py-0.5 px-2 border-l border-black whitespace-nowrap"
                            style={cellStyle}
                          >
                            {displayValue}
                          </td>
                          <td
                            className="text-center py-0.5 px-2 border-l border-black whitespace-nowrap"
                            style={cellStyle}
                          >
                            {valuePerServing}
                          </td>
                          <td
                            className="text-center py-0.5 px-2 border-l border-black whitespace-nowrap"
                            style={cellStyle}
                          >
                            {vdValue}
                          </td>
                        </tr>
                      );
                    })}

                    {/* empty slots to maintain dimensions */}
                    {nutrients.length < baseNutrientCount &&
                      Array.from({
                        length: baseNutrientCount - nutrients.length,
                      }).map((_, index) => (
                        <tr
                          key={`empty-${index}`}
                          className="border-t border-black linha-vazia"
                          style={rowStyle}
                          id={`linha-vazia-${index}`}
                        >
                          <td className="py-0.5 px-2" style={cellStyle}></td>
                          <td
                            className="py-0.5 px-2 border-l border-black"
                            style={cellStyle}
                          ></td>
                          <td
                            className="py-0.5 px-2 border-l border-black"
                            style={cellStyle}
                          ></td>
                          <td
                            className="py-0.5 px-2 border-l border-black"
                            style={cellStyle}
                          ></td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {/* footer */}
                <div className="border-t border-black px-2 py-0.5 text-[9px]">
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
