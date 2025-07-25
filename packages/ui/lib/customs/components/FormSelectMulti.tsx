import { Button, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, FormControl, FormField, FormItem, FormLabel, FormMessage, Popover, PopoverContent, PopoverTrigger } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { Check, ChevronsUpDown, RotateCcw, Search } from 'lucide-react';
import { ComponentPropsWithoutRef, CSSProperties, ReactNode, useEffect, useState } from 'react';
import { FieldPath, FieldPathValue, FieldValues, UseControllerProps, useWatch } from 'react-hook-form';

type SelectItem<
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
    items: SelectItem<TFieldValues, TName>[]
    min?: number
    max?: number
  };


/** 콤보박스(다중) */
export function FormSelectMulti<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: Props<TFieldValues, TName>) {
  const {
    name, control, disabled,
    label, labelWidth = 'auto', orientation = 'horizontal',
    showError = false, required = false,
    items, min, max,
  } = props;

  const {
    placeholder = 'search...',
    notFound = 'Not found.',
    reset = 'Reset',
    filter = 'Filter',
  } = {};

  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<Props<TFieldValues>['items'][number]['value'][]>([]);
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
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    size="default"
                    role="combobox"
                    className={cn(
                      'tw:w-60',
                      'tw:flex tw:justify-between',
                      !field.value.length && 'tw:text-muted-foreground',
                    )}
                  >
                    {
                      field.value.length
                        ? items.find((item) => field.value.includes(item.value))?.label
                        : `${placeholder}`
                    }
                    {field.value.length > 1 ? ` 외 ${field.value.length - 1} 건` : ''}
                    <ChevronsUpDown className="tw:opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Command>
                  <CommandInput placeholder={placeholder} />
                  <CommandList>
                    <CommandEmpty>{notFound}</CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={`${item.value}`}
                          value={`${item.label}`}
                          onSelect={() => {
                            setSelection((selection) => {
                              if (selection.includes(item.value)) {
                                return (!min || selection.length > min)
                                  ? selection.filter((v) => v !== item.value)
                                  : selection;
                              }
                              else {
                                return (!max || selection.length < max)
                                  ? [...selection, item.value]
                                  : selection;
                              }
                            });
                          }}
                        >
                          {item.label}
                          <Check
                            className={cn(
                              'tw:ml-auto',
                              selection.includes(item.value)
                                ? 'tw:opacity-100'
                                : 'tw:opacity-0',
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  <div className="tw:flex tw:justify-end">
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
                    <Button
                      variant="default"
                      className="tw:font-bold"
                      disabled={
                        !!(min && +min > selection.length)
                        && !!(max && +max < selection.length)
                      }
                      onClick={() => {
                        field.onChange(selection);
                        setOpen(false);
                      }}
                    >
                      {filter}
                      <Search />
                    </Button>
                  </div>
                </Command>
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
