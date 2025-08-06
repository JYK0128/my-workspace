import { useSortable } from '@dnd-kit/sortable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnDef, type Row } from '@tanstack/react-table';
import { format, isWithinInterval, subDays } from 'date-fns';
import { random } from 'lodash-es';
import { ChevronDown, ChevronRight, GripHorizontal, Pin, PinOff } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';

import { DataPagination } from '#customs/components/DataPagination.tsx';
import { DataTable } from '#customs/components/DataTable.tsx';
import { Button, Checkbox } from '#shadcn/components/ui/index.ts';

type Item = {
  index: string
  type: 'a' | 'b'
  title: string
  description: string
  publish: boolean
  startDate: Date
  children: Item[]
};

const data: Item[] = Array.from({ length: 100 }).map((_, i01) => ({
  index: `${i01}`,
  type: random(0, 1) ? 'a' : 'b',
  title: Array.from({ length: 20 }).map(() => random(true).toString(36)[2]).join(''),
  description: Array.from({ length: 40 }).map(() => random(true).toString(36)[2]).join(''),
  publish: !!random(0, 1),
  startDate: subDays(new Date(), random(-10, 10)),
  children: Array.from({ length: random(0, 10) }, (_, i02) => ({
    index: `${i01}_${i02}`,
    type: random(0, 1) ? 'a' : 'b',
    title: Array.from({ length: 20 }).map(() => random(true).toString(36)[2]).join(''),
    description: Array.from({ length: 40 }).map(() => random(true).toString(36)[2]).join(''),
    publish: !!random(0, 1),
    startDate: subDays(new Date(), random(-10, 10)),
    children: [],
  })),
}));

function RowDragger<T>(props: ComponentPropsWithoutRef<'button'> & { row: Row<T> }) {
  const { row, ...rest } = props;
  const { attributes, listeners } = useSortable({ id: row.id });

  return (
    <Button
      {...rest}
      {...attributes}
      {...listeners}
      size="icon"
      variant="link"
    >
      <GripHorizontal />
    </Button>
  );
}

const columns: ColumnDef<Item>[] = [
  {
    id: 'select',
    size: 50,
    enableResizing: false,
    enableSorting: false,
    enablePinning: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
      />
    ),
    cell: ({ row }) => (
      <div className="tw:flex tw:items-center tw:justify-between">
        <Checkbox
          disabled={!row.getCanMultiSelect() && row.getCanExpand()}
          checked={row.getIsSelected()}
          onMouseDown={(e) => e.preventDefault()}
          onCheckedChange={(val) => row.toggleSelected(!!val)}
        />
        {row.getCanExpand() && (
          <Button
            size="icon"
            variant="link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={row.getToggleExpandedHandler()}
          >
            {!row.getIsExpanded() ? <ChevronRight /> : <ChevronDown />}
          </Button>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'index',
    header: '번호',
    enableResizing: false,
    size: 100,
    meta: {
      textAlign: 'right',
    },
  },
  {
    accessorKey: 'type',
    cell: ({ row }) => `${{ a: '정', b: '부' }[row.original.type]}`,
    header: '타입',
    enableResizing: false,
    size: 100,
    filterFn: 'equals',
    meta: {
      textAlign: 'center',
    },
  },
  {
    accessorKey: 'title',
    header: '제목',
    filterFn: 'includesString',
    enableSorting: false,
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'description',
    header: '요약',
    filterFn: 'includesString',
    enableSorting: false,
    meta: {
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'publish',
    cell: ({ row }) => `${{ true: '공개', false: '비공개' }[row.original.publish.toString()]}`,
    header: '공개여부',
    enableSorting: false,
    size: 120,
    meta: {
      filterVariant: 'select',
      textAlign: 'center',
    },
  },
  {
    accessorKey: 'startDate',
    cell: ({ row }) => `${format(row.original.startDate, 'yyyy-MM-dd')}`,
    header: '최근 수정일',
    filterFn: (row, columnId, filterValue) => {
      const value: Date = row.getValue(columnId);
      const interval = { start: filterValue[0] ?? new Date(0), end: filterValue[1] ?? new Date() };
      return isWithinInterval(value, interval);
    },
    meta: {
      filterVariant: 'range',
      textAlign: 'right',
    },
  },
  {
    id: 'pin',
    size: 50,
    header: '고정',
    enableResizing: false,
    enableSorting: false,
    enablePinning: false,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <div className="tw:flex tw:justify-center">
          {row.getIsPinned() && !row.getParentRow() && (
            <RowDragger
              className="tw:mr-auto"
              {...{ row }}
            />
          )}
          <Button
            size="icon"
            variant="link"
            onClick={() => row.pin(row.getIsPinned() ? false : 'top', true, false)}
          >
            {row.getIsPinned()
              ? (<PinOff />)
              : (<Pin />)}
          </Button>
        </div>
      );
    },
  },
];

/**
 * DataPagination은 다음과 같습니다.
 */
const meta = {
  title: 'Design/Table/DataPagination',
  component: DataPagination,
  argTypes: {
    table: {
      description: 'tanstack table 객체',
      control: { disable: true },
    },
    size: {
      description: '페이지 갯수 선택 목록',
      control: { type: 'object', disable: true },
    },
    length: {
      description: '페이지 아이템 수',
      control: { type: 'number' },
    },
  },
  parameters: {
    docs: {
    },
  },
} satisfies Meta<typeof DataPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    table: {} as never,
    size: [10, 20, 50, 100],
    length: 10,
  },
  render: (args) => {
    const { size, length } = args;

    return (
      <DataTable
        data={data}
        columns={columns}
        client={true}
        renderPagination={({ table }) => (
          <DataPagination {...{ table, size, length }} />
        )}
      />
    );
  },
};
