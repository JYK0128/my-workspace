import { formatDate } from 'date-fns';

export const DATE = {
  decade: 0,
  year: 1,
  month: 2,
  day: 3,
  hour: 4,
  minute: 5,
  second: 6,
  ms: 7,
  timezone: 8,
} as const;
type DATE = keyof typeof DATE;

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
    ? new Date(Date.UTC(...(arr.slice(DATE.year, DATE.timezone) as [number, number, number, number, number, number, number])))
    : new Date(...(arr.slice(DATE.year, DATE.timezone) as [number, number, number, number, number, number, number]));
};

const handleAdjustMonth = (arr: number[], date: Date, utc?: boolean) => {
  const modDate = utc ? date.getUTCDate() : date.getDate();
  const originalDate = arr[DATE.day];

  if (originalDate !== modDate) {
    arr[DATE.month] = arr[DATE.month] + 1;
    arr[DATE.day] = 0;
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
  const scale = DATE[unit];

  if (scale === DATE.decade) {
    thisArray[DATE.year] = (Math.floor(thisArray[DATE.year] / 10) + value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    thisArray[scale] += value;
    const date = createDate(thisArray, utc);
    return scale === DATE.month && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.sub = function (this, unit, value, options) {
  const { adjust, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  const scale = DATE[unit];

  thisArray[scale] -= value;
  if (scale === DATE.decade) {
    thisArray[DATE.year] = (Math.floor(thisArray[DATE.year] / 10) - value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    const date = createDate(thisArray, utc);
    return scale === DATE.month && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.set = function (this, unit, value, options) {
  const { adjust, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  const scale = DATE[unit];

  thisArray[scale] = value;
  if (scale === DATE.decade) {
    thisArray[DATE.year] = (Math.floor(thisArray[DATE.year] / 10) + value) * 10;
    return createDate(thisArray, utc);
  }
  else {
    const date = createDate(thisArray, utc);
    return scale === DATE.month && adjust ? handleAdjustMonth(thisArray, date, utc) : date;
  }
};

Date.prototype.get = function (this, unit, options) {
  const { utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  const scale = DATE[unit];

  return thisArray[scale];
};

Date.prototype.isSame = function (this, date, unit, options) {
  const { granularity, utc } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const thisArray = this[toArray]();
  const dateArray = date[toArray]();
  const scale = DATE[unit];

  if (granularity !== undefined) {
    const base = DATE[granularity];
    const start = Math.min(scale, base);
    const end = Math.max(scale, base);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] !== dateArray[i]) {
        return false;
      }
    }
    return true;
  }
  else {
    return thisArray[scale] === dateArray[scale];
  }
};

Date.prototype.isSameOrBefore = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const scale = DATE[unit];

  const offsetDate = date.add(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const base = DATE[granularity];
    const start = Math.min(scale, base);
    const end = Math.max(scale, base);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] < dateArray[i]) return true;
      if (thisArray[i] > dateArray[i]) return false;
    }
    return true;
  }
  else {
    return thisArray[scale] <= dateArray[scale];
  }
};

Date.prototype.isSameOrAfter = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const scale = DATE[unit];

  const offsetDate = date.sub(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const base = DATE[granularity];
    const start = Math.min(scale, base);
    const end = Math.max(scale, base);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] > dateArray[i]) return true;
      if (thisArray[i] < dateArray[i]) return false;
    }
    return true;
  }
  else {
    return thisArray[scale] >= dateArray[scale];
  }
};

Date.prototype.isBefore = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const scale = DATE[unit];

  const offsetDate = date.sub(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const base = DATE[granularity];
    const start = Math.min(scale, base);
    const end = Math.max(scale, base);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] < dateArray[i]) return true;
      if (thisArray[i] > dateArray[i]) return false;
    }
    return false;
  }
  else {
    return thisArray[scale] < dateArray[scale];
  }
};

Date.prototype.isAfter = function (this, date, unit, options) {
  const { granularity, utc, offset = 0 } = options ?? {};
  const toArray = utc ? 'toUtcArray' : 'toArray';
  const scale = DATE[unit];

  const offsetDate = date.add(unit, offset, options);
  const thisArray = this[toArray]();
  const dateArray = offsetDate[toArray]();

  if (granularity !== undefined) {
    const base = DATE[granularity];
    const start = Math.min(scale, base);
    const end = Math.max(scale, base);

    for (let i = start; i <= end; i++) {
      if (thisArray[i] > dateArray[i]) return true;
      if (thisArray[i] < dateArray[i]) return false;
    }
    return false;
  }
  else {
    return thisArray[scale] > dateArray[scale];
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
