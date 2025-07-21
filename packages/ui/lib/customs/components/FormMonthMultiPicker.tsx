import { Button, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { DATE } from '@packages/utils';
import { format, getYear } from 'date-fns';
import { sortBy } from 'lodash-es';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useEffect, useState } from 'react';
import { FieldPath, FieldValues, UseControllerProps, useWatch } from 'react-hook-form';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<Mandatory<UseControllerProps<TFieldValues, TName>, 'control'>, 'defaultValue'>
  & Omit<ComponentPropsWithoutRef<'input'>, 'defaultValue' | 'value'>
  & {
    label?: string
    labelWidth?: CSSProperties['width']
    orientation?: 'vertical' | 'horizontal'
    showError?: boolean
  }
  & {
    min?: number
    max?: number
    fromDate?: Date
    toDate?: Date
    dateFormat?: string
  };


/** 달 선택(복수) */
export function FormMonthMultiPicker<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy-MM', fromDate, toDate,
    min, max, onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [api, setApi] = useState<CarouselApi>();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Date[]>([]);
  const value = useWatch({ name });

  const [selectYear, setSelectYear] = useState(new Date(getYear(new Date()), 0));

  useEffect(() => {
    setSelection(value);
  }, [value]);

  useEffect(() => {
    if (open && api) {
      const slideCount = api.slideNodes().length;
      const slidesInView = 3;
      const targetIndex = Math.floor(slideCount / 2 - slidesInView / 2);

      api.scrollTo(targetIndex);
    }
  }, [api, open]);

  return (
    <FormField
      name={name}
      control={control}
      disabled={disabled}
      render={({ field }) => (
        <FormItem
          className={cn(
            'tw:min-h-auto tw:min-w-auto',
            'tw:flex tw:flex-wrap',
            orientation === 'horizontal'
              ? 'tw:flex-row'
              : 'tw:flex-col',
          )}
        >
          {label && (
            <div
              style={{ width: labelWidth }}
              className="tw:flex tw:items-center"
            >
              <FormLabel>
                {label}
                {required && (
                  <sup className="tw:text-red-600"> *</sup>
                )}
              </FormLabel>
            </div>
          )}
          <div className="tw:flex-1">
            <Popover open={open} onOpenChange={setOpen}>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="tw:w-60">
                    <CalendarIcon />
                    <span className="tw:flex-1">
                      {selection[0] && `${format(sortBy(selection)[0], dateFormat)}`}
                      {selection[1] ? ` 외 ${selection.length - 1} 건` : ''}
                    </span>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                className="tw:w-96"
                align="start"
                onCloseAutoFocus={(evt) => {
                  if ((!min || +min <= selection.length)
                    && (!max || selection.length <= +max)) {
                    field.onChange(selection);
                  }
                  else {
                    setSelection([]);
                    field.onChange([]);
                  }
                  onBlur?.(evt as never);
                }}
              >
                <div className="[&>*]:tw:py-2">
                  <Carousel
                    setApi={setApi}
                    onKeyDownCapture={() => {}}
                  >
                    <CarouselContent>
                      {Array.from({ length: 5 }, (_, i) => selectYear.add(DATE.YEAR, Math.floor(i - 5 / 2))).map((current) => (
                        <CarouselItem
                          key={current.get(DATE.YEAR)}
                          className="!tw:basis-1/3 tw:flex tw:justify-center"
                        >
                          <Button
                            disabled={
                              (fromDate && fromDate.isAfter(current, DATE.YEAR))
                              || (toDate && toDate.isBefore(current, DATE.YEAR))
                            }
                            variant={selectYear.isSame(current, DATE.YEAR) ? 'default' : 'ghost'}
                            onClick={() => {
                              setSelectYear(current);
                            }}
                          >
                            {`${current.get(DATE.YEAR)}년`}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious
                      disabled={fromDate && fromDate.isSameOrAfter(selectYear, DATE.YEAR)}
                      onClick={() => {
                        const prevYear = selectYear.sub(DATE.YEAR, 1);
                        setSelectYear(prevYear);
                      }}
                    />
                    <CarouselNext
                      disabled={toDate && toDate.isSameOrBefore(selectYear, DATE.YEAR)}
                      onClick={() => {
                        const nextYear = selectYear.add(DATE.YEAR, 1);
                        setSelectYear(nextYear);
                      }}
                    />
                  </Carousel>
                </div>
                <div className="tw:grid tw:grid-cols-3">
                  {Array.from({ length: 12 }, (_, i) => i).map((idx) => (
                    <Button
                      key={idx}
                      disabled={
                        (fromDate && fromDate.isAfter(selectYear.add(DATE.MONTH, idx), DATE.MONTH, { granularity: DATE.YEAR }))
                        || (toDate && toDate.isBefore(selectYear.add(DATE.MONTH, idx), DATE.MONTH, { granularity: DATE.YEAR }))
                      }
                      variant={selection.find((select) => selectYear.add(DATE.MONTH, idx).isSame(select, DATE.MONTH, { granularity: DATE.YEAR })) ? 'default' : 'ghost'}
                      onClick={() => setSelection((selection) => {
                        if (selection.find((select) => selectYear.add(DATE.MONTH, idx).isSame(select, DATE.MONTH, { granularity: DATE.YEAR }))) {
                          return selection.filter((select) => !selectYear.add(DATE.MONTH, idx).isSame(select, DATE.MONTH, { granularity: DATE.YEAR }));
                        }
                        else {
                          return (!max || selection.length < max)
                            ? [...selection, selectYear.add(DATE.MONTH, idx)]
                            : selection;
                        }
                      })}
                    >
                      {`${selectYear.add(DATE.MONTH, idx).get(DATE.MONTH) + 1}월`}
                    </Button>
                  ))}
                </div>
                <div className="tw:flex tw:justify-start">
                  <Button
                    variant="ghost"
                    className="tw:font-bold"
                    onClick={() => {
                      setSelection([]);
                      field.onChange([]);
                    }}
                  >
                    {reset}
                    <RotateCcw />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            {showError && (
              <FormMessage />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
