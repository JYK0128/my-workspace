import { Column, Header, Table as ReactTable } from '@tanstack/react-table';
import { ArrowBigLeft, ArrowBigRight, ArrowDownAZ, ArrowUpDown, ArrowUpZA, EyeClosed, EyeOff, Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '#shadcn/components/ui/index.ts';

type Props<T> = {
  table: ReactTable<T>
  header: Header<T, unknown>
};


/** 테이블 Context 메뉴 */
export function DataTableContextMenu<T>(props: Props<T>) {
  const { table, header } = props;
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="link">
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* 아이콘 */}
        <DropdownMenuLabel>
          {/* 테이블 - 헤더 정렬 */}
          <Button
            disabled={!header.column.getCanSort()}
            size="icon"
            variant="link"
            onClick={header.column.getToggleSortingHandler()}
          >
            {{
              false: <ArrowUpDown />,
              asc: <ArrowDownAZ />,
              desc: <ArrowUpZA />,
            }[`${header.column.getIsSorted()}`]}
          </Button>
          {/* 테이블 - 헤더 핀 */}
          { header.column.getIsPinned() !== 'left' && (
            <Button
              disabled={!header.column.getCanPin()}
              size="icon"
              variant="link"
              onClick={() => header.column.pin('left')}
            >
              <ArrowBigLeft />
            </Button>
          )}
          { header.column.getIsPinned() && (
            <Button
              disabled={!header.column.getCanPin()}
              size="icon"
              variant="link"
              onClick={() => header.column.pin(false)}
            >
              <X />
            </Button>
          )}
          { header.column.getIsPinned() !== 'right' && (
            <Button
              disabled={!header.column.getCanPin()}
              size="icon"
              variant="link"
              onClick={() => header.column.pin('right')}
            >
              <ArrowBigRight />
            </Button>
          )}
          {/* 테이블 - 헤더 숨김 */}
          <Button
            disabled={!header.column.getCanHide()}
            size="icon"
            variant="link"
            onClick={header.column.getToggleVisibilityHandler()}
          >
            {{
              true: <EyeOff />,
              false: <EyeClosed />,
            }[`${header.column.getIsVisible()}`]}
          </Button>
        </DropdownMenuLabel>

        {/* 필터 */}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!header.column.getCanFilter()}>
              필터
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DataTableFaceting column={header.column} close={() => setOpen(false)} />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            disabled={!header.column.getCanFilter()}
            onSelect={() => header.column.setFilterValue(undefined)}
          >
            필터 해제
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanFilter()}
            onSelect={() => table.resetColumnFilters()}
          >
            필터 초기화
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* 정렬 */}
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!header.column.getCanSort()}
            onSelect={() => header.column.toggleSorting(false)}
          >
            오름 차순
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanSort()}
            onSelect={() => header.column.toggleSorting(true)}
          >
            내림 차순
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanSort()}
            onSelect={() => header.column.clearSorting()}
          >
            정렬 해제
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* 고정 */}
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!header.column.getCanPin()}
            onSelect={() => header.column.pin('left')}
          >
            왼쪽 고정
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanPin()}
            onSelect={() => header.column.pin('right')}
          >
            오른쪽 고정
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanPin()}
            onSelect={() => header.column.pin(false)}
          >
            고정 해제
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/* 숨기기 */}
        <DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!header.column.getCanHide()}
            onSelect={() => header.column.toggleVisibility(false)}
          >
            숨기기
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!header.column.getCanHide()}
            onSelect={() => table.resetColumnVisibility()}
          >
            모두 보기
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** DataTable Faceting Tool */
function DataTableFaceting<T>({ column, close }: { column: Column<T>, close?: () => void }) {
  const suggestions = useMemo(() =>
    Array.from(column.getFacetedUniqueValues().keys())
      .sort()
      .slice(0, 5000),
  [column],
  );

  return (
    <Command>
      <CommandInput
        placeholder="Filter label..."
        autoFocus={true}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            column.setFilterValue(e.currentTarget.value);
            close?.();
          }
        }}
      />
      <CommandList>
        <CommandEmpty>No label found.</CommandEmpty>
        <CommandGroup>
          {
            suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion}
                value={suggestion}
                onSelect={(v) => {
                  column.setFilterValue(v);
                  close?.();
                }}
              >
                {suggestion}
              </CommandItem>
            ))
          }
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
