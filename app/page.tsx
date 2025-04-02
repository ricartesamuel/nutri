"use client";

import { useState } from "react";
import HomeView from "@/components/nutrition-table/HomeView";
import { NutrientTree } from "@/components/nutrition-table/NutrientTree";
import NutritionTablePreview from "@/components/nutrition-table/TablePreview";
import OptionsTab from "@/components/nutrition-table/OptionsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { NutrientRow } from "@/components/types/nutrition.ts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { PrintButton } from "@/components/ui/print-button";

type View = "home" | "editor";

export default function NutritionTable() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [productName, setProductName] = useState("Pão de Forma");
  const [servingSize, setServingSize] = useState("");
  const [servings, setServings] = useState("");
  const [nutrients, setNutrients] = useState<NutrientRow[]>([
    { id: "1", name: "Valor energético (kcal)", value: "", unit: "kcal" },
    { id: "2", name: "Carboidratos (g)", value: "", unit: "g" },
    { id: "3", name: "Açúcares totais (g)", value: "", unit: "g" },
    {
      id: "4",
      name: "Açúcares adicionados (g)",
      value: "",
      unit: "g",
      parentId: "3",
    },
    { id: "5", name: "Proteínas (g)", value: "", unit: "g" },
    {
      id: "6",
      name: "Gorduras totais (g)",
      value: "",
      unit: "g",
      collapsed: true,
    },
    {
      id: "7",
      name: "Gorduras saturadas (g)",
      value: "",
      unit: "g",
      parentId: "6",
    },
    {
      id: "8",
      name: "Gorduras trans (g)",
      value: "",
      unit: "g",
      parentId: "6",
    },
    { id: "9", name: "Fibras alimentares (g)", value: "", unit: "g" },
    { id: "10", name: "Sódio (mg)", value: "", unit: "mg" },
  ]);
  const [columns, setColumns] = useState(3);
  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(60);
  const [activeTab, setActiveTab] = useState("nutrientes");

  const handleGoBack = () => {
    setCurrentView("home");
  };

  const handleSelectTable = (selectedProductName: string) => {
    setProductName(selectedProductName);
    setCurrentView("editor");
  };

  const handleExportToPDF = () => {
    // Create a hidden clone of the table without scaling for export
    const originalCard = document.querySelector(
      ".nutrition-card"
    ) as HTMLElement;
    if (!originalCard) return;

    const clone = originalCard.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "-9999px";

    // Ensure the border is visible in the clone
    clone.style.border = "1px solid black";

    document.body.appendChild(clone);

    html2canvas(clone, {
      scale: 3,
      logging: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Base dimensions
      const baseWidth = 50; // mm
      const baseHeight = 60; // mm

      // Calculate additional height based on number of nutrients
      const baseNutrientCount = 10;
      const extraHeightPerNutrient = 5; // mm per extra nutrient
      const extraHeight =
        Math.max(0, nutrients.length - baseNutrientCount) *
        extraHeightPerNutrient;

      // Final dimensions for PDF
      const pdfWidth = baseWidth;
      const pdfHeight = baseHeight + extraHeight;

      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

      // Maintain aspect ratio when adding image to PDF
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("tabela_nutricional.pdf");

      // Remove the clone after export
      document.body.removeChild(clone);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-secondary/5 to-brand-primary/5">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 w-full">
          <div className="flex items-center">
            <img
              src="/favicon-192.png"
              alt="Logo Nutri"
              className="h-6 w-6 mr-2 rounded-sm hover:opacity-80 transition-opacity duration-500"
            />
            <h1 className="text-xl font-medium text-brand-primary">Nutri</h1>
          </div>
          {currentView === "editor" && (
            <div className="flex items-center gap-2">
              <PrintButton />
              <Button
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleExportToPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto py-0">
        {currentView === "home" ? (
          <HomeView onSelectTable={handleSelectTable} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-primary/10 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="grid lg:grid-cols-[480px,1fr] h-[calc(100vh-56px)]">
                <div className="border-r border-primary/10 pl-0 overflow-hidden">
                  <Tabs
                    defaultValue="nutrientes"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full h-full flex flex-col"
                  >
                    <TabsList className="grid grid-cols-2 w-full rounded-none border-b border-primary/10 sticky top-0 bg-white z-10">
                      <TabsTrigger
                        value="nutrientes"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                      >
                        Nutrientes
                      </TabsTrigger>
                      <TabsTrigger
                        value="aba2"
                        className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                      >
                        Opções
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="nutrientes"
                      className="p-0 m-0 flex-1 overflow-hidden"
                    >
                      <NutrientTree
                        nutrients={nutrients}
                        setNutrients={setNutrients}
                        productName={productName}
                        setProductName={setProductName}
                        servings={servings}
                        setServings={setServings}
                        servingSize={servingSize}
                        setServingSize={setServingSize}
                        handleGoBack={handleGoBack}
                        hideHeader={false}
                      />
                    </TabsContent>

                    <TabsContent
                      value="aba2"
                      className="p-0 m-0 flex-1 overflow-auto"
                    >
                      <OptionsTab
                        columns={columns}
                        setColumns={setColumns}
                        width={width}
                        setWidth={setWidth}
                        height={height}
                        setHeight={setHeight}
                        servingSize={servingSize}
                        setServingSize={setServingSize}
                        servings={servings}
                        setServings={setServings}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex items-center justify-center w-full h-full bg-[#f8f9fa] bg-opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden">
                  <div className="flex items-center justify-center w-full h-full">
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
                      hideSettings={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
