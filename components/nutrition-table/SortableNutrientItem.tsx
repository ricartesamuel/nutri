import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, Trash2, Edit } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Nutrient } from "@/components/types/nutrition";

interface SortableNutrientItemProps {
  nutrient: Nutrient;
  updateNutrient: (id: string, field: "name" | "value", value: string) => void;
  removeNutrient: (id: string) => void;
}

export default function SortableNutrientItem({
  nutrient,
  updateNutrient,
  removeNutrient,
}: SortableNutrientItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 bg-gray-50 hover:bg-blue-50/50 p-3 rounded-lg transition-colors ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <button
        className="cursor-grab text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 grid grid-cols-3 gap-2">
        <Input
          value={nutrient.name}
          onChange={(e) => {
            if (e.target.value.length <= 30) {
              updateNutrient(nutrient.id, "name", e.target.value);
            }
          }}
          placeholder="Nome do nutriente"
          className="col-span-2 bg-white border-gray-200"
          maxLength={30}
        />
        <div className="relative">
          <Input
            type="text"
            value={nutrient.value}
            onChange={(e) => {
              const value = e.target.value.replace(".", ",");
              if (/^\d*,?\d*$/.test(value) || value === "") {
                updateNutrient(nutrient.id, "value", value);
              }
            }}
            placeholder="Valor"
            className="bg-white border-gray-200 pr-8"
            maxLength={5}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {nutrient.unit}
          </span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-gray-600"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeNutrient(nutrient.id)}
          className="h-8 w-8 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
