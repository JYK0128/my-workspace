'use client';

import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '#shadcn/lib/utils.ts';

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName,
      )}
      className={cn('tw:disabled:cursor-not-allowed', className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('tw:flex tw:items-center', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        'tw:data-[active=true]:border-ring tw:data-[active=true]:ring-ring/50 tw:data-[active=true]:aria-invalid:ring-destructive/20 tw:dark:data-[active=true]:aria-invalid:ring-destructive/40 tw:aria-invalid:border-destructive tw:data-[active=true]:aria-invalid:border-destructive tw:dark:bg-input/30 tw:border-input tw:relative tw:flex tw:h-9 tw:w-9 tw:items-center tw:justify-center tw:border-y tw:border-r tw:text-sm tw:shadow-xs tw:transition-all tw:outline-none tw:first:rounded-l-md tw:first:border-l tw:last:rounded-r-md tw:data-[active=true]:z-10 tw:data-[active=true]:ring-[3px]',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="tw:pointer-events-none tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center">
          <div className="tw:animate-caret-blink tw:bg-foreground tw:h-4 tw:w-px tw:duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };

