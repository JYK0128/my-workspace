import type { MainRouter } from '#router/index.ts';
import { inferProcedureInput, inferProcedureOutput } from '@trpc/server';
import type { ColumnType } from 'kysely';

export * from './db';
export type Table<T> = {
  [K in keyof T]:
  T[K] extends ColumnType<infer S, unknown, unknown> ? S :
  NonNullable<T[K]> extends ColumnType<infer S, unknown, unknown>
    ? S | Extract<T[K], null | undefined>
    : T[K];
};
export type Input<K extends keyof MainRouter> =
  inferProcedureInput<MainRouter[K]>['content'][number];
export type Output<K extends keyof MainRouter> =
  inferProcedureOutput<MainRouter[K]>['content'][number];
