import { useSortable } from '@dnd-kit/sortable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ColumnDef, Row } from '@tanstack/react-table';
import { addMonths, format, isWithinInterval, subDays } from 'date-fns';
import { random } from 'lodash-es';
import { ChevronDown, ChevronRight, GripHorizontal, Pin, PinOff } from 'lucide-react';
import type { ComponentPropsWithoutRef } from 'react';
import { useForm } from 'react-hook-form';

import { DataPagination } from '#customs/components/DataPagination.tsx';
import { DataTable } from '#customs/components/DataTable.tsx';
import { DataTools, type ToolOptions } from '#customs/components/DataTools.tsx';
import { Slot } from '#customs/components/Slot.tsx';
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

const toolOptions: ToolOptions<Item> = {
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
};

/**
 * tanstack table을 기반으로 만든 Data Table으로 다음 기능을 제공합니다.
 * - 페이지네이션 기능
 * - 범주 / 필터 / 정렬 기능
 * - 행 선택 / 확장 기능
 * - 열 크기 조정 기능
 * - 행렬 이동 / 양끝 고정 기능
 *
 * tanstack table 속성과 함께 다음 속성을 지원합니다.
 */
const meta = {
  title: 'Design/Table/DataTable',
  argTypes: {
    data: {
      description: 'tanstack table의 data 객체',
      control: { disable: true },
    },
    columns: {
      description: 'tanstack table의 column 객체',
      control: { disable: true },
    },
    renderTools: {
      description: '테이블 상단 도구 컴포넌트',
      control: { disable: true },
    },
    renderPagination: {
      description: '테이블 페이지 도구 컴포넌트',
      control: { disable: true },
    },
    renderRow: {
      description: '테이블 행 Wrapper 컴포넌트',
      control: { disable: true },
    },

    getSubRows: {
      description: '자식 행 데이터 지정 함수',
      control: { disable: true },
    },

    getRowCanExpand: {
      description: '확장 행 데이터 지정 함수',
      control: { disable: true },
    },
    renderExpendedRow: {
      description: '확장 행 렌더링 컴포넌트',
      control: { disable: true },
    },

    onReachFirstRow: {
      description: 'Infinity Scroll 구현 시 사용, 첫번째 행 관찰 함수',
      control: { disable: true },
    },
    onReachLastRow: {
      description: 'Infinity Scroll 구현 시 사용, 마지막 행 관찰 함수',
      control: { disable: true },
    },

    client: {
      description: '데이터 조작 방법',
      control: { disable: true },
    },
    rowCount: {
      description: '서버 조작 시 총 데이터 수',
      control: { type: 'number', disable: true },
    },
    pageIndex: {
      description: '서버 조작 시 현재 페이지 인덱스',
      control: { type: 'number', disable: true },
    },

    onPagination: {
      description: '서버 조작 시 페이지 요청 함수',
      control: { type: 'number', disable: true },
    },
    onExpanded: {
      description: '서버 조작 시 행 확장 요청 함수',
      control: { type: 'number', disable: true },
    },
    onSorting: {
      description: '서버 조작 시 열 정렬 요청 함수',
      control: { type: 'number', disable: true },
    },
    onColumnFilters: {
      description: '서버 조작 시 열 필터 요청 함수',
      control: { type: 'number', disable: true },
    },
    onGlobalFilter: {
      description: '서버 조작 시 글로벌 필터 요청 함수',
      control: { type: 'number', disable: true },
    },
  },
  parameters: {
    docs: {
      story: {
        inline: false,
        height: '500px',
      },
    },
  },
} as Meta<typeof DataTable<Item>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data,
    columns,
    client: true,
  },
  render: (args) => {
    const { data, columns, client } = args;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
      defaultValues: toolOptions,
    });

    return (
      <DataTable
        data={data}
        columns={columns}
        client={client as true}
        getSubRows={(row) => row.children}
        renderTools={({ table }) => (
          <DataTools {...{ table, form }} />
        )}
        renderPagination={({ table }) => (
          <DataPagination {...{ table }} />
        )}
        renderRow={({ children }) => (
          <Slot asChild>{children}</Slot>
        )}
      />
    );
  },
};

export const Server: Story = {
  args: {
    data,
    columns,
    client: false,
    rowCount: data.length,
  },
  render: (args) => {
    const { data, columns, client, rowCount } = args;
    return (
      <DataTable
        data={data}
        columns={columns}
        client={client as false}
        rowCount={rowCount as number}
      />
    );
  },
};
