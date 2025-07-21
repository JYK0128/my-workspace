import { SidebarLayout } from '#customs/components/SidebarLayout.tsx';
import { Separator } from '#shadcn/components/ui/separator.tsx';
import { cn } from '#shadcn/lib/utils.ts';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';


export function ListPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeStickyIndexRef = useRef(0);

  const virtualizer = useVirtualizer({
    count: 100,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 20,
    overscan: 5,
    // sticky 처리
    rangeExtractor: (range) => {
      const list = defaultRangeExtractor(range);

      const stickyIndex = Math.floor(range.startIndex / 10) * 10;
      if (!list.includes(stickyIndex)) {
        list.unshift(stickyIndex);
      }
      activeStickyIndexRef.current = stickyIndex;

      return list;
    },
  });

  // TODO: Fix Bug
  const isSticky = (index: number) => !(index % 10);

  const isActiveSticky = (index: number) => {
    return activeStickyIndexRef.current === index;
  };


  return (
    <SidebarLayout>
      <div ref={scrollRef} className="tw:scroll-y">
        <div style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
        >
          {virtualizer.getVirtualItems().map((item) => (
            <div
              key={item.key}
              ref={virtualizer.measureElement}
              data-index={item.index}
              className={cn(
                'tw:absolute tw:top-0 tw:left-0 tw:w-full',
                isSticky(item.index) ? 'tw:bg-yellow-300 tw:z-10' : '',
                isActiveSticky(item.index) ? 'tw:sticky tw:top-0' : '',
              )}
              style={{
                transform: !isActiveSticky(item.index) ? `translateY(${item.start}px)` : undefined,
              }}
            >
              {`Row ${item.index}, ${item.key}, ${isActiveSticky(item.index)}, ${item.start}px`}
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
