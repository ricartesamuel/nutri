"use client";
import { Plus, ArrowLeft, Edit2, Edit } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRef, useEffect } from "react";
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
  arrayMove,
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
  setNutrients: (nutrients: NutrientRow[]) => void;
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
  setNutrients,
}: NutritionTableEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = nutrients.findIndex((i) => i.id === active.id);
      const newIndex = nutrients.findIndex((i) => i.id === over.id);
      const newNutrients = arrayMove(nutrients, oldIndex, newIndex);
      setNutrients(newNutrients);
    }
  };

  const handleServingSizeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      e.currentTarget.blur();
    }
  };

  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length <= 4) {
      // 4 chars?
      setServingSize(value);
    }
  };

  // scroll newly
  useEffect(() => {
    if (lastItemRef.current && nutrients[nutrients.length - 1]?.name === "") {
      lastItemRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [nutrients, nutrients.length]);

  {
    /* Left-side Form */
  }
  return (
    <div className="max-w-xl h-full border-brand-primary/20 border-2 rounded-sm">
      <Card className="p-6 bg-white shadow-sm border border-brand-primary/10 h-full flex flex-col">
        <div className="space-y-6 font-nutrient flex-1 flex flex-col">
          <div>
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-brand-primary/60 hover:text-brand-primary hover:bg-brand-primary/5 text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex items-center justify-center gap-3 mb-4">
              {isEditingTitle ? (
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-center text-3xl font-semibold border-brand-primary/20 focus-visible:ring-brand-primary/20 max-w-xs"
                />
              ) : (
                <h1 className="text-3xl font-semibold text-center text-brand-primary">
                  {productName}
                </h1>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditingTitle(true)}
                className="h-8 w-8 text-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-px bg-brand-primary/10 my-4" />
          </div>

          <div className="space-y-4">
            <div className="relative w-3/5">
              <Input
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                onKeyDown={handleServingSizeKeyDown}
                placeholder="Porções por embalagem: 000 porções"
                className="pl-4 pr-8 py-2 w-full border-brand-primary/20 rounded-lg focus-visible:ring-brand-primary/20"
              />
            </div>

            <div className="relative w-3/5">
              <Input
                value={servingSize}
                onChange={handleServingSizeChange}
                onKeyDown={handleServingSizeKeyDown}
                placeholder="Porção: 000g"
                className="pl-4 pr-8 py-2 w-full border-brand-primary/20 rounded-lg focus-visible:ring-brand-primary/20"
                maxLength={4}
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth border-brand-primary border rounded-sm"
            style={{ maxHeight: "400px" }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={nutrients.map((n) => n.id)}
                strategy={verticalListSortingStrategy}
              >
                {nutrients.map((nutrient, index) => (
                  <div
                    key={nutrient.id}
                    ref={index === nutrients.length - 1 ? lastItemRef : null}
                  >
                    <SortableNutrientItem
                      nutrient={nutrient}
                      nutrients={nutrients}
                      updateNutrient={updateNutrient}
                      removeNutrient={removeNutrient}
                      isNew={
                        index === nutrients.length - 1 && nutrient.name === ""
                      }
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>

          <Button
            variant="outline"
            onClick={addNutrient}
            className="ml-44 w-40 justify-center text-brand-primary border-brand-primary/20 border-2 hover:border-brand-primary/40 hover:text-brand-primary/80 hover:bg-brand-primary/5"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </Card>
    </div>
  );
}
