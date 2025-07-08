import { StringReference } from 'kysely';
import { z } from 'zod';

/*
 * 검색조건(필터)
 */
const eqFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('eq'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const neqFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('neq'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const ltFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('lt'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const lteFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('lte'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const gtFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('gt'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const gteFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('gte'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const containsFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('contains'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const inFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('in'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});

const betweenFilter = <DB, TB extends keyof DB, SR extends StringReference<DB, TB>>() => z.object({
  condition: z.literal('between'),
  field: z.custom<SR>((v) => z.string(v)),
  value: z.unknown().optional(),
});


/*
 * 검색 Filter 조건
 */
const Filter = <DB, TB extends keyof DB>() => z.discriminatedUnion('condition', [
  eqFilter<DB, TB, StringReference<DB, TB>>(),
  neqFilter<DB, TB, StringReference<DB, TB>>(),
  ltFilter<DB, TB, StringReference<DB, TB>>(),
  lteFilter<DB, TB, StringReference<DB, TB>>(),
  gtFilter<DB, TB, StringReference<DB, TB>>(),
  gteFilter<DB, TB, StringReference<DB, TB>>(),
  containsFilter<DB, TB, StringReference<DB, TB>>(),
  inFilter<DB, TB, StringReference<DB, TB>>(),
  betweenFilter<DB, TB, StringReference<DB, TB>>(),
]);
type Filter<DB, TB extends keyof DB> = z.infer<ReturnType<typeof Filter<DB, TB>>>;

const Logic = z.object({
  logic: z.enum(['and', 'or']),
});
type Logic = z.infer<typeof Logic>;

export type FilterQuery<DB, TB extends keyof DB> = Logic & { search: (Filter<DB, TB> | FilterQuery<DB, TB>)[] };
const FilterQuery: <DB, TB extends keyof DB>() => z.ZodType<FilterQuery<DB, TB>> = <DB, TB extends keyof DB>() =>
  Logic.extend({
    search: z.lazy(() => z.union([FilterQuery<DB, TB>(), Filter<DB, TB>()]).array()),
  });

/*
 * 집계 Filter 조건
 */
const AggOperator = z.enum(['count', 'sum', 'avg', 'min', 'max']);
export type AggOperator = z.infer<typeof AggOperator>;
const HavingFilter = <DB, TB extends keyof DB>() => z.discriminatedUnion('condition', [
  eqFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  neqFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  ltFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  lteFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  gtFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  gteFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  containsFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  inFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
  betweenFilter<DB, TB, StringReference<DB, TB>>().extend({ op: AggOperator.optional() }),
]);
type HavingFilter<DB, TB extends keyof DB> = z.infer<ReturnType<typeof HavingFilter<DB, TB>>>;

export type HavingQuery<DB, TB extends keyof DB> = Logic & { search: (HavingFilter<DB, TB> | HavingQuery<DB, TB>)[] };
const HavingQuery: <DB, TB extends keyof DB>() => z.ZodType<HavingQuery<DB, TB>> = <DB, TB extends keyof DB>() =>
  Logic.extend({
    search: z.lazy(() => z.union([HavingQuery<DB, TB>(), HavingFilter<DB, TB>()]).array()),
  });

/*
 * 검색조건(정렬)
0 */
const OrderQuery = <DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>>() => z.object({
  sort: z.enum(['asc', 'desc']),
  field: z.custom<SR>((v) => z.string(v)),
  default: z.boolean().optional(),
});
export type OrderQuery<DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>> = z.infer<ReturnType<typeof OrderQuery<DB, TB, SR>>>;

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
export const PageRequest = <DB, TB extends keyof DB>() => z.object({
  filters: FilterQuery<DB, TB>().optional(),
  orders: OrderQuery<DB, TB>().array().optional(),
  page: Pagination,
});

export const CursorRequest = <DB, TB extends keyof DB>() => z.object({
  filters: FilterQuery<DB, TB>().optional(),
  orders: OrderQuery<DB, TB>().array().optional(),
  cursor: Cursor,
});

/*
 * 집계조건(그룹)
 */
const GroupQuery = <DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>>() => z.object({
  field: z.custom<SR>((v) => z.string(v)),
  regex: z.string().optional(),
  alias: z.string().optional(),
});
export type GroupQuery<DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>> = z.infer<ReturnType<typeof GroupQuery<DB, TB, SR>>>;

/*
 * 집계조건(집계)
 */
const AggQuery = <DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>>() => z.object({
  op: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  field: z.custom<SR>((v) => z.string(v)),
  alias: z.string().optional(),
});
export type AggQuery<DB, TB extends keyof DB, SR extends StringReference<DB, TB> = StringReference<DB, TB>> = z.infer<ReturnType<typeof AggQuery<DB, TB, SR>>>;

/*
 * 집계조건 요청
 */
export const AggRequest = <DB, TB extends keyof DB>() => z.object({
  filters: FilterQuery<DB, TB>().optional(),
  orders: OrderQuery<DB, TB>().array().optional(),
  groups: GroupQuery<DB, TB>().array().optional(),
  fns: AggQuery<DB, TB>().array(),
  having: HavingQuery<DB, TB>().optional(),
});
