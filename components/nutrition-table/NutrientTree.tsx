"use client";
import { useState, useRef, useEffect } from "react";
import {
  SortableTree,
  type TreeItems,
  SimpleTreeItemWrapper,
  type TreeItemComponentProps,
} from "dnd-kit-sortable-tree";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { NutrientRow } from "@/components/types/nutrition";
import { calculateEnergyKJ } from "@/components/utils/nutrition-calculation";
import { DeleteNutrientDialog } from "./DeleteNutrientDialog";
import { NutrientHeader } from "./NutrientHeader";
import { ServingInputs } from "./ServingInputs";
import { AddNutrientInput } from "./AddNutrientInput";
import { ValueInput } from "./ValueInput";

type NutrientTreeItemData = {
  id: string;
  name: string;
  value: string;
  unit: string;
  kjValue?: string;
};

interface NutrientTreeProps {
  nutrients: NutrientRow[];
  setNutrients: (nutrients: NutrientRow[]) => void;
  productName: string;
  setProductName: (name: string) => void;
  servings: string;
  setServings: (servings: string) => void;
  servingSize: string;
  setServingSize: (size: string) => void;
  handleGoBack: () => void;
}

export function NutrientTree({
  nutrients,
  setNutrients,
  productName,
  setProductName,
  servings,
  setServings,
  servingSize,
  setServingSize,
  handleGoBack,
}: NutrientTreeProps) {
  // convert flat nutrients to tree structure
  const convertToTreeItems = (
    flatNutrients: NutrientRow[]
  ): TreeItems<NutrientTreeItemData> => {
    // create a map of all items
    const itemMap = new Map<string, TreeItems<NutrientTreeItemData>[0]>();

    flatNutrients.forEach((nutrient) => {
      itemMap.set(nutrient.id, {
        id: nutrient.id,
        name: nutrient.name,
        value: nutrient.value,
        unit: nutrient.unit,
        kjValue: nutrient.kjValue,
      });
    });

    // determine parent-child relationships based on naming conventions
    const rootItems: TreeItems<NutrientTreeItemData> = [];
    const childItems = new Set<string>();

    // function to check if one nutrient is a child of another
    const isChildOf = (childName: string, parentName: string) => {
      const parentBaseName = parentName.split("(")[0].trim().toLowerCase();
      const childBaseName = childName.split("(")[0].trim().toLowerCase();

      if (
        parentBaseName === "carboidratos" &&
        (childBaseName.includes("açúcar") || childBaseName.includes("acucar"))
      ) {
        return true;
      }

      if (
        parentBaseName === "gorduras totais" &&
        childBaseName.includes("gordura") &&
        childBaseName !== "gorduras totais"
      ) {
        return true;
      }

      if (
        parentBaseName === "açúcares totais" &&
        (childBaseName.includes("açúcar") ||
          childBaseName.includes("acucar")) &&
        childBaseName !== "açúcares totais"
      ) {
        return true;
      }

      // Specific check for "Açúcares adicionados" as a child of "Açúcares totais"
      if (
        parentBaseName === "açúcares totais" &&
        (childBaseName === "açúcares adicionados" ||
          childBaseName === "acucares adicionados")
      ) {
        return true;
      }

      return false;
    };

    // tree structure
    flatNutrients.forEach((nutrient) => {
      let foundParent = false;

      for (const potentialParent of flatNutrients) {
        if (
          nutrient.id !== potentialParent.id &&
          isChildOf(nutrient.name, potentialParent.name)
        ) {
          const parentItem = itemMap.get(potentialParent.id);
          if (parentItem) {
            if (!parentItem.children) {
              parentItem.children = [];
            }
            parentItem.children.push(itemMap.get(nutrient.id)!);
            childItems.add(nutrient.id);
            foundParent = true;
            break;
          }
        }
      }

      if (!foundParent && !childItems.has(nutrient.id)) {
        rootItems.push(itemMap.get(nutrient.id)!);
      }
    });

    return rootItems;
  };

  // convert tree structure to flat nutrients
  const convertToFlatNutrients = (
    treeItems: TreeItems<NutrientTreeItemData>
  ): NutrientRow[] => {
    const flatNutrients: NutrientRow[] = [];

    const processItem = (
      item: TreeItems<NutrientTreeItemData>[0],
      depth = 0
    ) => {
      flatNutrients.push({
        id: item.id,
        name: item.name,
        value: item.value,
        unit: item.unit,
        depth: depth, // add depth information
        kjValue: item.kjValue, // kj value
      });

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => processItem(child, depth + 1));
      }
    };

    treeItems.forEach((item) => processItem(item, 0));
    return flatNutrients;
  };

  const [items, setItems] = useState<TreeItems<NutrientTreeItemData>>(
    convertToTreeItems(nutrients)
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    hasChildren: boolean;
  } | null>(null);
  const [activeValueId, setActiveValueId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // ref to track if the update is coming from internal or parent state changes
  const isInternalUpdate = useRef(false);

  // update tree items
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setItems(convertToTreeItems(nutrients));
    }
    isInternalUpdate.current = false;
  }, [nutrients]);

  // update nutrients when tree changes internally
  const handleItemsChanged = (newItems: TreeItems<NutrientTreeItemData>) => {
    setItems(newItems);

    isInternalUpdate.current = true;

    const flatNutrients = convertToFlatNutrients(newItems);
    setNutrients(flatNutrients);
  };

  useEffect(() => {
    if (editingItemId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingItemId, editingItemName]);

  useEffect(() => {
    const flatNutrients = convertToFlatNutrients(items);
    const carbs = Number.parseFloat(
      flatNutrients.find((n) => n.name.toLowerCase().includes("carboidrato"))
        ?.value || "0"
    );
    const proteins = Number.parseFloat(
      flatNutrients.find((n) => n.name.toLowerCase().includes("proteína"))
        ?.value || "0"
    );
    const fats = Number.parseFloat(
      flatNutrients.find(
        (n) =>
          n.name.toLowerCase().includes("gordura") &&
          n.name.toLowerCase().includes("totais")
      )?.value || "0"
    );

    const energyItem = items.find(
      (item) =>
        item.name.toLowerCase().includes("valor energético") &&
        item.unit === "kcal"
    );

    if (energyItem && energyItem.value) {
      const kJ = calculateEnergyKJ(carbs, proteins, fats);

      if (!isNaN(kJ)) {
        const kjValueStr = kJ.toFixed(0);
        if (energyItem.kjValue !== kjValueStr) {
          const updatedItems = items.map((item) => {
            if (item.id === energyItem.id) {
              return { ...item, kjValue: kjValueStr };
            }
            return item;
          });

          setItems(updatedItems);

          isInternalUpdate.current = true;
          const flatNutrients = convertToFlatNutrients(updatedItems);
          setNutrients(flatNutrients);
        }
      }
    }
  }, [items.map((item) => item.value).join(",")]); // avoid loops

  const scrollToBottom = () => {
    if (treeContainerRef.current) {
      setTimeout(() => {
        if (treeContainerRef.current) {
          treeContainerRef.current.scrollTo({
            top: treeContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100); // Small delay to ensure the DOM has updated
    }
  };

  const handleAddItem = (newItemName: string) => {
    if (!newItemName.trim()) return;

    let unit = "g";
    if (
      newItemName.toLowerCase().includes("sódio") ||
      newItemName.toLowerCase().includes("sodio")
    ) {
      unit = "mg";
    } else if (
      newItemName.toLowerCase().includes("energia") ||
      newItemName.toLowerCase().includes("valor energético")
    ) {
      unit = "kcal";
    }

    // unique id for every new element
    const newId = `item-${Date.now()}`;

    const newItem = {
      id: newId,
      name: newItemName.trim(),
      value: "",
      unit: unit,
    };

    // add new element
    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    // update parent state
    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setNutrients(flatNutrients);

    // Scroll to the bottom to show the newly added item
    scrollToBottom();
  };

  const startEditing = (id: string, name: string) => {
    setEditingItemId(id);
    setEditingItemName(name);
  };

  const saveEditing = () => {
    if (!editingItemId || !editingItemName.trim()) {
      setEditingItemId(null);
      return;
    }

    const updateItemName = (
      items: TreeItems<NutrientTreeItemData>
    ): TreeItems<NutrientTreeItemData> => {
      return items.map((item) => {
        if (item.id === editingItemId) {
          // determine unit based on name
          let unit = item.unit;
          if (
            editingItemName.toLowerCase().includes("sódio") ||
            editingItemName.toLowerCase().includes("sodio")
          ) {
            unit = "mg";
          } else if (
            editingItemName.toLowerCase().includes("energia") ||
            editingItemName.toLowerCase().includes("valor energético")
          ) {
            unit = "kcal";
          }

          return { ...item, name: editingItemName.trim(), unit };
        }
        if (item.children?.length) {
          return { ...item, children: updateItemName(item.children) };
        }
        return item;
      });
    };

    const updatedItems = updateItemName(items);
    setItems(updatedItems);
    setEditingItemId(null);

    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setNutrients(flatNutrients);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
  };

  const updateItemValue = (id: string, value: string) => {
    const updateValue = (
      items: TreeItems<NutrientTreeItemData>
    ): TreeItems<NutrientTreeItemData> => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, value };
        }
        if (item.children?.length) {
          return { ...item, children: updateValue(item.children) };
        }
        return item;
      });
    };

    const updatedItems = updateValue(items);
    setItems(updatedItems);

    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setNutrients(flatNutrients);
  };

  const openDeleteDialog = (id: string) => {
    const hasChildren = checkIfItemHasChildren(id, items);
    setItemToDelete({ id, hasChildren });
    setDeleteDialogOpen(true);
  };

  const checkIfItemHasChildren = (
    id: string,
    items: TreeItems<NutrientTreeItemData>
  ): boolean => {
    for (const item of items) {
      if (item.id === id) {
        return !!item.children?.length;
      }
      if (item.children?.length) {
        const hasChildrenInSubtree = checkIfItemHasChildren(id, item.children);
        if (hasChildrenInSubtree) return true;
      }
    }
    return false;
  };

  // remove element
  const deleteItem = () => {
    if (!itemToDelete) return;

    const removeItem = (
      items: TreeItems<NutrientTreeItemData>
    ): TreeItems<NutrientTreeItemData> => {
      return items.filter((item) => {
        if (item.id === itemToDelete.id) {
          return false;
        }
        if (item.children?.length) {
          item.children = removeItem(item.children);
        }
        return true;
      });
    };

    const updatedItems = removeItem(items);
    setItems(updatedItems);
    setDeleteDialogOpen(false);
    setItemToDelete(null);

    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setNutrients(flatNutrients);
  };

  // tree items
  const NutrientTreeItem = forwardRef<
    HTMLDivElement,
    TreeItemComponentProps<NutrientTreeItemData>
  >((props, ref) => {
    const { item, depth } = props;
    const isEditing = editingItemId === item.id;

    return (
      <SimpleTreeItemWrapper {...props} ref={ref}>
        <div className="py-1 group my-1 px-2">
          {isEditing ? (
            <div className="flex-1 flex items-center">
              <input
                ref={inputRef}
                value={editingItemName}
                onChange={(e) => setEditingItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditing();
                  if (e.key === "Escape") cancelEditing();
                }}
                onBlur={saveEditing}
                className="h-10 border-primary/20 focus-visible:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm"
                autoFocus
              />
            </div>
          ) : (
            <div className="grid grid-cols-[1fr,auto,auto] items-center w-full gap-2">
              <div className="mr-2 truncate">{item.name}</div>
              <div className="flex items-center justify-end">
                <ValueInput
                  item={item}
                  updateItemValue={updateItemValue}
                  isActive={activeValueId === item.id}
                  setActive={(active) => {
                    if (active) {
                      setActiveValueId(item.id);
                    } else if (activeValueId === item.id) {
                      setActiveValueId(null);
                    }
                  }}
                />
              </div>
              <div
                className="flex items-center gap-1 justify-end"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0 text-primary/40 hover:text-primary hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(item.id, item.name);
                  }}
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-primary/40 flex-shrink-0 hover:bg-primary/10 hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(item.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SimpleTreeItemWrapper>
    );
  });

  return (
    <div className="max-w-xl h-full border-primary/20 border-2 rounded-sm">
      <div className="p-6 bg-white shadow-sm border border-primary/10 h-full flex flex-col">
        <div className="space-y-6 font-nutrient flex-1 flex flex-col">
          <NutrientHeader
            productName={productName}
            setProductName={setProductName}
            handleGoBack={handleGoBack}
          />

          <ServingInputs
            servings={servings}
            setServings={setServings}
            servingSize={servingSize}
            setServingSize={setServingSize}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth border-primary/20 border rounded-sm p-4">
            <AddNutrientInput onAddItem={handleAddItem} />

            <div
              ref={treeContainerRef}
              className="max-h-[350px] overflow-y-auto overflow-x-hidden pr-2 scroll-smooth"
            >
              <SortableTree
                items={items}
                onItemsChanged={handleItemsChanged}
                TreeItemComponent={NutrientTreeItem}
                indentationWidth={24}
              />
            </div>
          </div>
        </div>
      </div>

      <DeleteNutrientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        hasChildren={itemToDelete?.hasChildren || false}
        onConfirm={deleteItem}
      />
    </div>
  );
}
