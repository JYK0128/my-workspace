import { db } from '#core/kysely.ts';
import { AggOperator, AggQuery, Cursor, FilterQuery, GroupQuery, HavingQuery, OrderQuery, Pagination } from '@packages/utils';
import { ExpressionBuilder, ExpressionWrapper, SelectQueryBuilder, sql, SqlBool } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

type WhereClause<
  DB,
  TB extends keyof DB,
  Field extends Extract<keyof DB[TB], string> = Extract<keyof DB[TB], string>,
> = {
  eb: ExpressionBuilder<DB, TB>
  field: Field
  op?: AggOperator
  value: unknown
};

export const WhereEQ = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '=', value);
  }
  else {
    return eb(ref, '=', value);
  }
};

export const WhereNEQ = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '!=', value);
  }
  else {
    return eb(ref, '!=', value);
  }
};

export const WhereLT = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '<', value);
  }
  else {
    return eb(ref, '<', value);
  }
};

export const WhereLTE = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '<=', value);
  }
  else {
    return eb(ref, '<=', value);
  }
};

export const WhereGT = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '>', value);
  }
  else {
    return eb(ref, '>', value);
  }
};

export const WhereGTE = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), '>=', value);
  }
  else {
    return eb(ref, '>=', value);
  }
};

export const WhereContains = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.cast(eb.fn(op, [ref]), 'text'), 'like', `%${value}%`);
  }
  else {
    return eb(eb.cast(ref, 'text'), 'like', `%${value}%`);
  }
};

export const WhereIn = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb(eb.fn(op, [ref]), 'in', value);
  }
  else {
    return eb(ref, 'in', value);
  }
};

export const WhereBetween = <
  DB,
  TB extends keyof DB,
>({ eb, field, value, op }: WhereClause<DB, TB>) => {
  const ref = db.dynamic.ref(field);
  if (op) {
    return eb.between(eb.fn(op, [ref]), ...(value as [unknown, unknown]));
  }
  else {
    return eb.between(ref, ...(value as [unknown, unknown]));
  }
};

const conditionMap = {
  eq: WhereEQ,
  neq: WhereNEQ,
  lt: WhereLT,
  lte: WhereLTE,
  gt: WhereGT,
  gte: WhereGTE,
  contains: WhereContains,
  in: WhereIn,
  between: WhereBetween,
} as const;

/** Where Filter Clause */
export function buildWhereFilterClause<
  DB,
  TB extends keyof DB,
>(
  eb: ExpressionBuilder<DB, TB>,
  info: FilterQuery<DB[TB]> | undefined,
) {
  if (!info) return eb.and([]);
  const expressions = info.search.map((search): ExpressionWrapper<DB, TB, SqlBool> | undefined => {
    if ('logic' in search) {
      return buildWhereFilterClause(eb, search);
    }
    else {
      const { field, condition, value } = search;
      const fn = conditionMap[condition];

      if (!fn) throw new Error(`Unsupported condition: ${condition}`);
      if (field && value) {
        return fn({ eb, field, value: value });
      }
    }
  }).filter((expr) => !!expr);

  const { logic } = info;
  return eb[logic](expressions);
}

/** Select Aggregate Clause */
export function buildSelectAggregateClause<
  DB,
  TB extends keyof DB,
>(
  eb: ExpressionBuilder<DB, TB>,
  info: AggQuery<DB[TB]>[] | undefined,
) {
  if (!info) return [];
  return info.map((agg) => {
    const { field, op, alias } = agg;
    if (field) {
      return eb.fn.agg(op, [field]).as(alias || `${field}_${op}`);
    }
  }).filter((expr) => !!expr);
}

/** Select Group Clause */
export function buildSelectGroupClause<
  DB,
  TB extends keyof DB,
>(
  eb: ExpressionBuilder<DB, TB>,
  info: GroupQuery<DB[TB]>[] | undefined,
) {
  if (!info) return [];
  return info.map((group) => {
    const { regex, field, alias } = group;
    if (field) {
      const fieldRef = eb.ref(field);
      if (regex) {
        const regexLit = sql.lit(regex);
        return sql`(regexp_match(${fieldRef}::text, ${regexLit}))[1]`.as(alias || field);
      }
      else {
        return sql`${fieldRef}`.as(alias || field);
      }
    }
  }).filter((expr) => !!expr);
}

/** Group Clause */
export function buildGroupClause<
  DB,
  TB extends keyof DB,
  T,
>(
  qb: SelectQueryBuilder<DB, TB, T>,
  groups: GroupQuery<DB[TB]>[] | undefined,
  having: HavingQuery<DB[TB]> | undefined,
) {
  if (!groups) return qb;

  return qb
    .groupBy((eb) => buildPartialGroupClause(eb, groups))
    .$if(!!having, (qb) => qb.having((eb) => buildPartialHavingClause(eb, having)));
}

export function buildPartialGroupClause<
  DB,
  TB extends keyof DB,
>(
  eb: ExpressionBuilder<DB, TB>,
  info: GroupQuery<DB[TB]>[] | undefined,
) {
  if (!info) return [];
  return info.map((group) => {
    const { regex, field } = group;
    if (field) {
      const fieldRef = eb.ref(field);
      if (regex) {
        const regexLit = sql.lit(regex);
        return sql`(regexp_match(${fieldRef}::text, ${regexLit}))[1]`;
      }
      else {
        return sql`${fieldRef}`;
      }
    }
  }).filter((expr) => !!expr);
}

/** Having Clause */
export function buildPartialHavingClause<
  DB,
  TB extends keyof DB,
>(
  eb: ExpressionBuilder<DB, TB>,
  info: HavingQuery<DB[TB]> | undefined,
) {
  if (!info) return eb.and([]);
  const expressions = info.search.map((search): ExpressionWrapper<DB, TB, SqlBool> | undefined => {
    if ('logic' in search) {
      return buildPartialHavingClause(eb, search);
    }
    else {
      const { field, condition, op, value } = search;
      const fn = conditionMap[condition];

      if (!fn) throw new Error(`Unsupported condition: ${condition}`);
      if (field && value) {
        return fn({ eb, field, value, op });
      }
    }
  })
    .filter((expr) => !!expr);

  const { logic } = info;
  return eb[logic](expressions);
}

/** Orderby Clause */
export function buildOrderClause<
  DB,
  TB extends keyof DB,
  T,
>(
  qb: SelectQueryBuilder<DB, TB, T>,
  info?: OrderQuery<DB[TB]>[],
) {
  if (!info) return qb;
  info.forEach(({ field, sort }) => {
    if (field) {
      qb = qb.orderBy(field, sort);
    }
  });
  return qb;
}


export function buildPage<
  DB,
  TB extends keyof DB,
  T,
>(
  eb: ExpressionBuilder<DB, TB>,
  { content, orders, info }: {
    content: T[]
    orders?: OrderQuery<T>[]
    info: Pagination | Cursor
  },
) {
  const totalElements = eb.cast<number>(eb.fn.countAll(), 'bigint');
  const index = eb.cast<number>(eb.val(info.index), 'bigint');
  const size = eb.cast<number>(eb.val(info.size), 'bigint');
  const numberOfElements = eb.cast<number>(eb.val(content.length), 'bigint');
  const totalPages = sql`ceil(${numberOfElements}/${size}::float)`;

  return [
    jsonBuildObject({
      sort: jsonBuildObject({
        sorted: eb.cast(eb.val(!!orders?.length), 'boolean'),
        unsorted: eb.cast(eb.val(!orders?.length), 'boolean'),
        empty: eb.cast(eb.val(false), 'boolean'),
      }),
      totalPages,
      totalElements,
      size,
      number: index,
      numberOfElements,
    }).as('data'),
  ];
}
