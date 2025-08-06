import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Row, TableState } from '@tanstack/react-table';
import { defaultTo } from 'lodash-es';
import { ComponentPropsWithoutRef, CSSProperties, ForwardedRef, forwardRef, useMemo } from 'react';

import { DataTableCell } from '#customs/components/index.ts';
import { TableRow } from '#shadcn/components/ui/index.ts';
import { cn, cv } from '#shadcn/lib/utils.ts';

type Props<T> = {
  row: Row<T>
  state: TableState
} & ComponentPropsWithoutRef<'tr'>;


/** 테이블 row */
export const DataTableRow = forwardRef(
  function DataTableRowInner<T>(
    props: Props<T>,
    ref: ForwardedRef<HTMLTableRowElement>,
  ) {
    const { row, state, ...rest } = props;
    const { isDragging, transform, setNodeRef } = useSortable({
      id: row.id,
    });

    const pinningStyles = useMemo(() => getRowPinningStyles(row, state), [row, state]);
    const sortStyles = useMemo(() => getRowSortStyles({ isDragging }), [isDragging]);

    const commonStyles = useMemo(() => cn(
      'tw:hover:bg-blue-200',
      row.getCanMultiSelect() === false ? `tw:cursor-pointer` : '',
    ), [row]);
    const dynamicStyles: CSSProperties = {
      transform: CSS.Translate.toString(transform),
    };


    return (
      <TableRow
        {...rest}
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          }
          else if (ref) {
            ref.current = node;
          }
          setNodeRef(node);
        }}
        key={row.id}
        className={cn(
          commonStyles,
          pinningStyles,
          sortStyles,
        )}
        style={{ ...dynamicStyles, ...rest.style }}
      >
        {row.getVisibleCells().map((cell) => {
        // IMPROVE: memo from datatable
          const leftPinnedItems = state.columnPinning.left || [];
          const centerItems = state.columnOrder.filter((id) =>
            !(state.columnPinning.left?.includes(id) || state.columnPinning.right?.includes(id)),
          );
          const rightPinnedItems = state.columnPinning.right || [];

          return ({
            left: (
              <SortableContext
                key={cell.id}
                items={leftPinnedItems}
                strategy={horizontalListSortingStrategy}
              >
                <DataTableCell key={cell.id} cell={cell} />
              </SortableContext>
            ),
            right: (
              <SortableContext
                key={cell.id}
                items={rightPinnedItems}
                strategy={horizontalListSortingStrategy}
              >
                <DataTableCell key={cell.id} cell={cell} />
              </SortableContext>
            ),
            false: (
              <SortableContext
                key={cell.id}
                items={centerItems}
                strategy={horizontalListSortingStrategy}
              >
                <DataTableCell key={cell.id} cell={cell} />
              </SortableContext>
            ),
          }[`${cell.column.getIsPinned()}`]);
        })}
      </TableRow>
    );
  },
);

/** Column Pinning Style */
function getRowPinningStyles<T>(row: Row<T>, state: TableState) {
  const isPinned = row.getIsPinned();

  const styles = cv((key: 'top' | 'bottom', row: Row<T>) => ({
    top: cn(
      row.getPinnedIndex() === (defaultTo(state.rowPinning.top?.length, 0) - 1) ? 'tw:shadow-[-4px_0_4px_-4px_gray_inset]' : '',
      `tw:sticky tw:z-10 tw:bg-background`,
    ),
    bottom: cn(
      row.getPinnedIndex() === (defaultTo(state.rowPinning.bottom?.length, 0) - 1) ? 'tw:shadow-[4px_0_4px_-4px_gray_inset]' : '',
      `tw:sticky tw:z-10 tw:bg-background`,
    ),
  }[key]));

  return isPinned ? styles[isPinned](row) : '';
};

/** Column Sort Styles */
function getRowSortStyles(sortable: Partial<ReturnType<typeof useSortable>>) {
  const { isDragging, transform } = sortable;

  const styles = cv((dragging: 'true') => ({
    true: cn(
      'tw:z-10', 'tw:opacity-80',
      'tw:transition-transform',
    ),
  }[dragging]));

  return isDragging && transform ? styles[`${isDragging}`]() : '';
}
