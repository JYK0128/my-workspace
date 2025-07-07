'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '#shadcn/lib/utils.ts';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'tw:relative tw:flex tw:w-full tw:touch-none tw:items-center tw:select-none tw:data-[disabled]:opacity-50 tw:data-[orientation=vertical]:h-full tw:data-[orientation=vertical]:min-h-44 tw:data-[orientation=vertical]:w-auto tw:data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'tw:bg-muted tw:relative tw:grow tw:overflow-hidden tw:rounded-full tw:data-[orientation=horizontal]:h-1.5 tw:data-[orientation=horizontal]:w-full tw:data-[orientation=vertical]:h-full tw:data-[orientation=vertical]:w-1.5',
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'tw:bg-primary tw:absolute tw:data-[orientation=horizontal]:h-full tw:data-[orientation=vertical]:w-full',
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="tw:border-primary tw:bg-background tw:ring-ring/50 tw:block tw:size-4 tw:shrink-0 tw:rounded-full tw:border tw:shadow-sm tw:transition-[color,box-shadow] tw:hover:ring-4 tw:focus-visible:ring-4 tw:focus-visible:outline-hidden tw:disabled:pointer-events-none tw:disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

