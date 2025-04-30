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
import { Edit, Trash2, ChevronDown } from "lucide-react";
import type { NutrientRow } from "@/components/types/nutrition";
import { calculateEnergyKJ } from "@/components/utils/nutrition-calculation";
import { DeleteNutrientDialog } from "./DeleteNutrientDialog";
import { NutrientHeader } from "./NutrientHeader";
import { ServingInputs } from "./ServingInputs";
import { AddNutrientInput } from "./AddNutrientInput";
import { ValueInput } from "./ValueInput";

// Add custom styles for the drag handle and collapse icons
const treeItemStyles = `
  .dnd-sortable-tree-handle {
    opacity: 0.6 !important;
    width: 16px !important;
    height: 16px !important;
    margin-right: 8px !important;
    cursor: grab !important;
  }
  
  .dnd-sortable-tree-handle:hover {
    opacity: 1 !important;
  }
  
  .dnd-sortable-tree-collapse-button {
    opacity: 0.6 !important;
    width: 16px !important;
    height: 16px !important;
    margin-right: 4px !important;
  }
  
  .dnd-sortable-tree-collapse-button:hover {
    opacity: 1 !important;
  }
`;

type NutrientTreeItemData = {
  id: string;
  name: string;
  value: string;
  unit: string;
  kjValue?: string;
  collapsed?: boolean;
  parentId?: string;
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
  hideHeader?: boolean;
  isMobile?: boolean;
}

export function NutrientTree({
  nutrients: initialNutrients,
  setNutrients,
  productName,
  setProductName,
  servings,
  setServings,
  servingSize,
  setServingSize,
  handleGoBack,
  hideHeader = false,
  isMobile = false,
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
        collapsed:
          nutrient.collapsed !== undefined ? nutrient.collapsed : false,
        parentId: nutrient.parentId,
      });
    });

    // Second pass: establish parent-child relationships
    const rootItems: TreeItems<NutrientTreeItemData> = [];
    const childItems = new Set<string>();

    // First handle explicit parent-child relationships using parentId
    flatNutrients.forEach((nutrient) => {
      if (nutrient.parentId) {
        const parentItem = itemMap.get(nutrient.parentId);
        if (parentItem) {
          if (!parentItem.children) {
            parentItem.children = [];
          }
          parentItem.children.push(itemMap.get(nutrient.id)!);
          childItems.add(nutrient.id);
        }
      }
    });

    // Then handle implicit relationships based on naming conventions
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

      if (
        parentBaseName === "açúcares totais" &&
        (childBaseName === "açúcares adicionados" ||
          childBaseName === "acucares adicionados")
      ) {
        return true;
      }

      return false;
    };

    // Add remaining items that don't have explicit parentId but might have implicit relationships
    flatNutrients.forEach((nutrient) => {
      // Skip if already processed as a child
      if (childItems.has(nutrient.id) || nutrient.parentId) {
        return;
      }

      let foundParent = false;

      // Check for implicit parent-child relationships
      for (const potentialParent of flatNutrients) {
        if (
          nutrient.id !== potentialParent.id &&
          !childItems.has(potentialParent.id) &&
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

      // If no parent found, add to root items
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
      depth = 0,
      parentId?: string
    ) => {
      flatNutrients.push({
        id: item.id,
        name: item.name,
        value: item.value,
        unit: item.unit,
        depth: depth, // add depth information
        kjValue: item.kjValue, // kj value
        collapsed: item.collapsed, // preserve collapsed state
        parentId: parentId, // preserve parent-child relationship
      });

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) =>
          processItem(child, depth + 1, item.id)
        );
      }
    };

    treeItems.forEach((item) => processItem(item, 0));
    return flatNutrients;
  };

  const [localNutrients, setLocalNutrients] =
    useState<NutrientRow[]>(initialNutrients);
  const [items, setItems] = useState<TreeItems<NutrientTreeItemData>>(
    convertToTreeItems(localNutrients)
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    hasChildren: boolean;
  } | null>(null);
  const [activeValueId, setActiveValueId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditing);

  const inputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // ref to track if the update is coming from internal or parent state changes
  const isInternalUpdate = useRef(false);

  // update tree items
  useEffect(() => {
    if (!isInternalUpdate.current) {
      setItems(convertToTreeItems(localNutrients));
    }
    isInternalUpdate.current = false;
  }, [localNutrients]);

  const checkScrollPosition = () => {
    if (formContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        formContainerRef.current;
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  // scroll event listener
  useEffect(() => {
    const container = formContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, []);

  // update nutrients when tree changes internally
  const handleItemsChanged = (newItems: TreeItems<NutrientTreeItemData>) => {
    setItems(newItems);

    isInternalUpdate.current = true;

    const flatNutrients = convertToFlatNutrients(newItems);
    setLocalNutrients(flatNutrients);
    setNutrients(flatNutrients);

    // check scroll position after items change
    setTimeout(checkScrollPosition, 100);
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
          setLocalNutrients(flatNutrients);
          setNutrients(flatNutrients);
        }
      }
    }
  }, [items.map((item) => item.value).join(",")]); // avoid loops

  const scrollToBottom = () => {
    if (formContainerRef.current) {
      setTimeout(() => {
        if (formContainerRef.current) {
          formContainerRef.current.scrollTo({
            top: formContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100); // small delay to ensure the DOM update
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
      collapsed: true, // default
    };

    // add new element
    const updatedItems = [...items, newItem];
    setItems(updatedItems);

    // update parent state
    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setLocalNutrients(flatNutrients);
    setNutrients(flatNutrients);

    scrollToBottom();
  };

  const startEditing = (id: string, name: string) => {
    setEditingItemId(id);
    setEditingItemName(name);
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (!editingItemId || !editingItemName.trim()) {
      setEditingItemId(null);
      setIsEditing(false);
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
    setIsEditing(false);

    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setLocalNutrients(flatNutrients);
    setNutrients(flatNutrients);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setIsEditing(false);
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
    setLocalNutrients(flatNutrients);
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
    setLocalNutrients(flatNutrients);
    setNutrients(flatNutrients);

    // check scroll position after deletion
    setTimeout(checkScrollPosition, 100);
  };

  const toggleCollapsed = (id: string) => {
    const updateCollapsed = (
      items: TreeItems<NutrientTreeItemData>
    ): TreeItems<NutrientTreeItemData> => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, collapsed: !item.collapsed };
        }
        if (item.children?.length) {
          return { ...item, children: updateCollapsed(item.children) };
        }
        return item;
      });
    };

    const updatedItems = updateCollapsed(items);
    setItems(updatedItems);

    isInternalUpdate.current = true;
    const flatNutrients = convertToFlatNutrients(updatedItems);
    setLocalNutrients(flatNutrients);
    setNutrients(flatNutrients);

    // check scroll position after toggle collapse
    setTimeout(checkScrollPosition, 100);
  };

  // tree items
  const NutrientTreeItem = forwardRef<
    HTMLDivElement,
    TreeItemComponentProps<NutrientTreeItemData>
  >((props, ref) => {
    const { item, depth } = props;
    const isMobileOrTabletView = isMobile || false;

    return (
      <SimpleTreeItemWrapper
        {...props}
        ref={ref}
        collapsed={item.collapsed}
        className="hover:bg-primary/5 rounded-sm"
        childrenClassName={isMobileOrTabletView ? "pl-4" : "pl-6"}
        showDragHandle={true}
      >
        <div
          className={`py-1 group ${
            isMobileOrTabletView ? "my-0.5" : "my-1"
          } px-1`}
        >
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
                className="h-8 border-primary/20 focus-visible:ring-primary/20 w-full rounded-md border px-2 py-1 text-sm"
                autoFocus
                maxLength={30}
              />
            </div>
          ) : (
            <div className="flex items-center w-full gap-1">
              <div
                className={`flex-1 truncate ${
                  isMobileOrTabletView ? "text-xs" : "text-sm"
                } ${isMobileOrTabletView ? "max-w-[120px]" : "max-w-[180px]"}`}
              >
                {item.name}
              </div>
              <div className="flex items-center justify-end min-w-0 flex-shrink-0">
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
                  isMobile={isMobileOrTabletView}
                />
              </div>
              <div
                className="flex items-center gap-1 justify-end flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isMobileOrTabletView ? "h-5 w-5" : "h-6 w-6"
                  } flex-shrink-0 text-primary/40 hover:text-primary hover:bg-primary/10`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(item.id, item.name);
                  }}
                >
                  <Edit
                    className={`${
                      isMobileOrTabletView ? "h-2.5 w-2.5" : "h-3 w-3"
                    }`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isMobileOrTabletView ? "h-5 w-5" : "h-6 w-6"
                  } text-primary/40 flex-shrink-0 hover:bg-primary/10 hover:text-primary`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(item.id);
                  }}
                >
                  <Trash2
                    className={`${
                      isMobileOrTabletView ? "h-2.5 w-2.5" : "h-3 w-3"
                    }`}
                  />
                </Button>
              </div>
            </div>
          )}
        </div>
      </SimpleTreeItemWrapper>
    );
  });

  return (
    <div
      ref={formContainerRef}
      className="h-full p-2 bg-white overflow-y-auto overflow-x-hidden"
    >
      <style jsx global>
        {treeItemStyles}
      </style>
      <div className="space-y-3 font-nutrient">
        {!hideHeader && (
          <NutrientHeader
            productName={productName}
            setProductName={setProductName}
            handleGoBack={handleGoBack}
          />
        )}

        <ServingInputs
          servings={servings}
          setServings={setServings}
          servingSize={servingSize}
          setServingSize={setServingSize}
        />

        <div className="border-primary/20 border rounded-sm p-2 relative">
          <AddNutrientInput onAddItem={handleAddItem} />

          <div className="pr-1 overflow-x-hidden">
            <SortableTree
              items={items}
              onItemsChanged={handleItemsChanged}
              TreeItemComponent={NutrientTreeItem}
              indentationWidth={28}
            />
          </div>
        </div>
      </div>

      {showScrollToBottom && (
        <button
          className="fixed bottom-3 right-3 bg-primary text-white rounded-full p-2 shadow-md hover:bg-primary/90 transition-opacity z-10"
          onClick={() => {
            if (formContainerRef.current) {
              formContainerRef.current.scrollTo({
                top: formContainerRef.current.scrollHeight,
                behavior: "smooth",
              });
            }
          }}
          aria-label="Rolar para o final da lista"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      <DeleteNutrientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        hasChildren={itemToDelete?.hasChildren || false}
        onConfirm={deleteItem}
      />
    </div>
  );
}
