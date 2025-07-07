import { addYears, formatDate, getDecade, subYears } from 'date-fns';

export const DATE = {
  DECADE: 0,
  YEAR: 1,
  MONTH: 2,
  DAY: 3,
  HOUR: 4,
  MINUTE: 5,
  SECOND: 6,
  MILLISECOND: 7,
  TIMEZONE: 8,
} as const;
type DATE = typeof DATE[keyof typeof DATE];

export const RANGE = {
  STRICT: '()',
  INCLUSIVE_START: '[)',
  INCLUSIVE_END: '(]',
  INCLUSIVE: '[]',
} as const;
type RANGE = typeof RANGE[keyof typeof RANGE];


type DateGetterOptions = {
  utc?: boolean
};
type DateCompareOptions = {
  granularity?: DATE
  utc?: boolean
  offset?: number
};
type DateRangeOptions = {
  granularity?: DATE
  utc?: boolean
  range?: RANGE
};
type DateCalculateOptions = {
  adjust?: boolean
  utc?: boolean
};
type DateGetterFn = (this: Date, unit: DATE, options?: DateGetterOptions) => number;
type DateCalculateFn = (this: Date, unit: DATE, value: number, options?: DateCalculateOptions) => Date;
type DateCompareFn = (this: Date, date: Date, unit: DATE, options?: DateCompareOptions) => boolean;
type DateBetweenFn = (this: Date, date1: Date, date2: Date, unit: DATE, options?: DateRangeOptions) => boolean;
type DateFormatFn = (this: Date, format?: string) => string;

declare global {
  interface Date {
    toUtcArray(): number[]
    toArray(): number[]
    format: DateFormatFn
    isSame: DateCompareFn
    isSameOrBefore: DateCompareFn
    isSameOrAfter: DateCompareFn
    isBefore: DateCompareFn
    isAfter: DateCompareFn
    isBetween: DateBetweenFn
    add: DateCalculateFn
    sub: DateCalculateFn
    set: DateCalculateFn
    get: DateGetterFn
  }
}

/* helper */
const createDate = (arr: number[], utc?: boolean) => {
  return utc
    ? new Date(Date.UTC(...(arr.slice(DATE.YEAR, DATE.TIMEZONE) as [number, number, number, number, number, number, number])))
    : new Date(...(arr.slice(DATE.YEAR, DATE.TIMEZONE) as [number, number, number, number, number, number, number]));
};

const handleAdjustMonth = (arr: number[], date: Date, utc?: boolean) => {
  const modDate = utc ? date.getUTCDate() : date.getDate();
  const originalDate = arr[DATE.DAY];

  if (originalDate !== modDate) {
    arr[DATE.MONTH] = arr[DATE.MONTH] + 1;
    arr[DATE.DAY] = 0;
    return createDate(arr, utc);
  }

  return date;
};

/* functions */
Date.prototype.toUtcArray = function (this: Date) {
  return [
    Math.floor(this.getUTCFullYear() / 10) * 10,
    this.getUTCFullYear(),
    this.getUTCMonth(),
    this.getUTCDate(),
    this.getUTCHours(),
    this.getUTCMinutes(),
    this.getUTCSeconds(),
    this.getUTCMilliseconds(),
    0,
  ];
};

Date.prototype.toArray = function (this: Date) {
  return [
    Math.floor(this.getFullYear() / 10) * 10,
    this.getFullYear(),
    this.getMonth(),
    this.getDate(),
    this.getHours(),
    this.getMinutes(),
    this.getSeconds(),
    this.getMilliseconds(),
    this.getTimezoneOffset(),
  ];
};

Date.prototype.format = function (this, format) {
  if (!format) {
    return this.toString();
  }
  else {
    return formatDate(this, format);
  }
};

Date.prototype.add = function (this, unit, value, options) {
  const { adjust, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();

  if (unit === DATE.DECADE) {
    thisArray[DATE.YEAR] = (Math.floor(thisArray[DATE.YEAR] / 10) + value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    thisArray[unit] += value;
    const date = createDate(thisArray, utc);
    return unit === DATE.MONTH && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.sub = function (this, unit, value, options) {
  const { adjust, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  thisArray[unit] -= value;

  if (unit === DATE.DECADE) {
    thisArray[DATE.YEAR] = (Math.floor(thisArray[DATE.YEAR] / 10) - value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    const date = createDate(thisArray, utc);
    return unit === DATE.MONTH && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.set = function (this, unit, value, options) {
  const { adjust, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  thisArray[unit] = value;

  if (unit === DATE.DECADE) {
    thisArray[DATE.YEAR] = (Math.floor(thisArray[DATE.YEAR] / 10) + value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    const date = createDate(thisArray, utc);
    return unit === DATE.MONTH && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.get = function (this, unit, options) {
  const { utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  return thisArray[unit];
};

Date.prototype.isSame = function (this, date, unit, options) {
  const { granularity, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  const dateArray = date[toArray]();

  if (granularity !== undefined) {
    const start = Math.min(unit, granularity);
    const end = Math.max(unit, granularity);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] !== dateArray[i]) {
        return false;
      }
    }
    return true;
  }
  else {
    return thisArray[unit] === dateArray[unit];
  }
};

Date.prototype.isSameOrBefore = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const offsetDate = date.add(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const start = Math.min(unit, granularity);
    const end = Math.max(unit, granularity);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] < dateArray[i]) return true;
      if (thisArray[i] > dateArray[i]) return false;
    }
    return true;
  }
  else {
    return thisArray[unit] <= dateArray[unit];
  }
};

Date.prototype.isSameOrAfter = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const offsetDate = date.sub(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const start = Math.min(unit, granularity);
    const end = Math.max(unit, granularity);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] > dateArray[i]) return true;
      if (thisArray[i] < dateArray[i]) return false;
    }
    return true;
  }
  else {
    return thisArray[unit] >= dateArray[unit];
  }
};

Date.prototype.isBefore = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const offsetDate = date.sub(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const start = Math.min(unit, granularity);
    const end = Math.max(unit, granularity);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] < dateArray[i]) return true;
      if (thisArray[i] > dateArray[i]) return false;
    }
    return false;
  }
  else {
    return thisArray[unit] < dateArray[unit];
  }
};

Date.prototype.isAfter = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const offsetDate = date.add(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const start = Math.min(unit, granularity);
    const end = Math.max(unit, granularity);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] > dateArray[i]) return true;
      if (thisArray[i] < dateArray[i]) return false;
    }
    return false;
  }
  else {
    return thisArray[unit] > dateArray[unit];
  }
};

Date.prototype.isBetween = function (this, date1, date2, unit, options): boolean {
  const { range } = options ?? {};
  const [start, end] = date1 < date2 ? [date1, date2] : [date2, date1];

  switch (range) {
    case RANGE.STRICT:
      return this.isAfter(start, unit, options) && this.isBefore(end, unit, options);
    case RANGE.INCLUSIVE_START:
      return this.isSameOrAfter(start, unit, options) && this.isBefore(end, unit, options);
    case RANGE.INCLUSIVE_END:
      return this.isAfter(start, unit, options) && this.isSameOrBefore(end, unit, options);
    case RANGE.INCLUSIVE:
    default:
      return this.isSameOrAfter(start, unit, options) && this.isSameOrBefore(end, unit, options);
  }
};

/** @deprecated */
export const addDecades
= (date: Date, amount: number) => addYears(new Date(getDecade(date), 0), amount * 10);
/** @deprecated */
export const subDecades
= (date: Date, amount: number) => subYears(new Date(getDecade(date), 0), amount * 10);

/** @deprecated */
export const isSameDecade
= (from: Date, to: Date) => getDecade(from) === getDecade(to);
/** @deprecated */
export const isBeforeDecade
= (from: Date, to: Date) => getDecade(from) < getDecade(to);
/** @deprecated */
export const isAfterDecade
= (from: Date, to: Date) => getDecade(from) > getDecade(to);
/** @deprecated */
export const isSameOrBeforeDecade
= (from: Date, to: Date) => getDecade(from) <= getDecade(to);
/** @deprecated */
export const isSameOrAfterDecade
= (from: Date, to: Date) => getDecade(from) >= getDecade(to);

/** @deprecated */
export const isSameYear
= (from: Date, to: Date) => from.getFullYear() === to.getFullYear();
/** @deprecated */
export const isBeforeYear
= (from: Date, to: Date) => from.getFullYear() < to.getFullYear();
/** @deprecated */
export const isAfterYear
= (from: Date, to: Date) => from.getFullYear() > to.getFullYear();
/** @deprecated */
export const isSameOrBeforeYear
= (from: Date, to: Date) => from.getFullYear() <= to.getFullYear();
/** @deprecated */
export const isSameOrAfterYear
= (from: Date, to: Date) => from.getFullYear() >= to.getFullYear();

/** @deprecated */
export const isSameMonth
= (from: Date, to: Date) => from.getMonth() === to.getMonth();
/** @deprecated */
export const isBeforeMonth
= (from: Date, to: Date) => from.getMonth() < to.getMonth();
/** @deprecated */
export const isAfterMonth
= (from: Date, to: Date) => from.getMonth() > to.getMonth();
/** @deprecated */
export const isSameOrBeforeMonth
= (from: Date, to: Date) => from.getMonth() <= to.getMonth();
/** @deprecated */
export const isSameOrAfterMonth
= (from: Date, to: Date) => from.getMonth() >= to.getMonth();
