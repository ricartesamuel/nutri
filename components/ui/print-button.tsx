"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";

export function PrintButton() {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [labelQuantity, setLabelQuantity] = useState("1");

  const handlePrint = () => {
    console.log("Printing with printer:", selectedPrinter);
    console.log("Number of labels:", labelQuantity);
    setIsPrintModalOpen(false);
  };

  return (
    <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-brand-primary/20 text-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary"
        >
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações de Impressão</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Tamanho da etiqueta: 60cm x 60cm</p>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="printer" className="text-right">
              Impressora
            </Label>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a impressora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="printer1">Impressora 1</SelectItem>
                <SelectItem value="printer2">Impressora 2</SelectItem>
                <SelectItem value="printer3">Impressora 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantidade
            </Label>
            <Input
              id="quantity"
              type="number"
              value={labelQuantity}
              onChange={(e) => setLabelQuantity(e.target.value)}
              min="1"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint}>Imprimir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
