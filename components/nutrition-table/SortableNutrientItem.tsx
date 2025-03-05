"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Autocomplete, TextField } from "@mui/material";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2, Check } from "lucide-react";
import {
  calculateEnergyKJ,
  getIndentationLevel,
} from "@/components/utils/nutrition-calculation";
import {
  getSuggestions,
  type NutrientSuggestion,
} from "@/components/utils/nutrient-suggestions";
import type { NutrientRow, Nutrient } from "@/components/types/nutrition";

interface SortableNutrientItemProps {
  nutrient: Nutrient;
  nutrients: NutrientRow[];
  updateNutrient: (
    id: string,
    field: "name" | "value" | "unit",
    value: string
  ) => void;
  removeNutrient: (id: string) => void;
  isNew?: boolean;
}

export default function SortableNutrientItem({
  nutrient,
  nutrients,
  updateNutrient,
  removeNutrient,
  isNew = false,
}: SortableNutrientItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [inputValue, setInputValue] = useState(nutrient.name);
  const [suggestions, setSuggestions] = useState<NutrientSuggestion[]>([]);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: nutrient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const indentLevel = getIndentationLevel(nutrient.name);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(".", ",");
    if (/^\d*,?\d*$/.test(value) || value === "") {
      updateNutrient(nutrient.id, "value", value);

      if (nutrient.name === "Valor energético (kcal)") {
        const carbs = Number.parseFloat(
          nutrients.find((n: NutrientRow) => n.name === "Carboídratos (g)")
            ?.value || "0"
        );
        const proteins = Number.parseFloat(
          nutrients.find((n: NutrientRow) => n.name === "Proteínas (g)")
            ?.value || "0"
        );
        const fats = Number.parseFloat(
          nutrients.find((n: NutrientRow) => n.name === "Gorduras totais (g)")
            ?.value || "0"
        );

        const kJ = calculateEnergyKJ(carbs, proteins, fats);
        updateNutrient(nutrient.id, "value", `${value} + ${kJ.toFixed(0)} KJ`);
      }
    }
  };

  useEffect(() => {
    if (isEditing) {
      setSuggestions(getSuggestions(""));
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
    setInputValue(nutrient.name);
  };

  const handleConfirmClick = () => {
    setIsEditing(false);
    updateNutrient(nutrient.id, "name", inputValue);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 bg-brand-primary/5 hover:bg-brand-secondary/10 p-3 rounded-lg transition-colors font-semibold font-nutrient ${
        isDragging ? "shadow-lg ring-1 ring-brand-primary/20" : ""
      }`}
    >
      <button
        className="cursor-grab text-brand-primary/40 hover:text-brand-primary/60"
        {...attributes}
        {...listeners}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 grid grid-cols-3 gap-2">
        <div className="col-span-2 relative font-normal">
          {isEditing ? (
            <Autocomplete<NutrientSuggestion, false, false, false>
              options={suggestions}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Nome do nutriente"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "hsl(var(--primary) / 0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "hsl(var(--primary) / 0.3)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "hsl(var(--primary))",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "hsl(var(--foreground))",
                      fontFamily: "var(--font-inter)",
                    },
                  }}
                />
              )}
              value={suggestions.find((s) => s.name === inputValue) || null}
              onChange={(_, newValue) => {
                if (newValue) {
                  setInputValue(newValue.name);
                  updateNutrient(nutrient.id, "name", newValue.name);
                  updateNutrient(nutrient.id, "unit", newValue.unit);
                }
              }}
              onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
                setSuggestions(getSuggestions(newInputValue));
              }}
              className="w-full bg-white rounded-md"
              sx={{
                "& .MuiAutocomplete-listbox": {
                  "& .MuiAutocomplete-option": {
                    fontFamily: "var(--font-inter)",
                    '&[aria-selected="true"]': {
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "hsl(var(--primary) / 0.2)",
                    },
                  },
                },
              }}
            />
          ) : (
            <span className="block bg-transparent p-2">{nutrient.name}</span>
          )}
        </div>

        <div className="relative font-normal">
          <Input
            ref={valueInputRef}
            type="text"
            value={nutrient.value}
            onChange={handleValueChange}
            placeholder="Valor"
            className="bg-white border-brand-primary/20 focus-visible:ring-brand-primary/20 pr-8"
            maxLength={5}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-brand-primary/60">
            {nutrient.unit}
          </span>
        </div>
      </div>

      <div className="flex gap-1">
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleConfirmClick}
            className="h-8 w-8 text-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/10"
          >
            <Check className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
            className="h-8 w-8 text-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/10"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeNutrient(nutrient.id)}
          className="h-8 w-8 text-brand-primary/40 hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
