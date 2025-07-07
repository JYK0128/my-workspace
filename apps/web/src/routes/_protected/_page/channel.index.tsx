import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { ChannelCreate } from '#/routes/_protected/-modal/channel-create';
import { Channel, Table, useInfiniteQuery, useTRPC } from '@packages/trpc';
import { Button, DataTable, StepModal } from '@packages/ui';
import { createFileRoute } from '@tanstack/react-router';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

export const Route = createFileRoute('/_protected/_page/channel/')({
  component: withMenu(RouteComponent),
  staticData: {
    order: 2,
    title: '채팅',
  },
});

const columns: ColumnDef<Table<Channel>>[] = [
  {
    id: 'title',
    header: '제목',
    cell: ({ row }) => (
      <div>
        <div>{row.original.name}</div>
        <div>{row.original.description}</div>
      </div>
    ),
  },
];

function RouteComponent() {
  const trpc = useTRPC();
  const { data, fetchNextPage, refetch, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.getChannelCursor.infiniteQueryOptions({
      cursor: { index: -1, size: 10 },
      orders: [{ field: 'id', sort: 'desc' }],
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

      <div className="tw:h-30">
        <DataTable
          data={allRows}
          columns={columns}
          rowCount={allRows.length}
          onReachLastRow={() => {
            console.log(hasNextPage, isFetchingNextPage);
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
        />
      </div>
    </div>

  );
}
