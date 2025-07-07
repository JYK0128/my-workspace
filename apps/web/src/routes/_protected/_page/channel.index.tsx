import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { ChannelCreate } from '#/routes/_protected/-modal/channel-create';
import { Output, useInfiniteQuery, useTRPC } from '@packages/trpc';
import { Button, DataTable, DataTools, HoverCard, HoverCardContent, HoverCardTrigger, StepModal, ToolOptions } from '@packages/ui';
import { createFileRoute } from '@tanstack/react-router';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/_protected/_page/channel/')({
  component: withMenu(RouteComponent),
  staticData: {
    order: 2,
    title: '채팅',
  },
});

const columns: ColumnDef<Output<'getChannelCursor'>>[] = [
  {
    accessorKey: 'id',
    header: '번호',
    size: 60,
  },
  {
    accessorKey: 'name',
    header: '제목',
    size: 300,
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="tw:size-full">
            {row.original.name}
          </div>
        </HoverCardTrigger>
        {row.original.description && (
          <HoverCardContent align="start">
            {row.original.description}
          </HoverCardContent>
        )}
      </HoverCard>
    ),
  },
  {
    accessorKey: 'count',
    header: '유저수',
    size: 60,
  },
];

const toolOptions: ToolOptions<Output<'getChannelCursor'>> = {
  search: {
    id: null,
    value: '',
    items: [
      { label: '제목', value: 'name' },
      { label: '상세', value: 'description' },
    ],
  },
};

function RouteComponent() {
  const form = useForm({
    defaultValues: toolOptions,
  });
  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);

  const trpc = useTRPC();
  const { data, fetchNextPage, refetch, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.getChannelCursor.infiniteQueryOptions({
      cursor: { index: -1, size: 10 },
      orders: [{ field: 'id', sort: 'desc' }],
      filters: {
        logic: 'and',
        search: filterState.map((v) => ({ condition: 'contains', field: v.id as any, value: v.value })),
      },
    },
    {
      getNextPageParam: (lastPage) => {
        const lastItem = lastPage.content.at(-1);
        if (!lastItem) return;

        return {
          index: +lastItem.id,
          size: 10,
        };
      },
      getPreviousPageParam: (lastPage) => {
        const firstItem = lastPage.content.at(0);
        if (!firstItem) return;

        return {
          index: +firstItem.id,
          size: 10,
        };
      },
    }),
  );
  const allRows = useMemo(() => {
    return data ? data.pages.flatMap((d) => d.content) : [];
  }, [data]);

  return (
    <div>
      {/* 생성 */}
      <StepModal
        callback={refetch}
        render={[<ChannelCreate key="create" />]}
      >
        <Button>생성</Button>
      </StepModal>

      <div className="tw:h-60">
        <DataTable
          data={allRows}
          columns={columns}
          rowCount={allRows.length}
          onReachLastRow={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          renderTools={({ table }) => (
            <DataTools {...{ table, form }} />
          )}
          onColumnFilters={(s) => {
            setFilterState(s);
          }}
        />
      </div>
    </div>

  );
}
