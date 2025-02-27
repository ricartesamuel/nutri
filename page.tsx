"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Share,
  Link,
  FileText,
  Image,
  FileImage,
  FileIcon as FileVector,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintButton } from "@/components/PrintButton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type View = "home" | "editor";

interface Nutrient {
  id: string;
  name: string;
  value: string;
  unit: string;
}

const dailyValues = {
  "Valor energético (kcal)": 2000,
  "Carboídratos (g)": 300,
  "Açúcares adicionados (g)": 50,
  "Proteínas (g)": 75,
  "Gorduras totais (g)": 55,
  "Gorduras saturadas (g)": 22,
  "Fibras alimentares (g)": 25,
  "Sódio (mg)": 2000,
};

const nutrientRelations = {
  "Carboidratos (g)": ["Açúcares totais (g)"],
  "Açúcares totais (g)": ["Açúcares adicionados (g)"],
  "Gorduras totais (g)": ["Gorduras saturadas (g)", "Gordura trans (g)"],
};

const calculateEnergyKJ = (carbs: number, proteins: number, fats: number) => {
  return carbs * 17 + proteins * 17 + fats * 37;
};

const calculateVD = (
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

const formatValue = (value: number) => {
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

function SortableNutrientItem({
  nutrient,
  updateNutrient,
  removeNutrient,
}: {
  nutrient: Nutrient;
  updateNutrient: (id: string, field: "name" | "value", value: string) => void;
  removeNutrient: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nutrient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-transparent p-2 rounded-lg ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <button
        className="cursor-grab hover:text-primary ml-[-32px]"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Input
        value={nutrient.name}
        onChange={(e) => {
          if (e.target.value.length <= 30) {
            updateNutrient(nutrient.id, "name", e.target.value);
          }
        }}
        placeholder="Nome do nutriente"
        className="max-w-[300px] w-full bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors max-w-[300px] text-left"
        maxLength={30}
      />
      <Input
        type="text"
        value={nutrient.value}
        onChange={(e) => {
          const value = e.target.value.replace(".", ",");
          if (/^\d*,?\d*$/.test(value) || value === "") {
            updateNutrient(nutrient.id, "value", value);
          }
        }}
        placeholder="Valor"
        className="bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors w-24"
        maxLength={5}
        onKeyDown={(e) => {
          if (
            !/[0-9,.]/.test(e.key) &&
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight"
          ) {
            e.preventDefault();
          }
        }}
      />
      <span className="text-sm text-muted-foreground w-8">{nutrient.unit}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeNutrient(nutrient.id)}
      >
        <Trash2 className="font-bold h-4 w-4" />
      </Button>
    </div>
  );
}

interface NutrientRow {
  id: string;
  name: string;
  value: string;
  unit: string;
}

function HomeView({
  onSelectTable,
}: {
  onSelectTable: (productName: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Selecione uma Tabela Nutricional
      </h1>
      <div className="grid gap-4">
        <Button
          onClick={() => onSelectTable("Pão de Forma")}
          className="w-48 text-left justify-start"
        >
          Pão de Forma
        </Button>
        <Button
          onClick={() => onSelectTable("Bolo de Chocolate")}
          className="w-48 text-left justify-start"
        >
          Bolo de Chocolate
        </Button>
        <Button
          onClick={() => onSelectTable("Suco de Laranja")}
          className="w-48 text-left justify-start"
        >
          Suco de Laranja
        </Button>
      </div>
    </div>
  );
}

export default function NutritionTable() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [productName, setProductName] = useState("Pão de Forma");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("");
  const [nutrients, setNutrients] = useState<NutrientRow[]>([
    { id: "1", name: "Valor energético (kcal)", value: "", unit: "kcal" },
    { id: "2", name: "Carboídratos (g)", value: "", unit: "g" },
    { id: "3", name: "Açúcares totais (g)", value: "", unit: "g" },
    { id: "4", name: "Açúcares adicionados (g)", value: "", unit: "g" },
    { id: "5", name: "Proteínas (g)", value: "", unit: "g" },
    { id: "6", name: "Gorduras totais (g)", value: "", unit: "g" },
    { id: "7", name: "Gorduras saturadas (g)", value: "", unit: "g" },
    { id: "8", name: "Gordura trans (g)", value: "", unit: "g" },
    { id: "9", name: "Fibras alimentares (g)", value: "", unit: "g" },
    { id: "10", name: "Sódio (mg)", value: "", unit: "mg" },
  ]);
  const [columns, setColumns] = useState(3);
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(60);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const shareOptions = [
    { name: "PDF", icon: FileText },
    { name: "PNG", icon: Image },
    { name: "EPS", icon: FileImage },
    { name: "SVG", icon: FileVector },
    { name: "Enviar Link", icon: Link },
  ];

  const addNutrient = () => {
    const newNutrient = {
      id: Date.now().toString(),
      name: "",
      value: "",
      unit: "",
    };
    setNutrients([...nutrients, newNutrient]);
  };

  const removeNutrient = (id: string) => {
    setNutrients(nutrients.filter((n) => n.id !== id));
  };

  const updateNutrient = (
    id: string,
    field: keyof NutrientRow,
    value: string
  ) => {
    setNutrients(
      nutrients.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setNutrients((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleApplySettings = () => {
    setIsModalOpen(false);
    // Apply the new settings here
  };

  const handleGoBack = () => {
    setCurrentView("home");
  };

  const handleSelectTable = (selectedProductName: string) => {
    setProductName(selectedProductName);
    setCurrentView("editor");
  };

  const handleShare = (option: string) => {
    console.log(`Sharing as ${option}`);
    setIsShareModalOpen(false);
  };

  {
    /* PDF Export */
  }
  const handleExportPDF = async () => {
    const cardElement = document.querySelector(
      ".nutrition-card"
    ) as HTMLElement;

    if (cardElement) {
      const canvas = await html2canvas(cardElement, {
        scale: 3,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [60, 60],
      });

      pdf.addImage(imgData, "PNG", 0, 0, 60, 60);
      pdf.save("tabela_nutricional.pdf");
    }
  };

  const handleShareOptionClick = (option: string) => {
    if (option === "PDF") {
      handleExportPDF();
    } else if (option === "PNG") {
      console.log("pngFunc");
    } else if (option === "SVG") {
      console.log("svgFunc");
    }

    setIsShareModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-blue-50/50">
      <div className="bg-transparent shadow-sm">
        <div className="container mx-auto p-4 flex items-center">
          <img
            src="/favicon-192.png"
            alt="Logo Nutri"
            className="h-10 w-10 mr-2 rounded-sm hover:opacity-80 transition-opacity duration-500"
          />
          <h1 className="text-3xl font-semibold">Nutri</h1>
        </div>
      </div>
      <div className="container mx-auto p-4">
        {currentView === "home" ? (
          <HomeView onSelectTable={handleSelectTable} />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Form */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                {" "}
                <div className="flex-grow text-center">
                  {" "}
                  <h1 className="text-3xl font-semibold">{productName}</h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black text-white hover:bg-gray-800 hover:text-white border-white px-4 py-2 rounded-lg transition-colors"
                >
                  Opções
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="productName">Nome do Produto</Label>
                  <Input
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors max-w-[300px] w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="servings">Porções por embalagem</Label>
                  <Input
                    id="servings"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                    placeholder="000 porções"
                    className="bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors max-w-[300px] w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="servingSize">Porção</Label>
                  <Input
                    id="servingSize"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="000g"
                    className="bg-white border-2 border-gray-300 rounded-lg hover:border-black transition-colors max-w-[300px] w-full"
                  />
                </div>

                <div className="space-y-2">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={nutrients.map((n) => n.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {nutrients.map((nutrient) => (
                        <SortableNutrientItem
                          key={nutrient.id}
                          nutrient={nutrient}
                          updateNutrient={updateNutrient}
                          removeNutrient={removeNutrient}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-grow"
                      onClick={addNutrient}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-grow"
                      onClick={() => setNutrients([])}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover Tudo
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleGoBack}>
                  Voltar
                </Button>
                <div className="flex gap-2">
                  <Dialog
                    open={isShareModalOpen}
                    onOpenChange={setIsShareModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Share className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Exportar</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {shareOptions.map((option) => (
                          <Button
                            key={option.name}
                            variant="outline"
                            onClick={() => handleShareOptionClick(option.name)}
                            className="justify-start"
                          >
                            <option.icon className="w-4 h-4 mr-2" />
                            {option.name}
                          </Button>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsShareModalOpen(false)}
                        >
                          Fechar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <PrintButton />
                </div>
              </div>
            </div>

            {/* Right Side - Preview */}
            <div className="min-h-screen bg-transparent flex items-start justify-center p-4">
              <div className="bg-white p-8 rounded-lg shadow max-w-[600px] w-full">
                <Card className="p-2 border-2 border-black rounded-none nutrition-card">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <h3 className="font-bold text-2xl text-center mb-1">
                          INFORMAÇÃO NUTRICIONAL
                        </h3>
                        <div className="border-b border-gray-300 mb-2"></div>{" "}
                        <p className="text-sm text-left">
                          Porções por embalagem: {servings || "000"} porções
                        </p>
                        <p className="text-sm text-left mb-2">
                          Porção: {servingSize || "000"} g (medida caseira)
                        </p>
                        <div className="border-2 border-black mb-2"></div>{" "}
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="text-left py-1 px-2 border-b border-r border-black"></th>
                              <th className="text-center py-1 px-2 border-b border-r border-black">
                                100 g
                              </th>
                              <th className="text-center py-1 px-2 border-b border-r border-black">
                                {servingSize || "000"} g
                              </th>
                              <th className="text-center py-1 px-2 border-b border-black">
                                %VD*
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {nutrients.map((nutrient, index) => {
                              const isSubClass = Object.values(
                                nutrientRelations
                              )
                                .flat()
                                .includes(nutrient.name);

                              return (
                                <tr key={nutrient.id}>
                                  <td
                                    className={`text-left py-1 px-2 ${
                                      index === nutrients.length - 1
                                        ? "border-b-2 border-black"
                                        : "border-b border-black"
                                    } border-r border-black ${
                                      isSubClass ? "pl-6" : ""
                                    }`}
                                  >
                                    {nutrient.name ===
                                    "Açúcares adicionados (g)"
                                      ? ` ${nutrient.name}`
                                      : nutrient.name}
                                  </td>

                                  {/* 100g */}
                                  <td
                                    className={`text-center py-1 px-2 ${
                                      index === nutrients.length - 1
                                        ? "border-b-2 border-black"
                                        : "border-b border-black"
                                    } border-r border-black`}
                                  >
                                    {nutrient.name === "Valor energético (kcal)"
                                      ? nutrient.value
                                        ? `${
                                            nutrient.value
                                          } + ${calculateEnergyKJ(
                                            Number.parseFloat(
                                              nutrients.find(
                                                (n) =>
                                                  n.name ===
                                                  "Carboidratos totais (g)"
                                              )?.value || "0"
                                            ),
                                            Number.parseFloat(
                                              nutrients.find(
                                                (n) =>
                                                  n.name === "Proteínas (g)"
                                              )?.value || "0"
                                            ),
                                            Number.parseFloat(
                                              nutrients.find(
                                                (n) =>
                                                  n.name ===
                                                  "Gorduras totais (g)"
                                              )?.value || "0"
                                            )
                                          )} kJ`
                                        : nutrient.value || "-"
                                      : nutrient.value || "-"}
                                  </td>

                                  {/* Porção */}
                                  <td
                                    className={`text-center py-1 px-2 ${
                                      index === nutrients.length - 1
                                        ? "border-b-2 border-black"
                                        : "border-b border-black"
                                    } border-r border-black`}
                                  >
                                    {nutrient.value
                                      ? formatValue(
                                          (Number.parseFloat(nutrient.value) *
                                            Number.parseFloat(
                                              servingSize || "0"
                                            )) /
                                            100
                                        )
                                      : "-"}
                                  </td>

                                  {/* %VD */}
                                  <td
                                    className={`text-center py-1 px-2 ${
                                      index === nutrients.length - 1
                                        ? "border-b-2 border-black"
                                        : "border-b border-black"
                                    }`}
                                  >
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
                        {/* Footer */}
                        <p className="text-xs text-left mt-1">
                          *Percentual de valores diários fornecidos pela porção.
                        </p>
                      </div>
                    </DialogTrigger>

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
        )}
      </div>
    </div>
  );
}
