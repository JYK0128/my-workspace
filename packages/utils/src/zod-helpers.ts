import { z } from 'zod';

/*
 * 검색조건(필터)
 */
const eqFilter = <T>() => z.object({
  condition: z.literal('eq'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const neqFilter = <T>() => z.object({
  condition: z.literal('neq'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const ltFilter = <T>() => z.object({
  condition: z.literal('lt'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const lteFilter = <T>() => z.object({
  condition: z.literal('lte'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const gtFilter = <T>() => z.object({
  condition: z.literal('gt'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const gteFilter = <T>() => z.object({
  condition: z.literal('gte'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const containsFilter = <T>() => z.object({
  condition: z.literal('contains'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any(),
});

const inFilter = <T>() => z.object({
  condition: z.literal('in'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.any().array(),
});

const betweenFilter = <T>() => z.object({
  condition: z.literal('between'),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  value: z.tuple([z.any(), z.any()]),
});


/*
 * 검색 Filter 조건
 */
const Filter = <T>() => z.discriminatedUnion('condition', [
  eqFilter<T>(),
  neqFilter<T>(),
  ltFilter<T>(),
  lteFilter<T>(),
  gtFilter<T>(),
  gteFilter<T>(),
  containsFilter<T>(),
  inFilter<T>(),
  betweenFilter<T>(),
]);
type Filter<T> = z.infer<ReturnType<typeof Filter<T>>>;

const Logic = z.object({
  logic: z.enum(['and', 'or']),
});
type Logic = z.infer<typeof Logic>;

export type FilterQuery<T> = Logic & { search: (Filter<T> | FilterQuery<T>)[] };
const FilterQuery: <T>() => z.ZodType<FilterQuery<T>> = <T>() =>
  Logic.extend({
    search: z.lazy(() => z.union([FilterQuery<T>(), Filter<T>()]).array()),
  });

/*
 * 집계 Filter 조건
 */
const AggOperator = z.enum(['count', 'sum', 'avg', 'min', 'max']);
export type AggOperator = z.infer<typeof AggOperator>;
const HavingFilter = <T>() => z.discriminatedUnion('condition', [
  eqFilter<T>().extend({ op: AggOperator.optional() }),
  neqFilter<T>().extend({ op: AggOperator.optional() }),
  ltFilter<T>().extend({ op: AggOperator.optional() }),
  lteFilter<T>().extend({ op: AggOperator.optional() }),
  gtFilter<T>().extend({ op: AggOperator.optional() }),
  gteFilter<T>().extend({ op: AggOperator.optional() }),
  containsFilter<T>().extend({ op: AggOperator.optional() }),
  inFilter<T>().extend({ op: AggOperator.optional() }),
  betweenFilter<T>().extend({ op: AggOperator.optional() }),
]);
type HavingFilter<T> = z.infer<ReturnType<typeof HavingFilter<T>>>;

export type HavingQuery<T> = Logic & { search: (HavingFilter<T> | HavingQuery<T>)[] };
const HavingQuery: <T>() => z.ZodType<HavingQuery<T>> = <T>() =>
  Logic.extend({
    search: z.lazy(() => z.union([HavingQuery<T>(), HavingFilter<T>()]).array()),
  });

/*
 * 검색조건(정렬)
 */
const OrderQuery = <T>() => z.object({
  sort: z.enum(['asc', 'desc']),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
});
export type OrderQuery<T> = z.infer<ReturnType<typeof OrderQuery<T>>>;

/*
 * 검색조건(페이징)
 */
const Pagination = z.object({
  index: z.coerce.number().int().min(0),
  size: z.coerce.number().int().min(0),
});
export type Pagination = z.infer<typeof Pagination>;

/*
 * 검색조건(커서)
 */
const Cursor = z.object({
  index: z.coerce.number().int().min(-1),
  size: z.coerce.number().int().min(0),
});
export type Cursor = z.infer<typeof Cursor>;

/*
 * 검색조건 요청
 */
export const PageRequest = <T>() => z.object({
  filters: FilterQuery<T>().optional(),
  orders: OrderQuery<T>().array().optional(),
  page: Pagination,
});

export const CursorRequest = <T>() => z.object({
  filters: FilterQuery<T>().optional(),
  orders: OrderQuery<T>().array().optional(),
  cursor: Cursor,
});

/*
 * 집계조건(그룹)
 */
const GroupQuery = <T>() => z.object({
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  regex: z.string().optional(),
  alias: z.string().optional(),
});
export type GroupQuery<T> = z.infer<ReturnType<typeof GroupQuery<T>>>;

/*
 * 집계조건(집계)
 */
const AggQuery = <T>() => z.object({
  op: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  field: z.string() as unknown as z.ZodEnum<[Extract<keyof T, string>, ...Extract<keyof T, string>[]]>,
  alias: z.string().optional(),
});
export type AggQuery<T> = z.infer<ReturnType<typeof AggQuery<T>>>;

/*
 * 집계조건 요청
 */
export const AggRequest = <T>() => z.object({
  filters: FilterQuery<T>().optional(),
  groups: GroupQuery<T>().array().optional(),
  fns: AggQuery<T>().array(),
  having: HavingQuery<T>().optional(),
});
