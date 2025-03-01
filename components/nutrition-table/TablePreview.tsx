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
  nutrientRelations,
} from "@/components/utils/nutrition-calculation";

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

  return (
    <div className="flex-1 bg-gray-50 p-8 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <Settings2 className="h-4 w-4 mr-2" />
              Options
            </Button>
          </div>
          <Button className="bg-purple-500 hover:bg-purple-600">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">{productName}</h2>

          <Card className="border-2 rounded-none border-black nutrition-card">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <div className="p-4">
                <h3 className="font-bold text-xl text-center mb-4">
                  INFORMAÇÃO NUTRICIONAL
                </h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    Porções por embalagem: {servings || "000"} porções
                  </p>
                  <p className="text-sm">
                    Porção: {servingSize || "000"} g (medida caseira)
                  </p>
                </div>
                <div className="border-t-2 border-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="text-left py-2 px-3"></th>
                        <th className="text-center py-2 px-3 border-l border-black">
                          100 g
                        </th>
                        <th className="text-center py-2 px-3 border-l border-black">
                          {servingSize || "000"} g
                        </th>
                        <th className="text-center py-2 px-3 border-l border-black">
                          %VD*
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {nutrients.map((nutrient, index) => {
                        const isSubClass = Object.values(nutrientRelations)
                          .flat()
                          .includes(nutrient.name);

                        return (
                          <tr
                            key={nutrient.id}
                            className="border-b border-black"
                          >
                            <td
                              className={`py-2 px-3 ${
                                isSubClass ? "pl-6" : ""
                              }`}
                            >
                              {nutrient.name}
                            </td>
                            <td className="text-center py-2 px-3 border-l border-black">
                              {nutrient.value || "-"}
                            </td>
                            <td className="text-center py-2 px-3 border-l border-black">
                              {nutrient.value
                                ? formatValue(
                                    (Number.parseFloat(nutrient.value) *
                                      Number.parseFloat(servingSize || "0")) /
                                      100
                                  )
                                : "-"}
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
                <p className="text-xs mt-4">
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
      </div>
    </div>
  );
}
