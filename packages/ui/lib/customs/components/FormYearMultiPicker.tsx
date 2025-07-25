import { Button, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { DATE } from '@packages/utils';
import { format, getDecade } from 'date-fns';
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


/** 연도 선택(복수) */
export function FormYearMultiPicker<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy', fromDate, toDate,
    min, max, onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [api, setApi] = useState<CarouselApi>();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Date[]>([]);
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
                      {Array.from({ length: 3 }, (_, i) => selectDecade.add(DATE.decade, Math.floor(i - 1 / 2))).map((current) => (
                        <CarouselItem
                          key={current.get(DATE.decade)}
                          className="tw:flex tw:justify-center"
                        >
                          <Button
                            disabled={
                              (fromDate && fromDate.isAfter(current, DATE.decade))
                              || (toDate && toDate.isBefore(current, DATE.decade))
                            }
                            variant={selectDecade.isSame(current, DATE.decade) ? 'default' : 'ghost'}
                            onClick={() => {
                              setSelectDecade(current);
                            }}
                          >
                            {`${current.get(DATE.decade)} ~ ${current.get(DATE.decade) + 10}년`}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious
                      disabled={fromDate && fromDate.isSameOrAfter(selectDecade, DATE.decade)}
                      onClick={() => {
                        const prevDecade = selectDecade.sub(DATE.decade, 1);
                        setSelectDecade(prevDecade);
                      }}
                    />
                    <CarouselNext
                      disabled={toDate && toDate.isSameOrBefore(selectDecade, DATE.decade)}
                      onClick={() => {
                        const nextDecade = selectDecade.add(DATE.decade, 1);
                        setSelectDecade(nextDecade);
                      }}
                    />
                  </Carousel>
                </div>
                <div className="tw:grid tw:grid-cols-4">
                  {Array.from({ length: 12 }, (_, i) => i - 1).map((idx) => (
                    <Button
                      key={idx}
                      disabled={
                        (fromDate && fromDate.isAfter(selectDecade.add(DATE.year, idx), DATE.year))
                        || (toDate && toDate.isBefore(selectDecade.add(DATE.year, idx), DATE.year))
                      }
                      variant={selection.find((select) => selectDecade.add(DATE.year, idx).isSame(select, DATE.year)) ? 'default' : 'ghost'}
                      onClick={() => setSelection((selection) => {
                        if (selection.find((select) => selectDecade.add(DATE.year, idx).isSame(select, DATE.year))) {
                          return selection.filter((select) => !selectDecade.add(DATE.year, idx).isSame(select, DATE.year));
                        }
                        else {
                          return (!max || selection.length < max)
                            ? [...selection, selectDecade.add(DATE.year, idx)]
                            : selection;
                        }
                      })}
                    >
                      {`${selectDecade.add(DATE.year, idx).get(DATE.year)}년`}
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
