import { FormCheckbox, FormDateRange, FormInput, FormSelectSingle } from '#customs/components/index.ts';
import { Button, Form } from '#shadcn/components/ui/index.ts';
import { Table } from '@tanstack/react-table';
import { every, isDate } from 'lodash-es';
import { BaseSyntheticEvent, useCallback, useEffect } from 'react';
import { Control, FieldValues, UseFormReturn } from 'react-hook-form';

type DateRange<T> = {
  [K in keyof T]: T[K] extends Date ?
    {
      id: K
      label?: string
      value: [Optional<Date>, Optional<Date>]
    }
    : never
}[Extract<keyof T, string>];

type Category<T> = {
  [K in keyof T]: T[K] extends Literal<T[K]> ?
    {
      id: K
      label?: string
      value: Nullable<T[K]>
      items: { label: string, value: Nullable<T[K]> }[]
    }
    : never
}[Extract<keyof T, string>];

type Status<T> = {
  [K in keyof T]: T[K] extends boolean ?
    {
      id: K
      label?: string
      value: Nullable<T[K]>
    }
    : never
}[Extract<keyof T, string>];

type Search<T> = {
  [K in keyof T]: T[K] extends string ?
    {
      id: Nullable<Extract<{
        [K in keyof T]: T[K] extends Literal<T[K]> ? never : Extract<T[K], string> extends never ? never : K
      }[keyof T], string>>
      value: string
      items: {
        label: string
        value: Nullable<Extract<{
          [K in keyof T]: T[K] extends Literal<T[K]> ? never : Extract<T[K], string> extends never ? never : K
        }[keyof T], string>>
      }[]
    }
    : never
}[Extract<keyof T, string>];

export type ToolOptions<T> = {
  dateRange?: DateRange<T>
  category?: Category<T>
  status?: Status<T>
  search?: Search<T>
};

type Props<T> = {
  table: Table<T>
  form: UseFormReturn<ToolOptions<T>>
};


/** 데이터 필터링 도구 */
export function DataTools<T>({ table, form }: Props<T>) {
  const data = form.watch();

  const handleBlurDateRange = () => {
    const payload = form.getValues();
    if (every(payload.dateRange?.value, isDate)) {
      handleSearch(payload);
    }
  };

  const handleSearch = useCallback((payload: ToolOptions<T>) => {
    const { search, ...filters } = payload;
    table.resetPageIndex();
    table.resetGlobalFilter();
    if (search && search.id !== null) {
      if (search.id !== null) {
        table.setColumnFilters([
          ...Object.values(filters),
          { id: search.id, value: search.value },
        ]);
      }
      else {
        table.setColumnFilters([...Object.values(filters)]);
        table.setGlobalFilter(search.value);
      }
    }
    else {
      table.setColumnFilters([...Object.values(filters)]);
    }
  }, [table]);

  const handleSubmit = (payload: ToolOptions<T>, evt?: BaseSyntheticEvent) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    if (submitter.name === 'search') {
      handleSearch(payload);
    }
  };

  useEffect(() => {
    handleSearch(form.getValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="tw:flex tw:flex-wrap tw:flex-row tw:justify-between">
          <div className="tw:flex tw:gap-0.5">
            {data.dateRange && (
              <FormDateRange
                control={form.control as unknown as Control<FieldValues>}
                name="dateRange.value"
                onBlur={handleBlurDateRange}
              />
            )}
          </div>

          <div className="tw:flex tw:flex-wrap tw:gap-0.5">
            {data.category && (
              <FormSelectSingle
                control={form.control as unknown as Control<FieldValues>}
                name="category.value"
                items={data.category.items}
              />
            )}
            {data.search && (
              <>
                <FormSelectSingle
                  control={form.control as unknown as Control<FieldValues>}
                  name="search.id"
                  items={data.search.items}
                />
                <FormInput
                  control={form.control as unknown as Control<FieldValues>}
                  name="search.value"
                />
              </>
            )}
            <Button type="submit" name="search">검색</Button>
          </div>
        </div>

        <div className="tw:flex tw:flex-wrap tw:flex-row tw:justify-between">
          <div>
            <span>{`총 ${table.getRowCount()} 개`}</span>
            <span> / </span>
            <span>{`선택 ${table.getFilteredSelectedRowModel().rows.length} 개`}</span>
          </div>
          <div>
            {
              data.status && (
                <FormCheckbox
                  optional
                  falsely={null}
                  control={form.control as unknown as Control<FieldValues>}
                  name="status.value"
                  label={data.status.label}
                />
              )
            }
          </div>
        </div>
      </form>
    </Form>
  );
}
