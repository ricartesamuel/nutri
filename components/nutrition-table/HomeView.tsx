import { Button } from "@/components/ui/button";

interface HomeViewProps {
  onSelectTable: (productName: string) => void;
}

export default function HomeView({ onSelectTable }: HomeViewProps) {
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
