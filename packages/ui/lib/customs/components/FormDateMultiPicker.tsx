import { format } from 'date-fns';
import { sortBy } from 'lodash-es';
import { CalendarIcon, RotateCcw } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useEffect, useState } from 'react';
import { FieldPath, FieldValues, UseControllerProps, useWatch } from 'react-hook-form';

import { Button, Calendar, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

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
    min?: number
    max?: number
    fromDate?: Date
    toDate?: Date
    dateFormat?: string
  };


/** 날짜 선택(복수)  */
export function FormDateMultiPicker<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy-MM-dd', fromDate, toDate,
    min, max, onBlur,
  } = props;

  const {
    reset = 'Reset',
  } = {};

  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Date[]>([]);
  const value = useWatch({ name });

  useEffect(() => {
    setSelection(value);
  }, [value]);

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
                className="tw:w-auto"
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
                <div className="tw:flex">
                  {/* 날짜 */}
                  <Calendar
                    mode="multiple"
                    selected={selection}
                    onSelect={
                      (dt) => setSelection(dt ?? [])
                    }
                    min={(min && +min) || undefined}
                    max={(max && +max) || undefined}
                    startMonth={fromDate}
                    endMonth={toDate}
                    disabled={[{ before: fromDate!, after: toDate! }]}
                  />
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
