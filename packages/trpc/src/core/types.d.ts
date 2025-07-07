import type { ColumnType } from 'kysely';

export * from './db';
export type Table<T> = {
  [K in keyof T]:
  T[K] extends ColumnType<infer S, unknown, unknown> ? S :
  NonNullable<T[K]> extends ColumnType<infer S, unknown, unknown>
    ? S | Extract<T[K], null | undefined>
    : T[K];
};
