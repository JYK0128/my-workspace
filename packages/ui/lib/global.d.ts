import { RowData, TableMeta, TableOptions } from '@tanstack/react-table';
import { FieldValues, UseFormReturn } from 'react-hook-form';
export { };

// React 추가 타입
declare module 'react' {
  function forwardRef<T, P = object>(
    render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
  ): (props: P & React.RefAttributes<T>) => React.ReactElement | null;

  type UnRef<T> = T extends React.RefObject<infer U> ? U : never;
  type Setter<S> = (prev: S) => S;
  type Dispatcher<S> = (setter: Setter<S>) => void;
  type PropsWithAction<A, V = object> = React.PropsWithChildren<ActionFn<A> & V>;
}

// React Hook Form 추가 타입
declare module 'react-hook-form' {
  type FieldPathValue<TFieldValues extends FieldValues, TName extends keyof TFieldValues>
   = TFieldValues[TName] extends (infer U)[]
     ? U
     : TFieldValues[TName];
}

// Tanstack Table 추가 타입
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    ellipsis?: boolean
    textAlign?: React.CSSProperties['textAlign']
    filterVariant?: 'text' | 'range' | 'select'
  }

  interface CustomTableMeta<TData extends RowData, TFieldValues extends FieldValues> extends TableMeta<TData> {
    form?: UseFormReturn<TFieldValues>
    actions?: Record<string, (row?: TData) => void>
  }
  type OmitTableModels<T> = { [K in keyof T as K extends `get${string}Model` ? never : K]: T[K] };
  type OmitChangeHandlers<T> = { [K in keyof T as K extends `on${string}Change` ? never : K]: T[K] };
  type OmitManualOptions<T> = { [K in keyof T as K extends `manual${string}` ? never : K]: T[K] };
  type OmitTableState<T> = { [K in keyof T as K extends 'state' ? never : K]: T[K] };
  type TableCore<TData extends RowData> = OmitTableModels<OmitChangeHandlers<OmitManualOptions<OmitTableState<TableOptions<TData>>>>>;
}
