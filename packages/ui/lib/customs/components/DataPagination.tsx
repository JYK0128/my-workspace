import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button, Pagination, PaginationContent, PaginationItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#shadcn/components/ui/index.ts';

type Props<T> = {
  length?: number
  size?: number[]
  table: Table<T>
};


/** 데이터 페이지네이션 도구 */
export function DataPagination<T>({ table, length = 5, size = [10, 20, 30, 50] }: Props<T>) {
  const {
    pagination: { pageIndex, pageSize },
  } = table.getState();

  const pageCount = table.getPageCount();
  const visiblePages = (() => {
    const half = Math.floor(length / 2);
    let start = Math.max(0, pageIndex - half);
    let end = start + length - 1;

    if (end >= pageCount) {
      end = pageCount - 1;
      start = Math.max(0, end - length + 1);
    }

    return Array
      .from({ length }, (_, i) => start + i)
      .filter((page) => page < pageCount);
  })();

  const handlePageIndex = (page: number) => {
    return () => table.setPageIndex(page);
  };

  const handleChangePageSize = (size: string) => {
    table.setPagination({ pageIndex: 0, pageSize: +size });
  };

  return (
    <div className="tw:grid tw:grid-cols-[1fr_auto_1fr] tw:items-center">
      <div />
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              disabled={!table.getCanPreviousPage()}
              onClick={table.firstPage}
            >
              <ChevronsLeft />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              disabled={!table.getCanPreviousPage()}
              onClick={table.previousPage}
            >
              <ChevronLeft />
            </Button>
          </PaginationItem>
          {visiblePages.map((page) => (
            <Button
              key={page}
              onClick={handlePageIndex(page)}
              variant={page === pageIndex ? 'outline' : 'ghost'}
              disabled={page === pageIndex}
            >
              {page + 1}
            </Button>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              disabled={!table.getCanNextPage()}
              onClick={table.nextPage}
            >
              <ChevronRight />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              disabled={!table.getCanNextPage()}
              onClick={table.lastPage}
            >
              <ChevronsRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <div className="tw:flex tw:justify-between tw:items-center tw:gap-1">
        <Select defaultValue={`${pageSize}`} onValueChange={handleChangePageSize}>
          <SelectTrigger className="tw:max-w-20 tw:justify-self-end">
            <SelectValue placeholder="개수" />
          </SelectTrigger>
          <SelectContent>
            {
              size.map((v) => (
                <SelectItem key={v} value={`${v}`}>{`${v} 개`}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
        <div>{`총 ${table.getPageCount()} 페이지`}</div>
      </div>
    </div>
  );
}
