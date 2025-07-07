import { cn } from '@packages/ui';
import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/_page/home')({
  component: RouteComponent,
  staticData: {
    title: 'HOME',
    order: 1,
  },
});

function RouteComponent() {
  return (
    <div className="tw:size-full tw:flex tw:flex-col tw:gap-1">
      <div className="tw:flex-1 tw:flex tw:gap-1">
        <div className={cn(
          'tw:flex-2/3 tw:bg-gray-300 tw:p-10',
          'tw:grid tw:grid-rows-[auto_1fr_auto]',
          'tw:transform tw:transition-transform tw:duration-300 tw:origin-top-left tw:hover:scale-125')}
        >
          <h2 className="tw:font-extrabold">
            What is A SW Engineer?
          </h2>
          <ul className="tw:list-disc tw:pl-5">
            <li>
              선진 기술과 실행가능한 데이터를 기반으로 문제를 효과적이며 창의적으로 해결하는 사람
            </li>
          </ul>
          <Link to="/about" className="tw:text-right tw:text-blue-800 tw:font-bold">👉자세히 보기</Link>
        </div>
        <div className={cn(
          'tw:md:block tw:hidden tw:flex-1/3 tw:bg-yellow-300',
          'tw:transform tw:transition-transform tw:duration-300 tw:origin-top-right',
        )}
        >
          <img />
        </div>
      </div>
      <div className="tw:flex-1 tw:flex tw:gap-1">
        <div className={cn(
          'tw:md:block tw:hidden tw:flex-1/3 tw:bg-red-300',
          'tw:transform tw:transition-transform tw:duration-300 tw:origin-center-left',
        )}
        >
          <img />
        </div>
        <div className={cn(
          'tw:flex-2/3 tw:bg-emerald-300 tw:p-10',
          'tw:grid tw:grid-rows-[auto_1fr_auto]',
          'tw:transform tw:transition-transform tw:duration-300 tw:origin-center-right tw:hover:scale-125',
        )}
        >
          <h2 className="tw:font-extrabold">
            As a Software Engineer, how do you solve problems?
          </h2>
          <ul className="tw:list-disc tw:pl-5">
            <li>프로토 타입 제작에 유용한 UI 라이브러리</li>
            <li>효율적인 커뮤니케이션을 위한 프레임워크</li>
            <li>데이터/지식 기반의 선순환 피드백</li>
          </ul>
          <Link to="/overview" className="tw:text-left tw:text-blue-800 tw:font-bold">👉자세히 보기</Link>
        </div>
      </div>
      <div className="tw:flex-1 tw:grid tw:grid-cols-3 tw:gap-1">
        <div className={cn(
          'tw:col-span-3 tw:bg-blue-300',
          'tw:grid tw:grid-cols-5',
          'tw:transform tw:transition-transform tw:duration-300 tw:origin-bottom tw:hover:scale-125',
        )}
        >
          <div className={cn(
            'tw:grid tw:grid-rows-[auto_1fr_auto] tw:p-10',
            'tw:col-start-1 tw:col-span-5',
            'tw:md:col-start-2 tw:md:col-span-3',
          )}
          >
            <h2 className="tw:font-extrabold">
              So What?
            </h2>
            <ul className="tw:list-disc tw:pl-5">
              <li>
                기술과 실행을 연결하는 문제해결 아키텍처
              </li>
              <li>
                IT 서비스가 플랫폼으로서 선순환 패드백 구조를 만드는 사람
              </li>
            </ul>
            <Link to="/contact" className="tw:text-right tw:text-blue-800 tw:font-bold">📞연락 하기</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
