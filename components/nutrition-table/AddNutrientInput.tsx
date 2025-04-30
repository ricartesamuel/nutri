"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface AddNutrientInputProps {
  onAddItem: (name: string) => void;
}

export function AddNutrientInput({ onAddItem }: AddNutrientInputProps) {
  const [newItemName, setNewItemName] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAddItem(newItemName);
    setNewItemName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  return (
    <div className="mb-2">
      <div className="flex space-x-1">
        <Input
          placeholder={
            isMobile ? "Nome do nutriente" : "Digite o nome do nutriente"
          }
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-7 text-sm border-primary/20 focus-visible:ring-primary/20"
          maxLength={30}
        />
        <Button
          onClick={handleAddItem}
          className="h-7 bg-primary hover:bg-primary/90 text-white flex items-center justify-center"
          size="sm"
        >
          {isMobile ? (
            <Plus className="h-3.5 w-3.5" />
          ) : (
            <>
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs">Adicionar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
