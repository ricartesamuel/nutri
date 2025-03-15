declare module "dnd-kit-sortable-tree" {
  import type {
    ReactNode,
    ComponentType,
    RefAttributes,
    ForwardRefExoticComponent,
  } from "react";
  import type { DndContextProps } from "@dnd-kit/core";
  import type { UseSortableArguments } from "@dnd-kit/sortable";

  export type TreeItem<T = any> = T & {
    id: string;
    children?: TreeItem<T>[];
    canHaveChildren?: boolean | ((item: TreeItem<T>) => boolean);
    disableSorting?: boolean;
  };

  export type TreeItems<T = any> = TreeItem<T>[];

  export interface TreeItemComponentProps<T = any> {
    item: TreeItem<T>;
    childCount?: number;
    clone?: boolean;
    collapsed?: boolean;
    depth: number;
    disableInteraction?: boolean;
    disableSelection?: boolean;
    ghost?: boolean;
    handleProps?: any;
    indentationWidth: number;
    isLast: boolean;
    isSelected?: boolean;
    isExpanded?: boolean;
    onCollapse?: () => void;
    onExpand?: () => void;
    wrapperRef?: (node: HTMLDivElement) => void;
  }

  export interface SortableTreeProps<T = any> {
    items: TreeItems<T>;
    onItemsChanged: (items: TreeItems<T>) => void;
    TreeItemComponent: ComponentType<
      TreeItemComponentProps<T> & RefAttributes<HTMLDivElement>
    >;
    indentationWidth?: number;
    pointerSensorOptions?: any;
    disableSorting?: boolean;
    keepGhostInPlace?: boolean;
    dndContextProps?: Partial<DndContextProps>;
    sortableProps?: Partial<UseSortableArguments>;
  }

  export interface TreeItemWrapperProps<T = any>
    extends TreeItemComponentProps<T> {
    children: ReactNode;
    manualDrag?: boolean;
    showDragHandle?: boolean;
  }

  export const SortableTree: <T = any>(
    props: SortableTreeProps<T>
  ) => JSX.Element;

  export const SimpleTreeItemWrapper: ForwardRefExoticComponent<
    TreeItemWrapperProps<any> & RefAttributes<HTMLDivElement>
  >;

  export const FolderTreeItemWrapper: ForwardRefExoticComponent<
    TreeItemWrapperProps<any> & RefAttributes<HTMLDivElement>
  >;
}
