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

  const isSticky = (index: number) => !(index % 10);

  const isActiveSticky = (index: number) => {
    if (index === 10) console.log(index, `ActiveSticky is ${activeStickyIndexRef.current}`);
    return activeStickyIndexRef.current === index;
  };


  return (
    <SidebarLayout>
      <div ref={scrollRef} className="tw:size-full tw:scroll-y">
        <div style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
        >
          {virtualizer.getVirtualItems().map((item) => {
            const { index } = item;
            // index로 데이터 접근하기

            return (
              <div
                key={item.key}
                ref={virtualizer.measureElement}
                data-index={item.index}
                className={cn(
                  'tw:absolute tw:top-0 tw:left-0 tw:w-full',
                  isSticky(item.index) ? 'tw:bg-yellow-300 tw:z-10' : '',
                  isActiveSticky(item.index) ? 'tw:sticky' : '',
                )}
                style={{
                  transform: !isActiveSticky(item.index) ? `translateY(${item.start}px)` : '',
                }}
              >
                {`Row ${item.index}, ${item.key}, ${isActiveSticky(item.index)}`}
                <Separator />
              </div>
            );
          },
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
