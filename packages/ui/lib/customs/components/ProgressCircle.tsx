import { ComponentPropsWithoutRef } from 'react';

import { cn } from '#shadcn/lib/utils.ts';

type Props = {
  pct: number
  size?: string | number
  showPct?: boolean
}
& ComponentPropsWithoutRef<'div'>;


/** 진행률 표시(원형) */
export function ProgressCircle({ pct, className, size = '1.25rem', showPct, ...props }: Props) {
  return (
    <div
      className={cn(
        'tw:relative',
        className)}
      style={{
        ...props.style,
        height: size,
        width: size,
      }}
      {...props}
    >
      <svg className="tw:w-full tw:h-full tw:-rotate-90" viewBox="0 0 100 100">
        {/* 배경 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--background)"
          strokeWidth="10"
        />
        {/* 진행 원 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="283"
          strokeDashoffset={283 * (1 - pct / 100)}
        />
      </svg>
      {showPct && (
        <div
          className={cn(
            'tw:absolute',
            'tw:inset-0',
            'tw:flex tw:items-center tw:justify-center',
            'tw:text-[var(--foreground)]',
          )}
          style={{ fontSize: `calc(${size} / 3)` }}
        >
          {`${Math.round(pct)}%`}
        </div>
      )}
    </div>
  );
}
