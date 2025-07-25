import { Button, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { DATE } from '@packages/utils';
import { format } from 'date-fns';
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
    fromDate?: Date
    toDate?: Date
    dateFormat?: string
  };


/** 달 선택(범위) */
export function FormMonthRange<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy-MM', fromDate, toDate,
    onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [api, setApi] = useState<CarouselApi>();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<[Optional<Date>, Optional<Date>]>([undefined, undefined]);
  const value = useWatch({ name });

  const [selectYear, setSelectYear] = useState(new Date());

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
                      {selection?.[0] && `${format(selection[0], dateFormat)}`}
                      {` ~ `}
                      {selection?.[1] && `${format(selection[1], dateFormat)}`}
                    </span>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                className="tw:w-96"
                align="start"
                onCloseAutoFocus={(evt) => {
                  if (selection?.length === 2) {
                    field.onChange(selection);
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
                      {Array.from({ length: 5 }, (_, i) => selectYear.add(DATE.year, Math.floor(i - 5 / 2))).map((current) => (
                        <CarouselItem
                          key={current.get(DATE.year)}
                          className="!tw:basis-1/3 tw:flex tw:justify-center"
                        >
                          <Button
                            disabled={
                              (fromDate && fromDate.isAfter(current, DATE.year))
                              || (toDate && toDate.isBefore(current, DATE.year))
                            }
                            variant={selectYear.isSame(current, DATE.year) ? 'default' : 'ghost'}
                            onClick={() => {
                              setSelectYear(current);
                            }}
                          >
                            {`${current.get(DATE.year)}년`}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious
                      disabled={fromDate && fromDate.isSameOrAfter(selectYear, DATE.year)}
                      onClick={() => {
                        const prevYear = selectYear.sub(DATE.year, 1);
                        setSelectYear(prevYear);
                      }}
                    />
                    <CarouselNext
                      disabled={toDate && toDate.isSameOrBefore(selectYear, DATE.year)}
                      onClick={() => {
                        const nextYear = selectYear.add(DATE.year, 1);
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
                        (fromDate && fromDate.isAfter(selectYear.add(DATE.month, idx), DATE.month, { granularity: DATE.year }))
                        || (toDate && toDate.isBefore(selectYear.add(DATE.month, idx), DATE.month, { granularity: DATE.year }))
                      }
                      variant={selection.find((select) => select && selectYear.add(DATE.month, idx).isSame(select, DATE.month, { granularity: DATE.year })) ? 'default' : 'ghost'}
                      onClick={() => setSelection((selection) => {
                        const [from, to] = selection ?? [];
                        const select = selectYear.add(DATE.month, idx);

                        if (!from) {
                          return [select, to];
                        }
                        else {
                          if (select.isSame(from, DATE.month, { granularity: DATE.year })) {
                            if (to) {
                              return [undefined, undefined];
                            }
                            else {
                              return [from, select];
                            }
                          }
                          else if (select.isBefore(from, DATE.month, { granularity: DATE.year })) {
                            return [select, to ?? from];
                          }
                        }
                        if (!to) {
                          return [from, select];
                        }
                        else {
                          if (select.isSame(to, DATE.month, { granularity: DATE.year })) {
                            return [select, undefined];
                          }
                          else if (select.isAfter(from, DATE.month, { granularity: DATE.year })) {
                            return [from, select];
                          }
                          else {
                            throw Error('unexpected error');
                          }
                        }
                      })}
                    >
                      {`${idx + 1}월`}
                    </Button>
                  ))}
                </div>
                <div className="tw:flex tw:justify-start">
                  <Button
                    variant="ghost"
                    className="tw:font-bold"
                    onClick={() => {
                      setSelection([undefined, undefined]);
                      field.onChange([undefined, undefined]);
                    }}
                  >
                    <RotateCcw />
                    {reset}
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
