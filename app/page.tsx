"use client";

import { useState, useEffect } from "react";
import HomeView from "@/components/nutrition-table/HomeView";
import { NutrientTree } from "@/components/nutrition-table/NutrientTree";
import NutritionTablePreview from "@/components/nutrition-table/TablePreview";
import OptionsTab from "@/components/nutrition-table/OptionsTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Menu, Printer } from "lucide-react";
import type { NutrientRow } from "@/components/types/nutrition.ts";
import { PrintButton } from "@/components/ui/print-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  useMediaQuery,
  useIsMobileOrTablet,
  useIsDevelopment,
} from "@/hooks/use-media-query";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Detecta se estamos em modo de desenvolvimento
  const isDevelopment = useIsDevelopment();

  // Detecta se é um dispositivo móvel/tablet
  const isMobileOrTablet = useIsMobileOrTablet();

  // Detecta se a tela é pequena (para layout responsivo)
  const isSmallScreen = useMediaQuery("(max-width: 1180px)");

  // Em desenvolvimento, usamos o tamanho da tela para permitir testes
  // Em produção, usamos a detecção de dispositivo
  const useMobileLayout = isDevelopment ? isSmallScreen : isMobileOrTablet;

  const handleGoBack = () => {
    setCurrentView("home");
  };

  const handleSelectTable = (selectedProductName: string) => {
    setProductName(selectedProductName);
    setCurrentView("editor");
  };

  const handleExportToPDF = async () => {
    try {
      setIsExporting(true);

      // get table element
      const tableElement = document.querySelector(".nutrition-card");

      if (!tableElement) {
        console.error("Table element not found");
        setIsExporting(false);
        return;
      }

      // get the HTML content of the table
      const htmlContent = tableElement.outerHTML;

      console.log("Sending HTML to API endpoint...");

      // call API endpoint
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ htmlContent }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server response: ${errorText}`);
        throw new Error(
          `Failed to generate PDF: ${response.status} ${response.statusText}`
        );
      }

      console.log("PDF generated successfully, downloading...");

      // PDF blob
      const pdfBlob = await response.blob();

      if (pdfBlob.size === 0) {
        throw new Error("Generated PDF is empty");
      }

      // download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tabela_nutricional.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    } catch (error) {
      console.error("Error in export process:", error);
      alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
      setIsExporting(false);
    }
  };

  // close sidebar when switching to desktop
  useEffect(() => {
    if (!useMobileLayout && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [useMobileLayout, sidebarOpen]);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-brand-secondary/5 to-brand-primary/5">
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
              {useMobileLayout && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85%] sm:w-[350px] p-0"
                  >
                    <div className="h-full overflow-hidden">
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
                            isMobile={useMobileLayout}
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
                  </SheetContent>
                </Sheet>
              )}
              {useMobileLayout ? (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-8 w-8 bg-primary hover:bg-primary/90"
                    onClick={handleExportToPDF}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <PrintButton />
                  <Button
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={handleExportToPDF}
                    disabled={isExporting}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
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
              {useMobileLayout ? (
                // mobile and tablet layout
                <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
                  <div className="flex-1 flex items-center justify-center bg-[#f8f9fa] bg-opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden">
                    <div className="fixed-position">
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
              ) : (
                // desktop layout
                <div className="grid grid-cols-[480px,1fr] h-[calc(100vh-56px)] overflow-hidden">
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

                  <div className="flex items-center justify-center w-full h-full bg-[#ffffff] bg-opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] p-4">
                    <div className="fixed-position">
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
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
