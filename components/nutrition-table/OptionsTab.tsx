"use client";

import type React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OptionsTabProps {
  columns: number;
  setColumns: (columns: number) => void;
  width: number;
  setWidth: (width: number) => void;
  height: number;
  setHeight: (height: number) => void;
  servingSize: string;
  setServingSize: (size: string) => void;
  servings: string;
  setServings: (servings: string) => void;
}

export default function OptionsTab({
  columns,
  setColumns,
  width,
  setWidth,
  height,
  setHeight,
  servingSize,
  setServingSize,
  servings,
  setServings,
}: OptionsTabProps) {
  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setServingSize(value);
    }
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Dimensões da tabela */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Dimensões da tabela
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Largura (cm)</Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number.parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number.parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 100g coluna */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Coluna de 100g
        </h3>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade de medida</Label>
          <Select defaultValue="g">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Porção de referência */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Porção de referência
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="portion">Porção do alimento</Label>
            <Input
              id="portion"
              value={servingSize}
              onChange={handleServingSizeChange}
              placeholder="25"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade de medida</Label>
            <Select defaultValue="g">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Porções */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Porções por embalagem
        </h3>
        <div className="space-y-2">
          <Input
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            placeholder="000 porções"
            className="w-full"
          />
        </div>
      </div>

      {/* Finalidade */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          Finalidade
        </h3>
        <Select defaultValue="b2c">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a finalidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="b2c">B2C</SelectItem>
            <SelectItem value="b2b">B2B</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Modelo  */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Modelo</h3>
        <Select defaultValue="vertical">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o modelo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Formato  */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Formato</h3>
        <Select defaultValue="padrao">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione o formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="padrao">Padrão</SelectItem>
            <SelectItem value="compacto">Compacto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fonte  */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground">Fonte</h3>
        <Select defaultValue="inter">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="inter">Inter</SelectItem>
            <SelectItem value="arial">Arial</SelectItem>
            <SelectItem value="helvetica">Helvetica</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
