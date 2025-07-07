import { cn } from '#shadcn/lib/utils.ts';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('tw:bg-accent tw:animate-pulse tw:rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };

