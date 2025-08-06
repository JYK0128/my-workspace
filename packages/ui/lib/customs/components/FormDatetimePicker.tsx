import { format } from 'date-fns';
import { CalendarClockIcon } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, useEffect, useState } from 'react';
import { FieldPath, FieldValues, UseControllerProps, useWatch } from 'react-hook-form';

import { Button, Calendar, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Popover, PopoverContent, PopoverTrigger, Separator } from '#shadcn/components/ui/index.ts';
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
    fromDate?: Date
    toDate?: Date
    dateFormat?: string
  };


/** 날짜/시간 선택 */
export function FormDatetimePicker<T extends FieldValues>(props: Props<T>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    dateFormat = 'yyyy-MM-dd HH:mm:ss', fromDate, toDate,
    onBlur,
  } = props;

  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Date>();
  const value = useWatch({ name });

  useEffect(() => {
    setSelection(value);
  }, [value]);


  const [prevIntKey, setPrevIntKey] = useState<string>('0');
  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevIntKey('0');
    }, 2000);

    return () => clearTimeout(timer);
  }, [prevIntKey]);


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
                    <CalendarClockIcon />
                    <span className="tw:flex-1">
                      {selection && `${format(selection, dateFormat)}`}
                    </span>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent
                className="tw:w-auto"
                align="start"
                onCloseAutoFocus={(evt) => {
                  field.onChange(selection);
                  onBlur?.(evt as never);
                }}
              >
                <div className="tw:flex tw:flex-col">
                  {/* 날짜 */}
                  <Calendar
                    mode="single"
                    selected={selection}
                    defaultMonth={selection}
                    onSelect={
                      (dt) => setSelection(dt)
                    }
                    startMonth={fromDate}
                    endMonth={toDate}
                    disabled={[{ before: fromDate!, after: toDate! }]}
                  />

                  <Separator />
                  <div className="tw:flex tw:items-center tw:gap-2 tw:mt-2">
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      disabled={!selection}
                      className="tw:caret-transparent tw:cursor-default tw:text-end"
                      value={selection?.format('HH') ?? '00'}
                      onBlur={() => {
                        setPrevIntKey('0');
                      }}
                      onKeyDown={(e) => {
                        const cur = e.key;
                        if ('0' <= cur && cur <= '9') {
                          e.preventDefault();
                          let prev = prevIntKey;
                          if ((+prev < 0 || 2 < +prev) || (+prev === 2 && +cur > 3)) {
                            prev = '0';
                          }
                          setSelection(selection?.set('hour', +[prev, cur].join('')));
                          setPrevIntKey(cur);
                        }
                      }}
                      onInput={(e) => {
                        const value = e.currentTarget.valueAsNumber;
                        setSelection(selection?.set('hour', value));
                        setPrevIntKey('0');
                      }}
                    />
                    :
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      disabled={!selection}
                      className="tw:caret-transparent tw:cursor-default tw:text-end"
                      value={selection?.format('mm') ?? '00'}
                      onBlur={() => {
                        setPrevIntKey('0');
                      }}
                      onKeyDown={(e) => {
                        const cur = e.key;
                        if ('0' <= cur && cur <= '9') {
                          e.preventDefault();
                          let prev = prevIntKey;
                          if (+prev < 0 || 5 < +prev) {
                            prev = '0';
                          }
                          setSelection(selection?.set('minute', +[prev, cur].join('')));
                          setPrevIntKey(cur);
                        }
                      }}
                      onInput={(e) => {
                        const value = e.currentTarget.valueAsNumber;
                        setSelection(selection?.set('minute', value));
                        setPrevIntKey('0');
                      }}
                    />
                    :
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      disabled={!selection}
                      className="tw:caret-transparent tw:cursor-default tw:text-end"
                      value={selection?.format('ss') ?? '00'}
                      onBlur={() => {
                        setPrevIntKey('0');
                      }}
                      onKeyDown={(e) => {
                        const cur = e.key;
                        if ('0' <= cur && cur <= '9') {
                          e.preventDefault();
                          let prev = prevIntKey;
                          if (+prev < 0 || 5 < +prev) {
                            prev = '0';
                          }
                          setSelection(selection?.set('second', +[prev, cur].join('')));
                          setPrevIntKey(cur);
                        }
                      }}
                      onInput={(e) => {
                        const value = e.currentTarget.valueAsNumber;
                        setSelection(selection?.set('second', value));
                        setPrevIntKey('0');
                      }}
                    />
                  </div>
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
