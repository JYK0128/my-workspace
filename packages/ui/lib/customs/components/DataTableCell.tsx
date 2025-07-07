import { TableCell } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Cell, flexRender } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { defaultTo } from 'lodash-es';
import { CSSProperties, useMemo } from 'react';

type Props<T> = {
  cell: Cell<T, unknown>
};


/** 테이블 Cell 항목 */
export function DataTableCell<T>(props: Props<T>) {
  const { cell } = props;
  const isPinned = cell.column.getIsPinned();
  const isLeftLastPin = cell.column.getIsLastColumn(isPinned);
  const isRightFirstPin = cell.column.getIsFirstColumn(isPinned);
  const { ellipsis, textAlign } = cell.column.columnDef.meta ?? {};
  const {
    isDragging, transform,
    setNodeRef,
  } = useSortable({ id: cell.column.id });


  const pinningStyles = useMemo(() => getColumnPinningStyles({
    isPinned,
    isLeftLastPin,
    isRightFirstPin,
  }), [isLeftLastPin, isPinned, isRightFirstPin]);
  const sortStyles = useMemo(() => getColumnSortStyles(isDragging), [isDragging]);
  const commonStyles = useMemo(() => cn(
    'tw:border-border tw:border-solid tw:border-b',
    defaultTo(ellipsis, true) ? 'tw:truncate' : undefined,
  ), [ellipsis]);

  const dynamicStyles: CSSProperties = {
    width: cell.column.getSize(),
    left: isPinned ? cell.column.getStart('left') : undefined,
    right: isPinned ? cell.column.getAfter('right') : undefined,
    transform: CSS.Translate.toString(transform),
    textAlign,
  };


  return (
    <TableCell
      ref={setNodeRef}
      key={cell.id}
      className={cn(
        commonStyles,
        pinningStyles,
        sortStyles,
      )}
      style={dynamicStyles}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

/** Column Pinning Style */
type pinningParams = {
  isPinned: 'left' | 'right' | false
  isLeftLastPin: boolean
  isRightFirstPin: boolean
};
function getColumnPinningStyles(params: pinningParams) {
  const { isPinned, isLeftLastPin, isRightFirstPin } = params;
  const styles = cva('', {
    variants: {
      isPinned: {
        left: cn(
          'tw:bg-background',
          'tw:sticky tw:z-10',
          isLeftLastPin ? 'tw:shadow-[-4px_0_4px_-4px_gray_inset]' : undefined,
        ),
        right: cn(
          'tw:bg-background',
          'tw:sticky tw:z-10',
          isRightFirstPin ? 'tw:shadow-[4px_0_4px_-4px_gray_inset]' : undefined,
        ),
        false: '',
      },
    },
  });

  return styles({ isPinned });
};

/** Column Sort Styles */
function getColumnSortStyles(isDragging: boolean) {
  const styles = cva('', {
    variants: {
      isDragging: {
        true: 'tw:transition-transform tw:bg-background',
        false: '',
      },
    },
  });

  return styles({ isDragging });
}
