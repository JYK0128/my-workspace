import { DataTableHead, DataTableRow } from '#customs/components/index.ts';
import { Table, TableBody, TableCell, TableFooter, TableHeader, TableRow } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { closestCorners, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, horizontalListSortingStrategy, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AccessorKeyColumnDef, ColumnFiltersState, ColumnPinningState, ColumnSizingInfoState, ColumnSizingState, ExpandedState, getCoreRowModel, getExpandedRowModel, getFacetedMinMaxValues, getFacetedRowModel, getFacetedUniqueValues, getFilteredRowModel, getGroupedRowModel, getPaginationRowModel, getSortedRowModel, GlobalFilterTableState, GroupingState, PaginationState, Table as ReactTable, Row, RowData, RowPinningState, RowSelectionState, SortingState, TableCore, TableState, Updater, useReactTable } from '@tanstack/react-table';
import { Dispatch, Fragment, memo, PropsWithChildren, ReactElement, SetStateAction, useEffect, useRef, useState } from 'react';

type BaseProps<TData extends RowData> = TableCore<TData> & {
  // wrapping
  onChangeState?: (state: TableState) => void
  onPagination?: (pagination: PaginationState) => void
  onGrouping?: (grouping: GroupingState) => void
  onExpanded?: (expanded: ExpandedState) => void
  onSorting?: (sorting: SortingState) => void
  onColumnFilters?: (sorting: ColumnFiltersState) => void
  onGlobalFilter?: (filter: GlobalFilterTableState['globalFilter']) => void
  onSelectRow?: (selected: RowSelectionState) => void
  onSize?: (size: ColumnSizingState) => void
  onSizing?: (sizeInfo: ColumnSizingInfoState) => void
  onRowPinning?: (pinning: RowPinningState) => void
  onColumnPinning?: (pinning: ColumnPinningState) => void
  // custom
  client?: boolean
  onReachFirstRow?: () => void
  onReachLastRow?: () => void
  onChangeRowSelection?: (selection: Row<TData>[]) => void
  renderRow?: (props: PropsWithChildren<{ row: Row<TData> }>) => ReactElement
  renderExpendedRow?: (props: PropsWithChildren<{ row: Row<TData> }>) => ReactElement
  renderTools?: (props: { table: ReactTable<TData> }) => ReactElement
  renderPagination?: (props: { table: ReactTable<TData> }) => ReactElement
};
type ServerProps<T> = BaseProps<T>
  & {
    client?: false
    rowCount: number
    pageIndex?: number
  };

type ClientProps<T> = BaseProps<T>
  & {
    client: true
  };

type Props<T> = ServerProps<T> | ClientProps<T>;


// TODO: Virtualization
/** 데이터 테이블 */
export function DataTable<T>(props: Props<T>) {
  const {
    columns,
    initialState,
    onChangeState,
    // 기본
    onPagination, onSorting, onSelectRow, onColumnFilters, onGlobalFilter,
    // 특수기능
    onExpanded, onGrouping, onRowPinning, onColumnPinning,
    // 디자인
    onSize, onSizing,
    // 추가기능
    onChangeRowSelection,
    onReachFirstRow, onReachLastRow,
    renderRow, renderExpendedRow, renderPagination, renderTools,
    client,
    data: initialData,
    ...options
  } = props;
  const tableRef = useRef<HTMLTableElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<TableState>({
    // basic
    pagination: {
      pageIndex: initialState?.pagination?.pageIndex ?? 0,
      pageSize: initialState?.pagination?.pageSize ?? 10,
    },
    sorting: initialState?.sorting ?? [],
    rowSelection: initialState?.rowSelection ?? {},
    // filter
    globalFilter: initialState?.globalFilter ?? undefined,
    columnFilters: initialState?.columnFilters ?? [],
    // visualize
    columnSizing: initialState?.columnSizing ?? {},
    columnSizingInfo: {
      columnSizingStart: initialState?.columnSizingInfo?.columnSizingStart ?? [],
      deltaOffset: initialState?.columnSizingInfo?.deltaOffset ?? 0,
      deltaPercentage: initialState?.columnSizingInfo?.deltaPercentage ?? 0,
      isResizingColumn: initialState?.columnSizingInfo?.isResizingColumn ?? false,
      startOffset: initialState?.columnSizingInfo?.startOffset ?? 0,
      startSize: initialState?.columnSizingInfo?.startSize ?? 0,
    },
    columnOrder: initialState?.columnOrder ?? columns.map((v) => v.id || (v as AccessorKeyColumnDef<T>).accessorKey as string),
    columnVisibility: initialState?.columnVisibility ?? {},
    expanded: initialState?.expanded ?? {},
    rowPinning: initialState?.rowPinning ?? {},
    columnPinning: initialState?.columnPinning ?? {},
    // TODO: feat) grouping
    grouping: initialState?.grouping ?? [],
  });
  useEffect(() => {
    onChangeState?.(state);
  }, [onChangeState, state]);

  const [data, setData] = useState<T[]>(initialData);
  useEffect(() => {
    if (!client) setData(initialData);
  }, [client, initialData]);

  const table = useReactTable({
    ...options,
    data,
    columns,
    state,
    onStateChange: setState,

    // core model
    getCoreRowModel: getCoreRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: handleStateChange(updateState(setState, 'rowSelection'), onSelectRow),
    // page model
    manualPagination: !client,
    getPaginationRowModel: client ? getPaginationRowModel() : undefined,
    onPaginationChange: handleStateChange(updateState(setState, 'pagination'), onPagination),
    // grouping model
    manualGrouping: !client,
    getGroupedRowModel: client ? getGroupedRowModel() : undefined,
    onGroupingChange: handleStateChange(updateState(setState, 'grouping'), onGrouping),
    // expending model
    manualExpanding: !client,
    getExpandedRowModel: client ? getExpandedRowModel() : undefined,
    onExpandedChange: handleStateChange(updateState(setState, 'expanded'), onExpanded),
    // filtering model
    manualFiltering: !client,
    getFilteredRowModel: client ? getFilteredRowModel() : undefined,
    onColumnFiltersChange: handleStateChange(updateState(setState, 'columnFilters'), onColumnFilters),
    onGlobalFilterChange: handleStateChange(updateState(setState, 'globalFilter'), onGlobalFilter),
    // faceting model
    getFacetedRowModel: getFacetedRowModel(),
    // sorting model
    manualSorting: !client,
    getSortedRowModel: client ? getSortedRowModel() : undefined,
    onSortingChange: handleStateChange(updateState(setState, 'sorting'), onSorting),
    // sizing
    onColumnSizingChange: handleStateChange(updateState(setState, 'columnSizing'), onSize),
    onColumnSizingInfoChange: handleStateChange(updateState(setState, 'columnSizingInfo'), onSizing),
    // pin
    onRowPinningChange: handleStateChange(updateState(setState, 'rowPinning'), onRowPinning),
    onColumnPinningChange: handleStateChange(updateState(setState, 'columnPinning'), onColumnPinning),
  });

  // change row selection(client: all / server: current page)
  useEffect(() => {
    const { rows } = table.getSelectedRowModel();
    if (onChangeRowSelection) onChangeRowSelection(rows);
  }, [client, onChangeRowSelection, state.rowSelection, table]);


  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    if (state.columnOrder.includes(`${active.id}`)) {
      handleColumnDragEnd(event);
    }
    else {
      handleRowDragEnd(event);
    }
  };

  const handleColumnDragEnd = (event: Mandatory<DragEndEvent, 'active' | 'over'>) => {
    const { active, over } = event;
    if (!over) return;

    const ids = [active.id, over.id];
    const left = state.columnPinning.left;
    const right = state.columnPinning.right;

    const isLeftSome = ids.some((v) => left?.includes(`${v}`));
    const isRightSome = ids.some((v) => right?.includes(`${v}`));
    const isLeftAll = ids.every((v) => left?.includes(`${v}`));
    const isRightAll = ids.every((v) => right?.includes(`${v}`));


    if (!(isLeftSome || isRightSome)) {
      updateState(setState, 'columnOrder')((columnOrder) => {
        const oldIndex = columnOrder.indexOf(`${active.id}`);
        const newIndex = columnOrder.indexOf(`${over.id}`);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }

    if (isLeftAll) {
      updateState(setState, 'columnPinning')((columnPinning) => {
        if (!columnPinning.left) return columnPinning;
        const oldIndex = columnPinning.left.indexOf(`${active.id}`);
        const newIndex = columnPinning.left.indexOf(`${over.id}`);

        const newLeft = arrayMove(columnPinning.left, oldIndex, newIndex);
        return { ...columnPinning, left: newLeft };
      });
    }

    if (isRightAll) {
      updateState(setState, 'columnPinning')((columnPinning) => {
        if (!columnPinning.right) return columnPinning;
        const oldIndex = columnPinning.right.indexOf(`${active.id}`);
        const newIndex = columnPinning.right.indexOf(`${over.id}`);

        const newRight = arrayMove(columnPinning.right, oldIndex, newIndex);
        return { ...columnPinning, right: newRight };
      });
    }
  };

  const handleRowDragEnd = (event: Mandatory<DragEndEvent, 'active' | 'over'>) => {
    const { active, over } = event;
    if (!over) return;

    const ids = [active.id, over.id];
    const top = state.rowPinning.top;
    const bottom = state.rowPinning.bottom;

    const isTopSome = ids.some((v) => top?.includes(`${v}`));
    const isBottomSome = ids.some((v) => bottom?.includes(`${v}`));
    const isTopAll = ids.every((v) => top?.includes(`${v}`));
    const isBottomAll = ids.every((v) => bottom?.includes(`${v}`));

    // IMPROVE: how to get expended filter row model
    if (!(isTopSome || isBottomSome)) {
      const rows = table.getCoreRowModel().rows;
      const oldIndex = rows.findIndex((r) => r.id === active.id);
      const newIndex = rows.findIndex((r) => r.id === over.id);
      if (newIndex !== -1) {
        const newTop = arrayMove(rows, oldIndex, newIndex);
        setData(newTop.map((v) => v.original));
      }
    }

    if (isTopAll) {
      updateState(setState, 'rowPinning')((rowPinning) => {
        if (!rowPinning.top) return rowPinning;
        const oldIndex = rowPinning.top.indexOf(`${active.id}`);
        const newIndex = rowPinning.top.indexOf(`${over.id}`);

        const newTop = arrayMove(rowPinning.top, oldIndex, newIndex);
        return { ...rowPinning, top: newTop };
      });
    }

    if (isBottomAll) {
      updateState(setState, 'rowPinning')((rowPinning) => {
        if (!rowPinning.bottom) return rowPinning;
        const oldIndex = rowPinning.bottom.indexOf(`${active.id}`);
        const newIndex = rowPinning.bottom.indexOf(`${over.id}`);

        const newBottom = arrayMove(rowPinning.bottom, oldIndex, newIndex);
        return { ...rowPinning, bottom: newBottom };
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 0,
      },
    }),
  );

  // first row observer
  const firstRowObserverRef = useRef<IntersectionObserver>(null);
  useEffect(() => {
    const observer = rowObserver(
      onReachFirstRow,
      { root: tableScrollRef.current, threshold: 1 },
    );
    firstRowObserverRef.current = observer;

    return () => observer.disconnect();
  }, [onReachFirstRow]);

  // last row observer
  const lastRowObserverRef = useRef<IntersectionObserver>(null);
  useEffect(() => {
    const observer = rowObserver(
      onReachLastRow,
      { root: tableScrollRef.current, threshold: 1 },
    );
    lastRowObserverRef.current = observer;

    return () => observer.disconnect();
  }, [onReachLastRow]);


  return (
    <div className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto] tw:gap-y-2">
      {/* Tools */}
      <div>{renderTools && renderTools({ table })}</div>

      {/* Table */}
      <DndContext
        collisionDetection={closestCorners}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table
          ref={tableRef}
          scrollRef={tableScrollRef}
          // style={{ width: table.getTotalSize()})` }}
          style={{ width: `clamp(100%, 100%, ${table.getTotalSize()})` }}
          className={cn(
            'tw:table-fixed',
            'tw:border-separate tw:border-spacing-0',
          )}
        >
          {/* Columns */}
          <TableHeader
            className={cn(
              'tw:bg-background',
              'tw:sticky tw:top-0 tw:z-20',
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => {
              const leftPinnedHeaders = headerGroup.headers.filter((h) => h.column.getIsPinned() === 'left');
              const centerHeaders = headerGroup.headers.filter((h) => h.column.getIsPinned() === false);
              const rightPinnedHeaders = headerGroup.headers.filter((h) => h.column.getIsPinned() === 'right');

              const leftPinnedItems = state.columnPinning.left || [];
              const centerItems = state.columnOrder.filter((id) =>
                !(state.columnPinning.left?.includes(id) || state.columnPinning.right?.includes(id)),
              );
              const rightPinnedItems = state.columnPinning.right || [];

              return (
                <TableRow key={headerGroup.id}>
                  {/* Left Pinned Columns */}
                  <SortableContext items={leftPinnedItems} strategy={horizontalListSortingStrategy}>
                    {leftPinnedHeaders.map((header) => (
                      <DataTableHead key={header.id} {...{ table, header }} />
                    ))}
                  </SortableContext>

                  {/* Center Columns */}
                  <SortableContext items={centerItems} strategy={horizontalListSortingStrategy}>
                    {centerHeaders.map((header) => (
                      <DataTableHead key={header.id} {...{ table, header }} />
                    ))}
                  </SortableContext>

                  {/* Right Pinned Columns */}
                  <SortableContext items={rightPinnedItems} strategy={horizontalListSortingStrategy}>
                    {rightPinnedHeaders.map((header) => (
                      <DataTableHead key={header.id} {...{ table, header }} />
                    ))}
                  </SortableContext>
                </TableRow>
              );
            })}
            {/* Rows - top pin */}
            <SortableContext
              items={table.getTopRows()}
              strategy={verticalListSortingStrategy}
            >
              {table.getTopRows().map((row) => (
                <DataTableRow
                  key={row.id}
                  {...{ row, state }}
                />
              ))}
            </SortableContext>
          </TableHeader>
          {/* Rows */}
          <TableBody>
            {/* Rows - center */}
            {table.getRowModel().rows.length
              ? (
                <SortableContext
                  items={table.getCenterRows()}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getCenterRows().map((row, idx, arr) => {
                    const RowWrapper = wrapping(renderRow);
                    return (
                      <Fragment key={row.id}>
                        <RowWrapper row={row}>
                          <DataTableRow
                            ref={(el) => {
                              if (el && idx === 0) {
                                firstRowObserverRef.current?.observe(el);
                              }
                              else if (el && idx === arr.length - 1) {
                                lastRowObserverRef.current?.observe(el);
                              }
                            }}
                            {...{ row, state }}
                          />
                        </RowWrapper>

                        {row.getIsExpanded() && renderExpendedRow && (
                          <TableRow>
                            <TableCell colSpan={row.getAllCells().length}>
                              {renderExpendedRow({ row })}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </SortableContext>
              )
              : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    검색된 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
          {/* Summary */}
          <TableFooter
            className={cn(
              'tw:bg-background',
              'tw:sticky tw:top-0 tw:z-20',
            )}
          >
            {/* Rows - bottom */}
            <SortableContext
              items={table.getBottomRows()}
              strategy={verticalListSortingStrategy}
            >
              {table.getBottomRows().map((row) => (
                <DataTableRow
                  key={row.id}
                  {...{ row, state }}
                />
              ))}
            </SortableContext>
          </TableFooter>
        </Table>
      </DndContext>

      {/* Pagination */}
      <div>{renderPagination && renderPagination({ table })}</div>
    </div>
  );
}

/** Update State */
const updateState = <S, K extends keyof S>(setter: Dispatch<SetStateAction<S>>, key: K): Dispatch<SetStateAction<S[K]>> => {
  return (updater) => {
    setter((old) => {
      const newValue = updater instanceof Function ? updater(old[key]) : updater;
      return {
        ...old,
        [key]: newValue,
      };
    });
  };
};
/** Update state with callback */
function handleStateChange<S>(setter: Dispatch<SetStateAction<S>>, callback?: (state: S) => void) {
  return (updater: Updater<S>) => {
    setter((old) => {
      const newValue = updater instanceof Function ? updater(old) : updater;
      callback?.(newValue);
      return newValue;
    });
  };
}
/** Row Intersection Observer */
function rowObserver(callback: ((...args: unknown[]) => void) | undefined, options: IntersectionObserverInit) {
  return new IntersectionObserver((entries) => {
    const el = entries.at(0);
    if (el && el.isIntersecting && callback) callback();
  }, options);
}
/** Wrapping Fragment or Component */
function wrapping<T>(Wrapper?: (props: PropsWithChildren<T>) => ReactElement) {
  const MemoizedComponent = memo((props: PropsWithChildren<T>) => {
    return (
      Wrapper
        ? <Wrapper {...props} />
        : <Fragment>{props.children}</Fragment>
    );
  });
  MemoizedComponent.displayName = 'MemoizedComponent';
  return MemoizedComponent;
}
