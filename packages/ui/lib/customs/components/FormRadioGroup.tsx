import { safeParse } from '@packages/utils';
import { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { FieldPath, FieldPathValue, FieldValues, UseControllerProps } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage, RadioGroup, RadioGroupItem } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

type RadioItem<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  label: ReactNode
  value: TName extends keyof TFieldValues
    ? FieldPathValue<TFieldValues, TName>
    : never
  disabled?: boolean
};

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
  }
  & {
    items: RadioItem<TFieldValues, TName>[]
  };


/** 라디오(그룹) */
export function FormRadioGroup<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: Props<TFieldValues, TName>) {
  const {
    control, name, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    items,
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
            <FormControl>
              <RadioGroup
                value={`${field.value}`}
                onValueChange={(v) => field.onChange(safeParse(v))}
                className={cn(
                  'tw:flex tw:flex-wrap tw:gap-2',
                  orientation === 'horizontal'
                    ? 'tw:flex-row tw:items-center'
                    : 'tw:flex-col',
                )}
              >
                {
                  items.map((item) => (
                    <FormItem
                      key={`${item.value}`}
                      className={cn(
                        'tw:flex tw:flex-wrap',
                      )}
                    >
                      <FormControl>
                        <RadioGroupItem
                          className={cn(
                            'tw:[&_*]:min-size-auto',
                            'tw:[&_*]:max-size-none',
                          )}
                          value={`${item.value}`}
                          disabled={item.disabled}
                        />
                      </FormControl>
                      <FormLabel>
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  ))
                }
              </RadioGroup>
            </FormControl>
            {showError && (
              <FormMessage />
            )}
          </div>
        </FormItem>
      )}
    />
  );
}
