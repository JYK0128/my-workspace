import { omit } from 'lodash-es';
import { ComponentPropsWithoutRef, CSSProperties, useId } from 'react';
import { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Slider } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>, 'defaultValue'>
  & Omit<ComponentPropsWithoutRef<'input'>, 'defaultValue' | 'value' | 'defaultChecked' | 'checked'>
  & {
    control: UseControllerProps<TFieldValues, TName>['control']
    name: TName
    required?: boolean
    label?: string
    labelWidth?: CSSProperties['width']
    orientation?: 'vertical' | 'horizontal'
    showError?: boolean
  } & {
    slider?: 'vertical' | 'horizontal'
    input?: 'bottom' | 'top' | 'left' | 'right' | 'none'
    dir?: 'ltr' | 'rtl'
    min?: number
    max?: number
    step?: number
  };

/** 단순 텍스트 입력 */
export function FormSliderMulti<T extends FieldValues>(props: Props<T>) {
  const id = useId();
  const {
    control, name, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false, slider = 'horizontal',
    dir = 'ltr', min = 0, max = 100, step = 1, input = 'top',
    ...inputProps
  } = props;

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
            <div
              className={cn(
                'tw:flex tw:gap-2',
                {
                  top: 'tw:flex-col-reverse',
                  bottom: 'tw:flex-col',
                  left: 'tw:flex-row-reverse',
                  right: 'tw:flex-row',
                  none: '',
                }[input],
              )}
            >
              <FormControl>
                <Slider
                  {...omit(field, 'onChange', 'onBlur', 'value')}
                  orientation={slider}
                  dir={dir}
                  min={min}
                  max={max}
                  step={step}
                  className={cn(
                    'tw:[&_*]:min-size-auto tw:[&_*]:max-size-none',
                  )}
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                  }}
                  onValueCommit={() => {
                    field.onBlur();
                  }}
                />
              </FormControl>
              <div
                className={cn(
                  'tw:flex tw:gap-2',
                  {
                    top: slider === 'horizontal' ? 'tw:flex-row tw:justify-between' : 'tw:flex-row tw:justify-center',
                    bottom: slider === 'horizontal' ? 'tw:flex-row tw:justify-between' : 'tw:flex-row tw:justify-center',
                    left: slider === 'horizontal' ? 'tw:flex-row tw:items-center' : 'tw:flex-col-reverse tw:justify-between',
                    right: slider === 'horizontal' ? 'tw:flex-row tw:items-center' : 'tw:flex-col-reverse tw:justify-between',
                    none: 'tw:hidden',
                  }[input],
                )}
              >
                {(field.value as unknown[]).map((_, idx) => (
                  <FormControl key={id}>
                    <Input
                      {...omit(field, 'onChange', 'onBlur', 'value')}
                      value={field.value[idx]}
                      type="number"
                      min={min}
                      max={max}
                      className={cn(
                        'tw:text-right',
                        'tw:w-25',
                      )}
                      onChange={(e) => {
                        field.onChange((field.value as unknown[]).toSpliced(idx, 1, e.currentTarget.value));
                        inputProps.onChange?.(e);
                      }}
                      onBlur={(e) => {
                        field.onBlur();
                        inputProps.onBlur?.(e);
                      }}
                    />
                  </FormControl>
                ))}
              </div>
            </div>
            {showError && (
              <FormMessage />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
