"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface AddNutrientInputProps {
  onAddItem: (name: string) => void;
}

export function AddNutrientInput({ onAddItem }: AddNutrientInputProps) {
  const [newItemName, setNewItemName] = useState("");

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
    <div className="mb-4">
      <div className="flex space-x-2">
        <Input
          placeholder="Digite o nome do nutriente"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-primary/20 focus-visible:ring-primary/20"
        />
        <Button
          onClick={handleAddItem}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}
