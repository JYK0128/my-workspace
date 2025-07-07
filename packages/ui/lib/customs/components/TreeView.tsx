import { TreeItem } from '#customs/components/index.ts';
import { useCallbackRef } from '#customs/hooks/index.ts';
import { Active, closestCenter, DndContext, MeasuringStrategy, Modifier, Over, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { isNumber } from 'lodash-es';
import { ComponentPropsWithoutRef, MutableRefObject, useEffect, useMemo, useState } from 'react';

export type TreeNode = {
  id: string
  label: string
  parent?: TreeNode
  readonly?: boolean
  children?: TreeNode[]
};

type TreeViewProps
  = Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'value' | 'onChange' >
    & {
      value?: TreeNode[]
      defaultValue?: TreeNode[]
      level?: number
      onInsertNode?: (node?: TreeNode) => void
      onDeleteNode?: (node?: TreeNode) => void
      onEditNode?: (node?: TreeNode) => void
      onChange?: (tree: TreeNode[]) => void
    };


/** 트리 뷰 */
export function TreeView(props: TreeViewProps) {
  const { defaultValue, value, level = 0, onInsertNode, onDeleteNode, onEditNode, onChange, ...comp } = props;
  const [containerRef, setContainerRef] = useCallbackRef<HTMLDivElement>();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 0,
      },
    }),
  );

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const viewValue = useMemo(() =>
    (isControlled ? value : internalValue) ?? [],
  [internalValue, isControlled, value]);
  useEffect(() => {
    onChange?.(viewValue);
  }, [onChange, viewValue]);

  const handleEditNode = (self?: TreeNode) => {
    if (!isControlled) {
      if (!self) return;

      const newValue = updateTree(viewValue, (node) => {
        if (node.readonly !== self.readonly) {
          const updated = updateNode(self, { readonly: self.readonly }, true);
          Object.assign(node, updated);
        }
        else {
          Object.assign(node, self);
        }
      }, self);
      setInternalValue(newValue);
    }
    onEditNode?.(self);
  };

  const handleAppendChild = (parent?: TreeNode, child?: TreeNode) => {
    if (!isControlled) {
      const newValue = updateTree(viewValue, (node) => {
        if (child) {
          node.children = [...node.children ?? [], child];
        }
      }, parent);
      setInternalValue(newValue);
    }
    onInsertNode?.(child);
  };

  const handleRemoveChild = (parent?: TreeNode, child?: TreeNode) => {
    if (!isControlled) {
      const newValue = updateTree(viewValue, (node) => {
        if (child) {
          node.children = node.children?.filter((n) => n.id !== child.id);
        }
      }, parent);
      setInternalValue(newValue);
    }
    onDeleteNode?.(child);
  };

  const handleSortUp = (active: Active, over: Over) => {
    if (!isControlled) {
      const activeNode = active.data.current as TreeNode;
      const overNode = over.data.current as TreeNode;

      let parent = overNode.parent;
      let isParent = false;
      do {
        isParent = activeNode?.id === parent?.id;
        parent = parent?.parent;
      } while (parent && !isParent);
      if (isParent) return;

      const removed = updateTree(viewValue, (node) => {
        node.children = node.children?.filter((n) => n.id !== active.id);
      }, activeNode.parent);
      const newValue = updateTree(removed, (node) => {
        const children = node.children ?? [];
        const idx = children.findIndex((n) => n.id === over.id);
        if (isNumber(idx)) {
          node.children = children.toSpliced(idx, 0, { ...activeNode, parent: overNode.parent });
        }
      }, overNode.parent);

      setInternalValue(newValue);
    }
  };

  const handleSortDown = (active: Active, over: Over) => {
    if (!isControlled) {
      const activeNode = active.data.current as TreeNode;
      const overNode = over.data.current as TreeNode;

      let parent = overNode.parent;
      let isParent = false;
      do {
        isParent = activeNode?.id === parent?.id;
        parent = parent?.parent;
      } while (parent && !isParent);
      if (isParent) return;

      const removed = updateTree(viewValue, (node) => {
        node.children = node.children?.filter((n) => n.id !== active.id);
      }, activeNode.parent);
      const newValue = updateTree(removed, (node) => {
        const children = node.children ?? [];
        const idx = children.findIndex((n) => n.id === over.id);
        if (isNumber(idx)) {
          node.children = children.toSpliced(idx + 1, 0, { ...activeNode, parent: overNode.parent });
        }
      }, overNode.parent);

      setInternalValue(newValue);
    }
  };

  const handleAssignChild = (active: Active, over: Over) => {
    if (!isControlled) {
      const activeNode = active.data.current as TreeNode;
      const overNode = over.data.current as TreeNode;

      if (overNode.readonly || activeNode.readonly) return;

      let parent = overNode.parent;
      let isParent = false;
      do {
        isParent = activeNode?.id === parent?.id;
        parent = parent?.parent;
      } while (parent && !isParent);
      if (isParent) return;

      const removed = updateTree(viewValue, (node) => {
        node.children = node.children?.filter((n) => n.id !== active.id);
      }, activeNode.parent);
      const newValue = updateTree(removed, (node) => {
        const children = node.children ?? [];
        node.children = children.toSpliced(children.length, 0, { ...activeNode, parent: overNode });
      }, overNode);

      setInternalValue(newValue);
    }
  };


  return (
    <DndContext
      sensors={sensors}
      measuring={{
        droppable: { strategy: MeasuringStrategy.Always },
      }}
      modifiers={[restrictToElement(containerRef)]}
      collisionDetection={closestCenter}
    >
      <div ref={setContainerRef} {...comp}>
        {viewValue.map((node) => (
          <TreeItem
            key={node.id}
            self={node}
            level={level}
            onEditNode={handleEditNode}
            onAppendChild={handleAppendChild}
            onRemoveChild={handleRemoveChild}
            onSortUp={handleSortUp}
            onSortDown={handleSortDown}
            onAssignChild={handleAssignChild}
          />
        ))}
      </div>
    </DndContext>
  );
}

const updateTree = (nodes: TreeNode[], updater: (node: TreeNode) => void, target?: TreeNode): TreeNode[] => {
  if (!target) {
    const updated = { id: 'root', label: 'Root', children: [...nodes] } satisfies TreeNode;
    updater(updated);
    return updated.children;
  }
  else {
    const newNodes = nodes.map((node) => {
      if (node.id === target.id) {
        const updated = { ...node };
        updater(updated);
        return updated;
      }
      else {
        if (node.children) {
          return {
            ...node,
            children: updateTree([...node.children], updater, target),
          };
        }
      }
      return node;
    });

    return newNodes;
  }
};

const updateNode = (node: TreeNode, values: Partial<TreeNode>, recursive?: boolean): TreeNode => {
  let children = values.children ?? node.children;
  if (recursive) {
    children = children?.map((child) => updateNode(child, values, recursive));
  }

  return {
    ...node,
    ...values,
    children,
  };
};

const restrictToElement = (container: MutableRefObject<HTMLDivElement | null>): Modifier => {
  return ({ transform, draggingNodeRect }) => {
    if (!container.current || !draggingNodeRect) return transform;
    const containerRect = container.current.getBoundingClientRect();

    const x = Math.min(
      containerRect.right - draggingNodeRect.right + 24,
      Math.max(containerRect.left - draggingNodeRect.left - 24, transform.x),
    );
    const y = Math.min(
      containerRect.bottom - draggingNodeRect.bottom + draggingNodeRect.height / 3,
      Math.max(containerRect.top - draggingNodeRect.top - draggingNodeRect.height / 3, transform.y),
    );

    return { ...transform, x, y };
  };
};
