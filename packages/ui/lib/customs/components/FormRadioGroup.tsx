import { FormControl, FormField, FormItem, FormLabel, FormMessage, RadioGroup, RadioGroupItem } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { safeParse } from '@packages/utils';
import { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { FieldPath, FieldPathValue, FieldValues, UseControllerProps } from 'react-hook-form';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<Mandatory<UseControllerProps<TFieldValues, TName>, 'control'>, 'defaultValue'>
  & Omit<ComponentPropsWithoutRef<'input'>, 'defaultValue' | 'value' | 'defaultChecked' | 'checked'>
  & {
    label?: string
    labelWidth?: CSSProperties['width']
    orientation?: 'vertical' | 'horizontal'
    showError?: boolean
  }
  & {
    items: {
      label: ReactNode
      value: TName extends keyof TFieldValues
        ? FieldPathValue<TFieldValues, TName>
        : never
    }[]
  };


/** 라디오(그룹) */
export function FormRadioGroup<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: Props<TFieldValues, TName>) {
  const {
    name, control, disabled,
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
                        <RadioGroupItem value={`${item.value}`} />
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
