"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Edit } from "lucide-react";

interface NutrientHeaderProps {
  productName: string;
  setProductName: (name: string) => void;
  handleGoBack: () => void;
}

export function NutrientHeader({
  productName,
  setProductName,
  handleGoBack,
}: NutrientHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  return (
    <div className="mb-2">
      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="text-primary/60 hover:text-primary hover:bg-primary/5 text-sm h-7 px-2"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1" />
        Voltar
      </Button>
      <div className="flex items-center justify-center gap-2 mb-2">
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
            className="text-center text-xl font-semibold border-primary/20 focus-visible:ring-primary/20 max-w-xs h-9"
          />
        ) : (
          <h1 className="text-xl font-semibold text-center text-primary">
            {productName}
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditingTitle(true)}
          className="h-7 w-7 text-primary/40 hover:text-primary hover:bg-primary/10"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="h-px bg-primary/10 my-2" />
    </div>
  );
}
