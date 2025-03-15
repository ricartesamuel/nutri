"use client";

import type React from "react";

import { Input } from "@/components/ui/input";

interface ServingInputsProps {
  servings: string;
  setServings: (servings: string) => void;
  servingSize: string;
  setServingSize: (size: string) => void;
}

export function ServingInputs({
  servings,
  setServings,
  servingSize,
  setServingSize,
}: ServingInputsProps) {
  const handleServingSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setServingSize(value);
    }
  };

  const handleServingSizeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-3/5">
        <Input
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          onKeyDown={handleServingSizeKeyDown}
          placeholder="Porções por embalagem: 000 porções"
          className="pl-4 pr-8 py-2 w-full border-primary/20 rounded-lg focus-visible:ring-primary/20"
        />
      </div>

      <div className="relative w-3/5">
        <Input
          value={servingSize}
          onChange={handleServingSizeChange}
          onKeyDown={handleServingSizeKeyDown}
          placeholder="Porção: 000g"
          className="pl-4 pr-8 py-2 w-full border-primary/20 rounded-lg focus-visible:ring-primary/20"
          maxLength={4}
        />
      </div>
    </div>
  );
}
