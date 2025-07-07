import * as React from 'react';

import { cn } from '#shadcn/lib/utils.ts';

function Table({ className, scrollRef, ...props }: React.ComponentProps<'table'> & { scrollRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="table-container"
      className="tw:relative tw:size-full tw:overflow-auto"
      ref={scrollRef}
    >
      <table
        data-slot="table"
        className={cn('tw:size-full tw:caption-bottom tw:text-sm', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('tw:[&_tr]:border-b', className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('tw:[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'tw:bg-muted/50 tw:border-t tw:font-medium tw:[&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'tw:hover:bg-muted/50 tw:data-[state=selected]:bg-muted tw:border-b tw:transition-colors',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'tw:text-foreground tw:h-10 tw:px-2 tw:text-left tw:align-middle tw:font-medium tw:pr-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'tw:p-2 tw:align-middle tw:whitespace-nowrap',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('tw:text-muted-foreground tw:mt-4 tw:text-sm', className)}
      {...props}
    />
  );
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

