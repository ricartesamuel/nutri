"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface HomeViewProps {
  onSelectTable: (productName: string) => void;
}

export default function HomeView({ onSelectTable }: HomeViewProps) {
  const tableOptions = [
    "Pão de Forma",
    "Biscoito de Polvilho",
    "Suco de Laranja",
  ];

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="home-view-container max-w-4xl mx-auto mt-8 px-4 md:px-0 space-y-8 pb-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-clip-text text-blue-200 nutri-brand-gradient"></h1>
        <p className="text-muted-foreground">
          Selecione uma tabela nutricional existente ou crie uma nova
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tableOptions.map((table) => (
          <Card
            key={table}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer border border-primary/10 hover:border-primary/30"
            onClick={() => onSelectTable(table)}
          >
            <div className="h-32 flex items-center justify-center mb-4 bg-muted/30 rounded-md">
              <span className="text-2xl font-medium text-primary">{table}</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
              onClick={() => onSelectTable(table)}
            >
              Selecionar
            </Button>
          </Card>
        ))}

        <Card className="p-6 border-dashed border-2 border-muted-foreground/30 hover:border-primary/30 flex flex-col items-center justify-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-32 flex items-center justify-center mb-4">
            <PlusCircle className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <Button
            variant="outline"
            className="w-full border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
            onClick={() => onSelectTable("Nova Tabela")}
          >
            Nova Tabela
          </Button>
        </Card>
      </div>
    </div>
  );
}
