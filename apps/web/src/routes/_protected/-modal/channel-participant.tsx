import { type Output, useInfiniteQuery, useTRPC } from '@packages/trpc';
import { Button, DataTable, DataTools, DialogContent, DialogDescription, DialogHeader, DialogTitle, type ToolOptions } from '@packages/ui';
import type { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { Ban, GraduationCap, MicOff } from 'lucide-react';
import { type PropsWithChildren, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

const columns: ColumnDef<Output<'getParticipantCursor'>>[] = [
  {
    accessorKey: 'nickname',
    header: '이름(별명)',
  },
  {
    accessorKey: 'email',
    header: '이메일',
  },
  {
    id: 'actions',
    header: '관리기능',
    cell: () => (
      <div>
        <Button variant="ghost">
          <GraduationCap />
        </Button>
        <Button variant="ghost">
          <MicOff />
        </Button>
        <Button variant="ghost">
          <Ban />
        </Button>
      </div>
    ),
  },
];

const toolOptions: ToolOptions<Output<'getParticipantCursor'>> = {
  search: {
    id: 'nickname',
    value: '',
    items: [
      { label: '닉네임', value: 'nickname' },
      { label: '이메일', value: 'email' },
    ],
  },
};

interface Props {
  channel: Pick<Output<'getParticipantCursor'>, 'id'>
};
export function ChannelParticipant({ channel }: PropsWithChildren<Props>) {
  const form = useForm({
    defaultValues: toolOptions,
  });
  const [filterState, setFilterState] = useState<ColumnFiltersState>([]);

  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    trpc.getParticipantCursor.infiniteQueryOptions({
      cursor: { index: -1, size: 10 },
      orders: [{ field: 'channel_participant.id', sort: 'desc', default: true }],
      filters: {
        logic: 'and',
        search: [
          { field: 'channel_participant.channel_id', condition: 'eq', value: channel.id },
          ...filterState.map((v) => ({
            nickname: { condition: 'contains', field: 'nickname', value: v.value } as const,
            email: { condition: 'contains', field: 'email', value: v.value } as const,
          }[v.id])).filter((v) => !!v),
        ],
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
  const onReachLastRow = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const onChangeFilters = (filters: ColumnFiltersState) => {
    setFilterState(filters);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>참가자 목록</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <DataTable
        data={allRows}
        columns={columns}
        rowCount={data?.pages.at(-1)?.totalElements ?? 0}

        onReachLastRow={onReachLastRow}
        renderTools={({ table }) => (
          <DataTools {...{ table, form }} />
        )}

        onColumnFilters={onChangeFilters}
      />
    </DialogContent>
  );
}
