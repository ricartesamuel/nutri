"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteNutrientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasChildren: boolean;
  onConfirm: () => void;
}

export function DeleteNutrientDialog({
  open,
  onOpenChange,
  hasChildren,
  onConfirm,
}: DeleteNutrientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-nutrient border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary text-xl">
            Confirmar exclusão
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {hasChildren
              ? "Esse nutriente contém sub-nutrientes, tem certeza que deseja removê-lo e todos seus sub-nutrientes?"
              : "Tem certeza que deseja remover este item?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
          >
            Não
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Sim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
