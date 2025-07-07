import { cn } from '#shadcn/lib/utils.ts';
import { HTMLAttributes, PropsWithChildren } from 'react';

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;


/** 바탕 레이아웃 */
export function MuteLayout({ children, className, ...props }: Props) {
  return (
    <div
      {...props}
      className={cn(
        'tw:bg-muted',
        'tw:min-h-svh tw:max-h-svh',
        'tw:flex tw:items-center tw:justify-center',
        className,
      )}
    >
      {children}
    </div>
  );
}
