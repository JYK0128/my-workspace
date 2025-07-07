import { CodeForm, CodeModal, CodeMsg, CodeTable } from '#/assets';
import Overview01 from '#/assets/overview_01.png';
import { cn, useIntersections, useRefs } from '@packages/ui';
import { createFileRoute, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_public/_page/overview')({
  component: RouteComponent,
  staticData: {
    title: 'OVERVIEW',
    order: 3,
  },
});

function RouteComponent() {
  const { entries, setRef: setObserver } = useIntersections({
    threshold: 0.5,
  });
  const { refs, setRef } = useRefs<HTMLAnchorElement>();
  const location = useLocation();

  // TODO: Sticky Scroll 오류 처리방안?
  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.target.id === location.hash) {
        entry.target.classList.remove('tw:sticky');
        requestAnimationFrame(() => {
          entry.target.classList.add('tw:sticky');
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    const links = Array.from(refs.current.values()).filter((v) => !!v).reverse();
    let highlighted = false;
    for (const link of links) {
      const id = link.href.split('#').at(-1);
      const targets = Array.from(entries).filter(([key, entry]) => id && key.startsWith(id) && entry.isIntersecting);
      if (!highlighted && targets.length) {
        link.classList.add('tw:bg-black', 'tw:rounded-full');
        highlighted = true;
      }
      else {
        link.classList.remove('tw:bg-black', 'tw:rounded-full');
      }
    }
  }, [entries, refs]);

  return (
    <div
      id="test"
      className={cn(
        'tw:size-full tw:overflow-y-auto',
        'tw:snap-y tw:snap-mandatory',
        'tw:flex tw:flex-col',
      )}
    >
      <nav className={cn(
        'tw:fixed tw:z-10 tw:top-1/2 tw:right-3',
        'tw:flex tw:flex-col',
      )}
      >
        <a ref={setRef} href="#page01">O</a>
        <a ref={setRef} href="#page02">O</a>
      </nav>

      <div
        id="page01"
        ref={setObserver}
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-row tw:flex-wrap',
          'tw:sticky tw:top-0',
        )}
      >
        <div
          id="page01_01"
          className={cn(
            'tw:flex-1/3 tw:p-4 tw:basis-sm',
          )}
        >
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6 tw:mb-10">
            <h3 className="tw:font-semibold tw:mb-1">
              📋특징
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                안정성 높은 100% 타입스크립트 기반 MonoRepo
              </li>
              <li className="tw:whitespace-pre-line">
                다양한 디자인에 대응할 수 있는 Structured UI
              </li>
              <li className="tw:whitespace-pre-line">
                유연한 데이터 접근을 위한 Dynamic Query
              </li>
            </ul>
          </div>

          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-6 tw:mb-10">
            <h3 className="tw:font-semibold tw:mb-1">
              📋구성요소
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                Infra: Oracle Cloud + Supabase
              </li>
              <li className="tw:whitespace-pre-line">
                Backend: Express + tRPC + Kysely
              </li>
              <li className="tw:whitespace-pre-line">
                Frontend: React + Shadcn + Tanstack Router / Query / Table / Virtual
              </li>
            </ul>
          </div>

          <div className="tw:border-l-4 tw:border-green-500 tw:pl-6 tw:mb-10">
            <h3 className="tw:font-semibold tw:mb-1">
              📋저장소
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                환경변수 정리 후 오픈 예정
              </li>
            </ul>
          </div>
        </div>
        <div
          id="page01_02"
          className={cn(
            'tw:bg-red-100 tw:p-4',
            'tw:flex-2/3 tw:h-full',
          )}
        >
          <img src={Overview01} />
        </div>
      </div>
      <div
        id="page02"
        ref={setObserver}
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-row',
          'tw:sticky tw:top-0',
        )}
      >
        <div
          id="page02_01"
          className={cn(
            'tw:bg-green-100 tw:p-4',
            'tw:size-full',
            'tw:grid tw:grid-rows-[1fr_auto]',
          )}
        >
          <div className="tw:grid tw:grid-cols-2 tw:gap-5">
            <div className="tw:flex tw:items-center tw:justify-center"><img src={CodeTable} /></div>
            <div className="tw:flex tw:items-center tw:justify-center"><img src={CodeForm} /></div>
            <div className="tw:flex tw:items-center tw:justify-center"><img src={CodeModal} /></div>
            <div className="tw:flex tw:items-center tw:justify-center"><img src={CodeMsg} /></div>
          </div>
          <a
            href="/storybook"
            className={cn(
              'tw:mt-20',
              'tw:text-right tw:pr-20 tw:font-extrabold tw:text-2xl tw:text-blue-800 tw:cursor-pointer',
            )}
          >
            👉UI 컴포넌트 자세히 보기
          </a>
        </div>
      </div>
    </div>
  );
}
