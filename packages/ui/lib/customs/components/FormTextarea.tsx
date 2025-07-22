import { FormControl, FormField, FormItem, FormLabel, FormMessage, Textarea } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<UseControllerProps<TFieldValues, TName>, 'defaultValue'>
  & Omit<ComponentPropsWithoutRef<'textarea'>, 'defaultValue' | 'value' | 'defaultChecked' | 'checked'>
  & {
    control: UseControllerProps<TFieldValues, TName>['control']
    name: TName
    label?: string
    labelWidth?: CSSProperties['width']
    orientation?: 'vertical' | 'horizontal'
    showError?: boolean
  };

/** 텍스트 입력 */
export function FormTextarea<T extends FieldValues>(props: Props<T>) {
  const {
    name, disabled, control,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
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
              className="tw:flex tw:items-start"
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
              <Textarea
                {...inputProps}
                {...field}
                onChange={(e) => {
                  inputProps.onChange?.(e);
                  field.onChange(e);
                }}
                onBlur={(e) => {
                  inputProps.onBlur?.(e);
                  field.onBlur();
                }}
              />
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
