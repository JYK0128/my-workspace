import { Button, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { format } from 'date-fns';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useEffect, useState } from 'react';
import { FieldPath, FieldValues, UseControllerProps, useWatch } from 'react-hook-form';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>, 'defaultValue'>
  & Omit<ComponentPropsWithoutRef<'input'>, 'defaultValue' | 'value'>
  & {
    control: UseControllerProps<TFieldValues, TName>['control']
    name: TName
    required?: boolean
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


/** 연도 선택(범위) */
export function FormYearRange<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy', fromDate, toDate,
    onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [api, setApi] = useState<CarouselApi>();
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<[Nullish<Date>, Nullish<Date>]>([null, null]);
  const value = useWatch({ name });

  const [selectDecade, setSelectDecade] = useState(new Date(new Date().get('decade'), 0));

  useEffect(() => {
    setSelection(value);
  }, [value]);

  useEffect(() => {
    if (open && api) {
      const slideCount = api.slideNodes().length;
      const slidesInView = 1;
      const targetIndex = Math.floor(slideCount / 2 - slidesInView / 2);

      api.scrollTo(targetIndex, true);
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
                      {selection[0] && `${format(selection[0], dateFormat)}`}
                      {` ~ `}
                      {selection[1] && `${format(selection[1], dateFormat)}`}
                    </span>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                align="start"
                onCloseAutoFocus={(evt) => {
                  if (selection.length === 2) {
                    field.onChange(selection);
                  }
                  onBlur?.(evt as never);
                }}
              >
                <div>
                  <Carousel
                    setApi={setApi}
                    onKeyDownCapture={() => {}}
                  >
                    <CarouselContent>
                      {Array.from({ length: 3 }, (_, i) => selectDecade.add('decade', Math.floor(i - 1 / 2))).map((current) => (
                        <CarouselItem
                          key={current.get('decade')}
                          className="tw:pl-8 tw:flex tw:justify-center"
                        >
                          <Button
                            disabled={
                              (fromDate && fromDate.isAfter(current, 'decade'))
                              || (toDate && toDate.isBefore(current, 'decade'))
                            }
                            variant={selectDecade.isSame(current, 'decade') ? 'default' : 'ghost'}
                            onClick={() => {
                              setSelectDecade(current);
                            }}
                          >
                            {`${current.get('decade')} ~ ${current.get('decade') + 9}년`}
                          </Button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious
                      className="tw:left-4"
                      disabled={fromDate && fromDate.isSameOrAfter(selectDecade, 'decade')}
                      onClick={() => {
                        const prevDecade = selectDecade.sub('decade', 1);
                        setSelectDecade(prevDecade);
                      }}
                    />
                    <CarouselNext
                      className="tw:right-4"
                      disabled={toDate && toDate.isSameOrBefore(selectDecade, 'decade')}
                      onClick={() => {
                        const nextDecade = selectDecade.add('decade', 1);
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
                        (fromDate && fromDate.isAfter(selectDecade.add('year', idx), 'year', { granularity: 'decade' }))
                        || (toDate && toDate.isBefore(selectDecade.add('year', idx), 'year', { granularity: 'decade' }))
                      }
                      variant={selection.find((select) => select && selectDecade.add('year', idx).isSame(select, 'year', { granularity: 'decade' })) ? 'default' : 'ghost'}
                      onClick={() => setSelection((selection) => {
                        const [from, to] = selection ?? [];
                        const select = selectDecade.add('year', idx);

                        if (!from) {
                          return [select, to];
                        }
                        else {
                          if (select.isSame(from, 'year', { granularity: 'decade' })) {
                            if (to) {
                              return [undefined, undefined];
                            }
                            else {
                              return [from, select];
                            }
                          }
                          else if (select.isBefore(from, 'year', { granularity: 'decade' })) {
                            return [select, to ?? from];
                          }
                        }
                        if (!to) {
                          return [from, select];
                        }
                        else {
                          if (select.isSame(to, 'year', { granularity: 'decade' })) {
                            return [select, undefined];
                          }
                          else if (select.isAfter(from, 'year', { granularity: 'decade' })) {
                            return [from, select];
                          }
                          else {
                            throw Error('unexpected error');
                          }
                        }
                      })}
                    >
                      {`${selectDecade.add('year', idx).get('year')}년`}
                    </Button>
                  ))}
                </div>
                <div className="tw:flex tw:justify-start">
                  <Button
                    variant="ghost"
                    className="tw:font-bold"
                    onClick={() => {
                      field.onChange([null, null]);
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
