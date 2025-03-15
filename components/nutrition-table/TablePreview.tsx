"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Settings2 } from "lucide-react";
import type { NutrientRow } from "@/components/types/nutrition";
import {
  calculateVD,
  formatValue,
  getIndentationLevel,
} from "@/components/utils/nutrition-calculation";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PrintButton from "@/components/PrintButton";

interface NutritionTablePreviewProps {
  productName: string;
  servings: string;
  servingSize: string;
  nutrients: NutrientRow[];
  columns: number;
  setColumns: (columns: number) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
}

export default function NutritionTablePreview({
  productName,
  servings,
  servingSize,
  nutrients,
  columns,
  setColumns,
  width,
  setWidth,
  height,
  setHeight,
}: NutritionTablePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplySettings = () => {
    setIsModalOpen(false);
  };

  const handleExportToPDF = () => {
    const cardElement = document.querySelector(
      ".nutrition-card"
    ) as HTMLElement;

    if (cardElement) {
      html2canvas(cardElement, {
        scale: 3,
        logging: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", [50, 60]);
        const imgWidth = 50;
        const imgHeight = 60;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("tabela_nutricional.pdf");
      });
    }
  };

  // kj value
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

  return (
    <div className="flex-1 bg-transparent p-8 rounded-lg shadow-sm">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary ml-3"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Opções
            </Button>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <PrintButton />
            <Button
              className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
              onClick={handleExportToPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="relative mt-14">
          {/* horizontal dimension* */}
          <div className="absolute -top-10 left-0 right-0 flex justify-center items-center">
            <div className="relative w-full">
              <span className="absolute top-7 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg text-brand-primary/60 px-2 font-semibold">
                50cm
              </span>
            </div>
          </div>

          <div className="bg-transparent p-4 border-none shadow-sm transform scale-90 origin-top">
            <Card className="border-2 rounded-none border-black nutrition-card">
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <div className="p-1 font-nutrient">
                  <h3 className="font-black text-3xl text-center mb-3">
                    INFORMAÇÃO NUTRICIONAL
                  </h3>
                  <div className="border-b border-black mb-2"></div>
                  <div className="space-y-2 mb-2">
                    <p className="text-base">
                      Porções por embalagem: {servings || "000"} porções
                    </p>
                    <p className="text-base">
                      Porção: {servingSize || "000"} g (medida caseira)
                    </p>
                  </div>
                  <div className="border-t-8 p-2 border-black">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black">
                          <th className="text-left py-2 px-3 font-semibold"></th>
                          <th className="text-center py-2 px-3 border-l border-black font-semibold">
                            100 g
                          </th>
                          <th className="text-center py-2 px-3 border-l border-black font-semibold">
                            {servingSize || "000"} g
                          </th>
                          <th className="text-center py-2 px-3 border-l border-black font-semibold">
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

                          return (
                            <tr
                              key={nutrient.id}
                              className="border-b border-black"
                            >
                              <td
                                className={`py-2 px-3 font-semibold ${
                                  indentLevel === 1
                                    ? "pl-6"
                                    : indentLevel === 2
                                    ? "pl-9"
                                    : ""
                                }`}
                              >
                                {nutrient.name}
                              </td>
                              <td className="text-center py-2 px-3 border-l border-black">
                                {displayValue}
                              </td>
                              <td className="text-center py-2 px-3 border-l border-black">
                                {valuePerServing}
                              </td>
                              <td className="text-center py-2 px-3 border-l border-black">
                                {calculateVD(
                                  nutrient.name,
                                  nutrient.value,
                                  servingSize,
                                  nutrients
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm mt-2 font-semibold">
                    *Percentual de valores diários fornecidos pela porção.
                  </p>
                </div>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurações da Tabela</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="columns" className="text-right">
                        Colunas
                      </Label>
                      <Select
                        value={columns.toString()}
                        onValueChange={(value) =>
                          setColumns(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecione o número de colunas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="width" className="text-right">
                        Largura
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) =>
                          setWidth(Number.parseInt(e.target.value))
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="height" className="text-right">
                        Altura
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) =>
                          setHeight(Number.parseInt(e.target.value))
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Descartar
                    </Button>
                    <Button onClick={handleApplySettings}>Aplicar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
          {/* vertical dimension */}
          <div className="absolute -right-12 top-0 flex items-center">
            <div className="nutrition-dimension-line relative">
              <span className="font-semibold fixed right-52 top-1/2 -translate-y-1/2 text-lg text-brand-primary/60 px-16 transform rotate-90 whitespace-nowrap">
                60cm
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
