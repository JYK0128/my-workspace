import { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { FieldPath, FieldPathValue, FieldValues, UseControllerProps } from 'react-hook-form';

import { Checkbox, FormControl, FormField, FormItem, FormLabel, FormMessage } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';

type CheckItem<
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
    items: CheckItem<TFieldValues, TName>[]
  };


/** 체크박스(그룹) */
export function FormCheckGroup<
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
            <div
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
                      <Checkbox
                        disabled={item.disabled}
                        checked={field.value.includes(item.value)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, item.value])
                            : field.onChange(field.value.filter((value: unknown) => value !== item.value));
                        }}
                      />
                    </FormControl>
                    <FormLabel>
                      {item.label}
                    </FormLabel>
                  </FormItem>
                ))
              }
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
