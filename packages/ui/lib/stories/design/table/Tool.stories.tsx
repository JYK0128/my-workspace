import { DataTable } from '#customs/components/DataTable.tsx';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataTools, type ToolOptions } from '#customs/components/DataTools.tsx';
import { Button, Checkbox } from '#shadcn/components/ui/index.ts';
import { useSortable } from '@dnd-kit/sortable';
import { ColumnDef, type Row } from '@tanstack/react-table';
import { addMonths, format, isWithinInterval, subDays } from 'date-fns';
import { random } from 'lodash-es';
import { ChevronDown, ChevronRight, GripHorizontal, Pin, PinOff } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';

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
 * DataTool은 4가지 검색조건 기능을 가지고 있습니다.
 * - 데이터 범위 조건
 * - 토글 가능한 상태 조건
 * - 카테고리 조건
 * - 필터 조건
 */
const meta = {
  title: 'Design/Table/DataTool',
  argTypes: {
    dateRange: {
      description: '날짜 검색 범위',
      control: { type: 'object' },
    },
    status: {
      description: '토글 상태 값',
      control: { type: 'object' },
    },
    category: {
      description: '카테고리 값',
      control: { type: 'object' },
    },
    search: {
      description: '검색 값',
      control: { type: 'object' },
    },
  },
  parameters: {
    docs: {
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<ToolOptions<Item>>;

export const Default: Story = {
  args: {
    dateRange: {
      id: 'startDate',
      value: [new Date(), addMonths(new Date(), 1)],
    },
    status: {
      id: 'publish',
      value: null,
      label: '공개 게시글만',
    },
    category: {
      id: 'type',
      value: null,
      items: [
        { label: '전체', value: null },
        { label: '정', value: 'a' },
        { label: '부', value: 'b' },
      ],
    },
    search: {
      id: null,
      value: '',
      items: [
        { label: '전체', value: null },
        { label: '제목', value: 'title' },
        { label: '내용', value: 'description' },
      ],
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
      defaultValues: args,
    });

    return (
      <DataTable
        data={data}
        columns={columns}
        client={true}
        renderTools={({ table }) => (
          <DataTools {...{ table, form }} />
        )}
      />
    );
  },
};
