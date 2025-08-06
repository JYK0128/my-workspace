import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, Header, Table as ReactTable } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';
import { CSSProperties, useMemo } from 'react';

import { DataTableContextMenu } from '#customs/components/index.ts';
import { Separator, TableHead } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

type Props<T> = {
  table: ReactTable<T>
  header: Header<T, unknown>
};


/** 테이블 head */
export function DataTableHead<T>(props: Props<T>) {
  const { table, header } = props;
  const isPinned = header.column.getIsPinned();
  const isLeftLastPin = header.column.getIsLastColumn(isPinned);
  const isRightFirstPin = header.column.getIsFirstColumn(isPinned);
  const canResize = header.column.getCanResize();
  const canSort = header.column.getCanSort();
  const canPin = header.column.getCanPin();
  const cnaHide = header.column.getCanHide();

  const {
    isDragging, transform,
    setNodeRef, attributes, listeners,
  } = useSortable({ id: header.column.id });


  const pinningStyles = useMemo(() => getColumnPinningStyles({
    isPinned,
    isLeftLastPin,
    isRightFirstPin,
  }), [isLeftLastPin, isPinned, isRightFirstPin]);
  const sortStyles = useMemo(() => getColumnSortStyles(isDragging), [isDragging]);
  const commonStyles = useMemo(() => cn(
    'tw:border-border tw:border-solid tw:border-b',
  ), []);

  const dynamicStyles: CSSProperties = {
    width: header.column.getSize() + ((canSort || canPin || cnaHide) ? 36 : 0),
    left: isPinned ? header.column.getStart('left') : undefined,
    right: isPinned ? header.column.getAfter('right') : undefined,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <TableHead
      ref={setNodeRef}
      key={header.id}
      colSpan={header.colSpan}
      className={cn(
        commonStyles,
        pinningStyles,
        sortStyles,
      )}
      style={dynamicStyles}
    >
      {
        !header.isPlaceholder
        && (
          <div className="tw:group tw:size-full tw:flex tw:items-center tw:gap-x-1">
            {/* 테이블 헤더 - 제목 */}
            <div
              className="tw:flex-1"
              {...attributes}
              {...listeners}
            >
              {
                flexRender(header.column.columnDef.header, header.getContext())
              }
            </div>
            {/* 테이블 헤더 - 아이콘 */}
            {(canSort || canPin || cnaHide) && (
              <DataTableContextMenu {...{ table, header }} />
            )}

            {/* 테이블 헤더 - 사이징 */}
            <Separator
              orientation="vertical"
              className={cn(
                canResize ? 'tw:cursor-col-resize tw:group-hover:w-1' : '',
              )}
              style={{ right: 0 }}
              onDoubleClick={header.column.resetSize}
              onMouseDown={header.getResizeHandler()}
              onTouchStart={header.getResizeHandler()}
            />
          </div>
        )
      }
    </TableHead>
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
