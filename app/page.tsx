"use client";

import { useState } from "react";
import HomeView from "@/components/nutrition-table/HomeView";
import NutritionTableEditor from "@/components/nutrition-table/TableEditor";
import NutritionTablePreview from "@/components/nutrition-table/TablePreview";
import type { NutrientRow } from "@/components/types/nutrition.ts";

type View = "home" | "editor";

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

  const handleGoBack = () => {
    setCurrentView("home");
  };

  const handleSelectTable = (selectedProductName: string) => {
    setProductName(selectedProductName);
    setCurrentView("editor");
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
            <NutritionTableEditor
              productName={productName}
              setProductName={setProductName}
              servings={servings}
              setServings={setServings}
              servingSize={servingSize}
              setServingSize={setServingSize}
              nutrients={nutrients}
              updateNutrient={updateNutrient}
              removeNutrient={removeNutrient}
              addNutrient={addNutrient}
              handleGoBack={handleGoBack}
            />

            {/* Right Side - Preview */}
            <NutritionTablePreview
              productName={productName}
              servings={servings}
              servingSize={servingSize}
              nutrients={nutrients}
              columns={columns}
              setColumns={setColumns}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
            />
          </div>
        )}
      </div>
    </div>
  );
}
