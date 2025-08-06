import { Active, ClientRect, Over, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { cva } from 'class-variance-authority';
import { ChevronRight, Pencil, Plus, Trash } from 'lucide-react';
import { MouseEventHandler, useState } from 'react';

import { StepModal, TreeItemEditor, TreeItemEditorCallback, TreeNode } from '#customs/components/index.ts';
import { useEventUtils, useMessage } from '#customs/hooks/index.ts';
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

const styles = cva('', {
  variants: {
    action: {
      UP: 'tw:border-t-blue-400 tw:border-solid tw:border-t-2',
      IN: 'tw:bg-blue-400',
      DOWN: 'tw:border-b-blue-400 tw:border-solid tw:border-b-2',
    },
    level: {
      false: '',
      true: 'tw:pl-6',
    },
  },
});

type TreeItemProps = {
  self: TreeNode
  level: number
  onEditNode?: (node?: TreeNode) => void
  onAppendChild?: (parent?: TreeNode, child?: TreeNode) => void
  onRemoveChild?: (parent?: TreeNode, child?: TreeNode) => void
  onSortUp?: (active: Active, over: Over) => void
  onSortDown?: (active: Active, over: Over) => void
  onAssignChild?: (active: Active, over: Over) => void
};


/** 트리 아이템 */
export function TreeItem(props: TreeItemProps) {
  const {
    self, level, onAppendChild, onRemoveChild, onEditNode,
    onSortUp, onSortDown, onAssignChild,
  } = props;

  const { message } = useMessage();
  const { stop } = useEventUtils();
  const { setNodeRef: setDraggableRef, attributes, listeners, transform } = useDraggable({
    id: self.id,
    data: self,
  });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: self.id,
    data: self,
  });

  const [action, setAction] = useState<'UP' | 'IN' | 'DOWN'>();
  const actionMap = {
    UP: (active: Active, over: Over) => onSortUp?.(active, over),
    DOWN: (active: Active, over: Over) => onSortDown?.(active, over),
    IN: (active: Active, over: Over) => onAssignChild?.(active, over),
  };

  useDndMonitor({
    onDragMove({ active, over }) {
      const activeRect = active.rect.current.translated;
      const overRect = over?.rect;

      if (isOver
        && activeRect && overRect
        && active.id !== over.id) {
        const newAction = getIntersection(activeRect, overRect);
        if (action !== newAction) {
          setAction(newAction);
        }
      }
      else {
        if (action) {
          setAction(undefined);
        }
      }
    },
    onDragEnd({ active, over }) {
      if (isOver && over && action) {
        actionMap[action](active, over);
      }
      if (action) {
        setAction(undefined);
      }
    },
  });

  const handleEditNode = ({ type, ...newNode }: TreeItemEditorCallback) => {
    switch (type) {
      case 'register':
        onAppendChild?.(self, {
          id: `${self.id}-${(self.children?.length ?? 0) + 1}`,
          parent: self,
          ...newNode,
        });
        return;
      case 'updater':
        onEditNode?.({
          ...self,
          ...newNode,
        });
        return;
      default:
        throw Error('unknown error');
    }
  };

  const handleRemoveNode: MouseEventHandler<HTMLButtonElement> = async () => {
    const res = await message({
      type: 'confirm',
      title: '알림',
      description: '삭제하시겠습니까?',
    });
    if (res) {
      onRemoveChild?.(self.parent, self);
    }
  };


  return (
    <Collapsible
      className={cn(
        styles({ action, level: !!level }),
      )}
    >
      <CollapsibleTrigger asChild>
        <div
          style={{ transform: `translate3d(${transform?.x ?? 0}px, ${transform?.y ?? 0}px, 0)` }}
          className="tw:group tw:flex tw:items-center tw:gap-2"
          ref={(node) => {
            setDraggableRef(node);
            setDroppableRef(node);
          }}
          {...listeners}
          {...attributes}
        >
          {/* 아이콘 영역 */}
          {self.children?.length
            ? (
              <ChevronRight className="tw:transition-transform tw:group-data-[state=open]:rotate-90" />
            )
            : (
              <div className="tw:size-6" />
            )}
          {/* 라벨 영역 */}
          <span>
            {self.label}
          </span>

          {/* 버튼영역 */}
          <div className="tw:flex tw:items-center tw:gap-0.5" onClick={stop}>
            {/* 추가 버튼 */}
            <StepModal
              callback={handleEditNode}
              render={[
                <TreeItemEditor key="item-editor" type="register" />,
              ]}
            >
              <Button
                size="icon"
                variant="ghost"
                disabled={self.readonly}
              >
                <Plus />
              </Button>
            </StepModal>
            {/* 수정 버튼 */}
            <StepModal
              callback={handleEditNode}
              render={[
                <TreeItemEditor key="item-editor" type="updater" node={self} />,
              ]}
            >
              <Button
                size="icon"
                variant="ghost"
              >
                <Pencil />
              </Button>
            </StepModal>
            {/* 삭제 버튼 */}
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRemoveNode}
              disabled={self.readonly}
            >
              <Trash />
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>

      {/* 하위 아이템 */}
      {!!self.children?.length && (
        <CollapsibleContent>
          {self.children.map((child) => (
            <TreeItem
              key={child.id}
              self={{
                readonly: child.readonly ?? self.readonly,
                parent: child.parent ?? self,
                ...child,
              }}
              level={level + 1}
              onEditNode={onEditNode}
              onAppendChild={onAppendChild}
              onRemoveChild={onRemoveChild}
              onSortUp={onSortUp}
              onSortDown={onSortDown}
              onAssignChild={onAssignChild}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

const getIntersection = (activeRect: ClientRect, overRect: ClientRect) => {
  const top = overRect.top;
  const border01 = overRect.top + overRect.height / 3;
  const border02 = overRect.top + overRect.height / 1.5;
  const bottom = overRect.bottom;

  const range = {
    UP: { min: top, max: border01 },
    IN: { min: border01, max: border02 },
    DOWN: { min: border02, max: bottom },
  };

  const pointer = (activeRect.top + activeRect.bottom) / 2;
  const [name] = Object.entries(range).find((v) => v[1].min <= pointer && pointer < v[1].max) || [];

  return name as Optional<'UP' | 'IN' | 'DOWN'>;
};
