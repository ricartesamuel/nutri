"use client";
import { Plus, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableNutrientItem from "./SortableNutrientItem";
import type { NutrientRow } from "@/components/types/nutrition";

interface NutritionTableEditorProps {
  productName: string;
  setProductName: (name: string) => void;
  servings: string;
  setServings: (servings: string) => void;
  servingSize: string;
  setServingSize: (size: string) => void;
  nutrients: NutrientRow[];
  updateNutrient: (id: string, field: keyof NutrientRow, value: string) => void;
  removeNutrient: (id: string) => void;
  addNutrient: () => void;
  handleGoBack: () => void;
}

export default function NutritionTableEditor({
  productName,
  setProductName,
  servings,
  setServings,
  servingSize,
  setServingSize,
  nutrients,
  updateNutrient,
  removeNutrient,
  addNutrient,
  handleGoBack,
}: NutritionTableEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = nutrients.findIndex((i) => i.id === active.id);
      const newIndex = nutrients.findIndex((i) => i.id === over?.id);
      // We need to update the parent state through the updateNutrient function
      nutrients.forEach((nutrient, index) => {
        updateNutrient(nutrient.id, "id", nutrient.id);
      });
    }
  };

  return (
    <div className="max-w-xl">
      <Card className="p-6 bg-white shadow-sm">
        <div className="space-y-6">
          <div>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="text-2xl font-semibold border-none p-0 focus-visible:ring-0"
              placeholder="Nome do Produto"
            />
            <div className="h-px bg-gray-200 my-4" />
            <h2 className="text-gray-500 mb-4">Informações Nutricional</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="Porções por embalagem: 000 porções"
                className="pl-4 pr-8 py-2 w-full border border-gray-200 rounded-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <Input
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                placeholder="Porção: 000g"
                className="pl-4 pr-8 py-2 w-full border border-gray-200 rounded-lg"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Copy className="h-4 w-4" />
              </button>
            </div>
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

            <Button
              variant="outline"
              onClick={addNutrient}
              className="w-full justify-center text-gray-500 border-dashed border-2 hover:border-gray-400 hover:text-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="text-gray-500 hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <PrintButton />
          </div>
        </div>
      </Card>
    </div>
  );
}
