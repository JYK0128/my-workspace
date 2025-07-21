import { Button, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { DATE } from '@packages/utils';
import { format, getDecade } from 'date-fns';
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


/** 연도 선택(단일) */
export function FormYearPicker<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat: dateFormat = 'yyyy', fromDate, toDate,
    onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [api, setApi] = useState<CarouselApi>();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Date>();
  const value = useWatch({ name });

  const [selectDecade, setSelectDecade] = useState(new Date(getDecade(new Date()), 0));

  useEffect(() => {
    setSelection(value);
  }, [value]);

  useEffect(() => {
    if (open && api) {
      const slideCount = api.slideNodes().length;
      const slidesInView = 1;
      const targetIndex = Math.floor(slideCount / 2 - slidesInView / 2);

      api.scrollTo(targetIndex);
    }
  }, [api, open]);

  const defaults = (selection?: Date) => {
    return selection ?? new Date();
  };

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
                      {selection && `${format(selection, dateFormat)}`}
                    </span>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                className="tw:w-96"
                align="start"
                onCloseAutoFocus={(evt) => {
                  field.onChange(selection);
                  onBlur?.(evt as never);
                }}
              >
                <div className="[&>*]:tw:py-2">
                  <Carousel
                    setApi={setApi}
                    onKeyDownCapture={() => {}}
                  >
                    <CarouselContent>
                      {Array.from({ length: 3 }, (_, i) => selectDecade.add(DATE.DECADE, Math.floor(i - 1 / 2))).map((current) => (
                        <CarouselItem
                          key={current.get(DATE.DECADE)}
                          className="tw:flex tw:justify-center"
                        >
                          <Button
                            disabled={
                              (fromDate && fromDate.isAfter(current, DATE.DECADE))
                              || (toDate && toDate.isBefore(current, DATE.DECADE))
                            }
                            variant={selectDecade.isSame(current, DATE.DECADE) ? 'default' : 'ghost'}
                            onClick={() => {
                              setSelectDecade(current);
                              if ((fromDate && fromDate.isSameOrAfter(defaults(selection), DATE.YEAR))
                                || (toDate && toDate.isSameOrBefore(defaults(selection), DATE.YEAR))) {
                                setSelection(undefined);
                              }
                            }}
                          >
                            {`${current.get(DATE.DECADE)} ~ ${current.get(DATE.DECADE) + 10}년`}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious
                      disabled={fromDate && fromDate.isSameOrAfter(selectDecade, DATE.DECADE)}
                      onClick={() => {
                        const prevDecade = selectDecade.sub(DATE.DECADE, 1);
                        setSelectDecade(prevDecade);
                        if (fromDate && fromDate.isSameOrBefore(defaults(selection), DATE.DECADE)) {
                          setSelection(undefined);
                        }
                      }}
                    />
                    <CarouselNext
                      disabled={toDate && toDate.isSameOrBefore(selectDecade, DATE.DECADE)}
                      onClick={() => {
                        const nextDecade = selectDecade.add(DATE.DECADE, 1);
                        setSelectDecade(nextDecade);
                        if (toDate && toDate.isSameOrBefore(defaults(selection), DATE.DECADE)) {
                          setSelection(undefined);
                        }
                      }}
                    />
                  </Carousel>
                </div>
                <div className="tw:grid tw:grid-cols-4">
                  {Array.from({ length: 12 }, (_, i) => i - 1).map((idx) => (
                    <Button
                      key={idx}
                      disabled={
                        (fromDate && fromDate.isAfter(selectDecade.add(DATE.YEAR, idx), DATE.YEAR))
                        || (toDate && toDate.isBefore(selectDecade.add(DATE.YEAR, idx), DATE.YEAR))
                      }
                      variant={selection && selection.isSame(selectDecade.add(DATE.YEAR, idx), DATE.YEAR) ? 'default' : 'ghost'}
                      onClick={() => setSelection(
                        defaults(selection).set(
                          DATE.YEAR,
                          selectDecade.add(DATE.YEAR, idx).get(DATE.YEAR)),
                      )}
                    >
                      {`${selectDecade.add(DATE.YEAR, idx).get(DATE.YEAR)}년`}
                    </Button>
                  ))}
                </div>
                <div className="tw:flex tw:justify-start">
                  <Button
                    variant="ghost"
                    className="tw:font-bold"
                    onClick={() => {
                      setSelection(undefined);
                      field.onChange(undefined);
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
