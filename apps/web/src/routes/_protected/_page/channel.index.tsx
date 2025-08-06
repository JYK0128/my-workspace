import { Output, useInfiniteQuery, useMutation, useTRPC } from '@packages/trpc';
import { Button, DataTable, DataTools, HoverCard, HoverCardContent, HoverCardTrigger, Slot, StepModal, ToolOptions } from '@packages/ui';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ColumnDef, ColumnFiltersState, Row } from '@tanstack/react-table';
import { endOfDay, startOfDay, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'react-oidc-context';

import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { ChannelCreate } from '#/routes/_protected/-modal/channel-create';
import { ChannelJoin } from '#/routes/_protected/-modal/channel-join';

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
    size: 200,
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <div>
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
    accessorKey: 'is_secret',
    header: '공개여부',
    size: 80,
    cell: ({ row }) => row.original.is_secret ? '비공개' : '공개',
  },
  {
    accessorKey: 'count',
    header: '유저수',
    size: 60,
  },
  {
    accessorKey: 'created_at',
    header: '생성일',
    size: 100,
    cell: ({ row }) => new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(row.original.created_at),
  },
];

const toolOptions: ToolOptions<Output<'getChannelCursor'>> = {
  dateRange: {
    id: 'created_at',
    value: [startOfDay(subMonths(new Date(), 1)), endOfDay(new Date())],
  },
  status: {
    id: 'is_participant',
    label: '참여중인 채팅방만',
    value: false,
  },
  category: {
    id: 'is_secret',
    value: null,
    items: [
      { label: '전체', value: null },
      { label: '공개', value: true },
      { label: '비공개', value: false },
    ],
  },
  search: {
    id: 'name',
    value: '',
    items: [
      { label: '제목', value: 'name' },
      { label: '상세', value: 'description' },
    ],
  },
};

function RouteComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    defaultValues: toolOptions,
  });
  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);

  const { data, fetchNextPage, refetch, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.getChannelCursor.infiniteQueryOptions({
      cursor: { index: -1, size: 10 },
      orders: [{ field: 'channel.id', sort: 'desc', default: true }],
      filters: {
        logic: 'and',
        search: filterState.map((v) => ({
          name: { condition: 'contains', field: 'channel.name', value: v.value } as const,
          description: { condition: 'contains', field: 'channel.description', value: v.value } as const,
          is_secret: { condition: 'neq', field: 'channel.password_encrypted', value: v.value ? '' : undefined } as const,
          is_participant: { condition: 'eq', field: 'channel_participant.user_id', value: v.value ? user?.profile.sub : undefined } as const,
          created_at: { condition: 'between', field: 'channel.created_at', value: v.value } as const,
        }[v.id])).filter((v) => !!v),
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

  const onChangeFilters = (filters: ColumnFiltersState) => {
    setFilterState(filters);
  };
  const onReachLastRow = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const { mutateAsync: joinChannel } = useMutation(trpc.joinChannel.mutationOptions());
  const handleClickRow = (row: Row<Output<'getChannelCursor'>>) => {
    return async () => {
      if (!row.original.password_encrypted) {
        await joinChannel({ channelId: row.id, password: '' });
        navigate({ to: '/channel/$id', params: row });
      }
    };
  };


  return (
    <div className="tw:size-full tw:grid tw:grid-rows-[auto_1fr] tw:gap-2">
      {/* 생성 */}
      <div className="tw:flex tw:justify-end">
        <StepModal
          callback={refetch}
          render={[<ChannelCreate key="create" />]}
        >
          <Button>생성</Button>
        </StepModal>
      </div>

      <div>
        <DataTable
          data={allRows}
          columns={columns}
          getRowId={(row) => row.id}
          rowCount={data?.pages.at(-1)?.totalElements ?? 0}

          renderRow={({ row, children }) => (
            row.original.password_encrypted
              ? (
                <StepModal
                  key={row.original.id}
                  render={[<ChannelJoin key="join" channelId={row.original.id} />]}
                >
                  {children}
                </StepModal>
              )
              : (
                <Slot onClick={handleClickRow(row)} asChild>
                  {children}
                </Slot>
              )
          )}
          renderTools={({ table }) => (
            <DataTools {...{ table, form }} />
          )}

          onReachLastRow={onReachLastRow}
          onColumnFilters={onChangeFilters}
        />
      </div>
    </div>

  );
}
