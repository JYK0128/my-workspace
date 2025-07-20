import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, useIntersections, useRefs } from '@packages/ui';
import { execute } from '@packages/utils';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/_public/_page/about')({
  component: RouteComponent,
  staticData: {
    title: 'ABOUT',
    order: 2,
  },
});

function RouteComponent() {
  const { entries, setRef: setObserver } = useIntersections({
    threshold: 0.5,
  });

  const { refs, setRef } = useRefs<HTMLAnchorElement>();

  useEffect(() => {
    const links = Array.from(refs.current.values()).filter((v) => !!v).reverse();
    let highlighted = false;
    for (const link of links) {
      const id = link.href.split('#').at(-1);
      const targets = Array.from(entries).filter(([key, entry]) => id && key.startsWith(id) && entry.isIntersecting);
      if (!highlighted && id && targets.length) {
        link.classList.add('tw:bg-black', 'tw:rounded-full');
        highlighted = true;
      }
      else {
        link.classList.remove('tw:bg-black', 'tw:rounded-full');
      }
    }
  }, [entries, refs]);

  return (
    <div className={cn(
      'tw:size-full tw:overflow-x-auto',
      'tw:snap-x tw:snap-mandatory',
      'tw:flex tw:flex-row',
    )}
    >
      <nav className={cn(
        'tw:fixed tw:z-10 tw:left-1/2 tw:bottom-3',
        'tw:flex tw:flex-row',
      )}
      >
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page01">O</a>
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page02">O</a>
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page03">O</a>
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page04">O</a>
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page05">O</a>
        <a ref={(el) => execute(el, (el) => setRef(el))} href="#page06">O</a>
      </nav>
      {/* 자기소개 */}
      <div
        id="page01"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page01_01"
          className={cn(
            'tw:grid tw:grid-rows-[auto_1fr] tw:gap-5 tw:p-4',
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:scroll-y',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:justify-center tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-40 tw:h-40 tw:rounded-full',
              'tw:bg-gradient-to-br tw:from-blue-500 tw:to-cyan-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              사진
            </div>
          </div>
          {/* 좌측 - 컨텐츠 */}
          <div>
            <h2 className={cn(
              'tw:text-center', 'tw:mb-10',
              'tw:text-3xl tw:font-bold tw:text-gray-900',
            )}
            >
              김진용
            </h2>

            <div className="tw:text-lg tw:mt-10">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableHead>나이</TableHead>
                    <TableCell>
                      <div>만 34세</div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>거주지역</TableHead>
                    <TableCell>
                      <div>경기 부천</div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>교육</TableHead>
                    <TableCell>
                      <div>중앙대학교 경영학부 졸업(2009.03 ~ 2016.02)</div>
                      <div>중앙대학교 일반대학원 MIS전공 수료(2016.03 ~ 2018.02)</div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>커리어</TableHead>
                    <TableCell>
                      <div>피어나인(2021.04 ~ 2022.12)</div>
                      <div>코그넷나인(2022.12 ~ 2025.05)</div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableHead>자격증</TableHead>
                    <TableCell>
                      <div>정보처리산업기사</div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page01_02"
          className={cn(
            'tw:bg-gray-100 tw:p-3',
            'tw:flex-1/2 tw:h-full',
            'tw:scroll-y',
          )}
        >
          <div>
            <h1 className="tw:font-bold tw:text-xl">참여 프로젝트</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>프로젝트</TableHead>
                  <TableHead>스킬</TableHead>
                  <TableHead>링크</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>메디링스</TableCell>
                  <TableCell className="tw:whitespace-pre-line">
                    {`서비스: PgSql, NestJS(Prisma/GraphQL/Apollo), React16(React Router/Redux)
                    이미지분석: Ptyhon, OpenCV, Tesseract
                    레거시서비스: MySQL, Express, EJS`}
                  </TableCell>
                  <TableCell>
                    <a className="tw:text-blue-800 tw:font-bold" href="#page02">이동</a>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>KB 금융비서</TableCell>
                  <TableCell className="tw:whitespace-pre-line">
                    {`관리자: React 16(React Router, Tanstack Query) 
                      서비스: Vue 3(Vue Router)
                      그외: K8S, NGINX, JENKINS, ArgoCD, AWS OpenSearch`}
                  </TableCell>
                  <TableCell>
                    <a className="tw:text-blue-800 tw:font-bold" href="#page03">이동</a>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>광주서구청 스마트 돌봄</TableCell>
                  <TableCell className="tw:whitespace-pre-line">
                    {`관리자: Vue 3(Vue Router) 
                      서비스: Vue 3(Vue Router)
                      그외: Docker, Nginx`}
                  </TableCell>
                  <TableCell>
                    <a className="tw:text-blue-800 tw:font-bold" href="#page04">이동</a>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>코스맥스 Cos-Chat</TableCell>
                  <TableCell className="tw:whitespace-pre-line">
                    {`관리자: Vue 3(Vue Router) 
                      그외: GitLab CI`}
                  </TableCell>
                  <TableCell>
                    <a className="tw:text-blue-800 tw:font-bold" href="#page05">이동</a>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>오뚜기 O-balance</TableCell>
                  <TableCell className="tw:whitespace-pre-line">
                    {`관리자/서비스: React18(Tanstack Query / Table / Virtual) 
                      그외: GitLab CI`}
                  </TableCell>
                  <TableCell>
                    <a className="tw:text-blue-800 tw:font-bold" href="#page06">이동</a>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <div className="tw:flex tw:items-end">
              <h1 className="tw:font-bold tw:text-xl">주요 기술</h1>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>분류</TableHead>
                  <TableHead>기술상세</TableHead>
                  <TableHead>배포도구</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>DB</TableCell>
                  <TableCell>Postgres, MySQL</TableCell>
                  <TableCell rowSpan={3} className="tw:whitespace-pre-line">
                    {`K8S, Docker,
                    Jenkins, ArgoCD, 
                    Gitlab CI, Github Actions`}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Backend</TableCell>
                  <TableCell>
                    <div>Express, tRPC, NestJS, Prisma, Apollo Server</div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Frontend</TableCell>
                  <TableCell>
                    <div>React, Tanstack Router/Query/Table/Virtual </div>
                    <div>Vue3, Vue Router, React Router, Redux</div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {/* 메디링스 */}
      <div
        id="page02"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page02_01"
          className={cn(
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:flex tw:flex-col tw:gap-5 tw:p-4',
            'tw:scroll-y',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-16 tw:h-16 tw:rounded-xl',
              'tw:bg-gradient-to-br tw:from-blue-500 tw:to-cyan-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              <span
                className={cn(
                  'tw:text-white tw:font-bold tw:text-xl',
                )}
              >
                P9
              </span>
            </div>
            <div>
              <div className={cn(
                'tw:text-sm tw:font-medium tw:text-gray-500',
                'tw:uppercase tw:tracking-wide',
              )}
              >
                PEERNINE
              </div>
              <h2 className={cn(
                'tw:text-3xl tw:font-bold tw:text-gray-900',
              )}
              >
                메디링스
              </h2>
            </div>
          </div>
          {/* 좌측 - 요약 */}
          <div className="tw:bg-gradient-to-r tw:from-red-50 tw:to-pink-50 tw:rounded-xl tw:p-6">
            <div className={cn(
              'tw:inline-flex tw:items-center tw:p-2',
              'tw:bg-red-100 tw:text-red-800',
              'tw:text-sm tw:font-medium tw:rounded-full',
            )}
            >
              📅2021-04 ~ 2022-12
            </div>
            <div className={cn(
              'tw:text-gray-700',
              'tw:text-lg tw:font-medium',
            )}
            >
              모바일 건강검진 솔루션
            </div>
          </div>

          {/* 좌측 - 컨텐츠 */}
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋건강검진 질의/응답 데이터 설계
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: PGSQL + NestJS(Prisma / GraphQL) + React16
                - 문진 항목 정의: 검진 별 기본 템플릿 구성
                - 응답 구조 설계: JSON 기반의 표준 스키마 정의
                - 질문 유형 분류: 객관식(단답/복수), 주관식, 수치, 이미지보조 질문
                - 답변 분기조건 처리: 특정 응답에 따른 후속 문진`}
              </li>
            </ul>
          </div>
          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋질의 OCR / 응답 Marker 개발
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: OpenCV + Tesseract
                - 질의/답변 항목에 대하여 텍스트 + 마킹 위치 정보 추출
                - 표준 스키마 기반 JSON 데이터 생성`}
              </li>
            </ul>
          </div>
          <div className="tw:border-l-4 tw:border-green-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋레거시 코드 운영
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: MySQL + Express + EJS
                  - 프로젝트 초기버전 유지보수 및 데이터 마이그레이션`}
              </li>
            </ul>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page02_02"
          className={cn(
            'tw:flex tw:flex-col tw:gap-2',
            'tw:bg-red-50 tw:p-3',
            'tw:flex-1/2 tw:h-full',
            'tw:scroll-y',
          )}
        >
          <div className="tw:text-xl tw:font-bold">아쉬웠던 점</div>
          <div className="tw:whitespace-pre-line">
            <span>issue 01 - 오류 처리</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://github.com/JYK0128/my-workspace/blob/dev/packages/ui/lib/customs/components/ErrorBoundary.tsx">[링크]</a>
            {`
              원인: Client에서 잘못된 값의 참조 / API 통신 간 데이터 누수 발생
              개선방향: 원인을 정확하게 파악할 수 있는 전역 에러관리 구조 필요
              해결방안: 렌더링 / 런타임 오류 전역 에러관리 컴포넌트 구현
            `}
          </div>

          <div className="tw:whitespace-pre-line">
            <span>issue 02 - 전역상태관리</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://github.com/JYK0128/my-workspace/blob/dev/apps/web/src/routes/_protected/_page/channel.index.tsx">[예시]</a>
            {`
              원인: 페이지 내 상태관리를 위해 Redux와 state함수를 혼용
              개선방안: 페이지 단위의 상태관리 체계가 필요
              해결방안:
              - tanstack router와 같은 File-Based 라우팅 도구 사용
              - tanstack query와 같은 API 중심의 상태관리도구 사용
              - 데이터의 조합이 필요할 땐 Memorize 함수 사용
            `}
          </div>

          <div className="tw:whitespace-pre-line">
            <span>issue 03 - 운영도구 구축</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://jyworld.kro.kr/storybook/?path=/story/complete-flowpage--index">[링크1]</a>
            <a className="tw:text-blue-800 tw:font-bold" href="https://jyworld.kro.kr/storybook/?path=/docs/complete-treepage--docs">[링크2]</a>
            {`
              원인: 운영진에서 프로세스를 다루기 위해선 JSON 구조를 알아야 했음
              개선방안: Tree & Graph 자료형태를 구조화하는 도구 필요
              해결방안:
              - React Flow를 사용한 프로세스 관리도구 구축
              - Shadcn을 사용한 트리 관리도구 구축
            `}
          </div>
        </div>
      </div>
      {/* KB 금융비서 */}
      <div
        id="page03"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page03_01"
          className={cn(
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:flex tw:flex-col tw:gap-5 tw:p-4',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-16 tw:h-16 tw:rounded-xl',
              'tw:bg-gradient-to-br tw:from-red-500 tw:to-pink-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              <span
                className={cn(
                  'tw:text-white tw:font-bold tw:text-xl',
                )}
              >
                C9
              </span>
            </div>
            <div>
              <div className={cn(
                'tw:text-sm tw:font-medium tw:text-gray-500',
                'tw:uppercase tw:tracking-wide',
              )}
              >
                COGNET9
              </div>
              <h2 className={cn(
                'tw:text-3xl tw:font-bold tw:text-gray-900',
              )}
              >
                KB 금융비서
              </h2>
            </div>
          </div>
          <div className="tw:bg-gradient-to-r tw:from-green-50 tw:to-pink-50 tw:rounded-xl tw:p-6">
            <div className={cn(
              'tw:inline-flex tw:items-center tw:p-2',
              'tw:bg-green-100 tw:text-green-800',
              'tw:text-sm tw:font-medium tw:rounded-full',
            )}
            >
              📅2022-12 ~ 2024-03
            </div>
            <div className={cn(
              'tw:text-gray-700',
              'tw:text-lg tw:font-medium',
            )}
            >
              모바일 AI 챗봇 금융 서비스
            </div>
          </div>

          {/* 좌측 - 컨텐츠 */}
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋관리자 웹 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(React16 + Nginx) + CI/CD(K8S + Jenkins + ArgoCD)
                  - 사용자 관리, 챗봇로그 관리, 데이터 시각화
                  - 관리자 권한관리, 챗봇서비스 운영관리`}
              </li>
            </ul>
          </div>
          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋사용자 웹앱 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(Vue3 + Nginx) + CI/CD(Jenkins)
                - 챗봇 UI 라이브러리 연동
                - 금융서비스 시나리오 연동 모듈`}
              </li>
            </ul>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page03_02"
          className={cn(
            'tw:flex tw:flex-col tw:gap-2',
            'tw:bg-green-50 tw:p-3',
            'tw:flex-1/2 tw:h-full',
          )}
        >
          <div className="tw:text-xl tw:font-bold">아쉬웠던 점</div>
          <div className="tw:whitespace-pre-line">
            <span>issue 01 - Props Drilling 이슈</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://jyworld.kro.kr/storybook/?path=/story/complete-formpage--index">[링크]</a>
            {`
              원인: 잘게 쪼갠 컴포넌트에 의해 복잡성 증가
              개선방안: 입력값을 Form으로 제어
              해결방안: React Hook Form을 사용하여 입력값과 검증을 제어
            `}
          </div>

          <div className="tw:whitespace-pre-line">
            <span>issue 02 - 앱 Bridge 이슈</span>
            {`
                원인: Native에서 처리하는 API의 제어 이슈
                개선방안: 메시지 관리체계 필요
                해결방안: Debounce로 요청 제어, Queue로 응답 제어
              `}
          </div>
        </div>
      </div>
      {/* 광주서구청 Smart-HealthCare */}
      <div
        id="page04"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page04_01"
          className={cn(
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:flex tw:flex-col tw:gap-5 tw:p-4',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-16 tw:h-16 tw:rounded-xl',
              'tw:bg-gradient-to-br tw:from-red-500 tw:to-pink-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              <span
                className={cn(
                  'tw:text-white tw:font-bold tw:text-xl',
                )}
              >
                C9
              </span>
            </div>
            <div>
              <div className={cn(
                'tw:text-sm tw:font-medium tw:text-gray-500',
                'tw:uppercase tw:tracking-wide',
              )}
              >
                COGNET9
              </div>
              <h2 className={cn(
                'tw:text-3xl tw:font-bold tw:text-gray-900',
              )}
              >
                광주서구청 스마트 돌봄
              </h2>
            </div>
          </div>
          <div className="tw:bg-gradient-to-r tw:from-blue-50 tw:to-pink-50 tw:rounded-xl tw:p-6">
            <div className={cn(
              'tw:inline-flex tw:items-center tw:p-2',
              'tw:bg-blue-100 tw:text-blue-800',
              'tw:text-sm tw:font-medium tw:rounded-full',
            )}
            >
              📅2024-03 ~ 2024-07
            </div>
            <div className={cn(
              'tw:text-gray-700',
              'tw:text-lg tw:font-medium',
            )}
            >
              IoT 디바이스 연계 노령층 건강관리 서비스
            </div>
          </div>

          {/* 좌측 - 컨텐츠 */}
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋관리자 웹 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(Vue3 + Nginx) + CI/CD(Docker)
                - 대상자 위치기반 신체계측정보 모니터링 기능
                - 방문진료 관리 기능`}
              </li>
            </ul>
          </div>
          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋사용자 웹앱 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(Vue3 + Nginx) + CI/CD(Docker)
                - 실시간 알림 및 긴급 호출 기능
                - 방문진료 신청/관리 기능
                - 피부양자 건강 모니터링 기능`}
              </li>
            </ul>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page04_02"
          className={cn(
            'tw:flex tw:flex-col tw:gap-2',
            'tw:bg-blue-50 tw:p-3',
            'tw:flex-1/2 tw:h-full',
          )}
        >
          <div className="tw:text-xl tw:font-bold">아쉬웠던 점</div>
          <div className="tw:whitespace-pre-line">
            <span>issue 01 - 접근/권한 관리</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://github.com/JYK0128/my-workspace/blob/dev/apps/web/src/routeTools.ts">[링크]</a>
            {`
              원인: 권한 구조를 만들 일정이 부족하여 N개의 앱을 구축
              개선방안: 백엔드에서 권한정보를 관리하는 체계 필요
              해결방안: Bootstrap 이전 Tanstack Router에서 Router를 추가하여 권한정보를 관리
            `}
          </div>
          <div className="tw:whitespace-pre-line">
            <span>issue 02 - 프로젝트 실행체계 미흡</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://github.com/JYK0128/my-workspace/blob/dev/packages/ui/lib/pages/WelcomePage.stories.ts">[예시]</a>
            {`
              원인: 기획자 중심의 waterfall 프로잭트 진행으로 개발시간 부족 
              개선방안: 프론트 레이어 단에서 빠른 프로토타입 구축이 필요
              해결방안: 목업된 값과 핸들러를 사용하여 Storybook에서 프로토타입 구축
            `}
          </div>
        </div>
      </div>
      {/* 코스맥스 Teams AI App */}
      <div
        id="page05"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page05_01"
          className={cn(
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:flex tw:flex-col tw:gap-5 tw:p-4',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-16 tw:h-16 tw:rounded-xl',
              'tw:bg-gradient-to-br tw:from-red-500 tw:to-pink-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              <span
                className={cn(
                  'tw:text-white tw:font-bold tw:text-xl',
                )}
              >
                C9
              </span>
            </div>
            <div>
              <div className={cn(
                'tw:text-sm tw:font-medium tw:text-gray-500',
                'tw:uppercase tw:tracking-wide',
              )}
              >
                COGNET9
              </div>
              <h2 className={cn(
                'tw:text-3xl tw:font-bold tw:text-gray-900',
              )}
              >
                코스맥스 Cos-Chat
              </h2>
            </div>
          </div>
          <div className="tw:bg-gradient-to-r tw:from-cyan-50 tw:to-pink-50 tw:rounded-xl tw:p-6">
            <div className={cn(
              'tw:inline-flex tw:items-center tw:p-2',
              'tw:bg-cyan-100 tw:text-cyan-800',
              'tw:text-sm tw:font-medium tw:rounded-full',
            )}
            >
              📅2024-07 ~ 2024-08
            </div>
            <div className={cn(
              'tw:text-gray-700',
              'tw:text-lg tw:font-medium',
            )}
            >
              MS TEAMS 사내 LLM 어플리케이션
            </div>
          </div>

          {/* 좌측 - 컨텐츠 */}
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋관리자 웹 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(React18 + Nginx) + CI/CD(GitLab CI)
                  - 사용자 관리, 상담내역 조회, 챗봇서비스 운영관리
                  - 그룹사별 사용량/요금 조회
                  - SSO 로그인 설계 및 구현`}
              </li>
            </ul>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page05_02"
          className={cn(
            'tw:flex tw:flex-col tw:gap-2',
            'tw:bg-cyan-50 tw:p-3',
            'tw:flex-1/2 tw:h-full',
          )}
        >
          <div className="tw:text-xl tw:font-bold">아쉬웠던 점</div>
          <div className="tw:whitespace-pre-line">
            <span>issue 01 - 개발자 리딩체계 미흡</span>
            {`
              원인: API 늦은 제공으로 개발시간 부족
              개선방안: 목업 데이터를 사용한 프로토타입 구축 필요
              해결방안: Zod를 사용하여 API 스키마 정의 및 목업 구축
            `}
          </div>
        </div>
      </div>
      {/* 오뚜기 O-balance */}
      <div
        id="page06"
        className={cn(
          'tw:size-full tw:shrink-0 tw:snap-start',
          'tw:flex tw:flex-wrap',
        )}
      >
        {/* 좌측 */}
        <div
          ref={setObserver}
          id="page06_01"
          className={cn(
            'tw:flex-1/2 tw:basis-xl tw:h-full',
            'tw:flex tw:flex-col tw:gap-5 tw:p-4',
          )}
        >
          {/* 좌측 - 타이틀 */}
          <div className="tw:flex tw:items-center tw:space-x-4">
            <div className={cn(
              'tw:w-16 tw:h-16 tw:rounded-xl',
              'tw:bg-gradient-to-br tw:from-red-500 tw:to-pink-600',
              'tw:flex tw:items-center tw:justify-center',
            )}
            >
              <span
                className={cn(
                  'tw:text-white tw:font-bold tw:text-xl',
                )}
              >
                C9
              </span>
            </div>
            <div>
              <div className={cn(
                'tw:text-sm tw:font-medium tw:text-gray-500',
                'tw:uppercase tw:tracking-wide',
              )}
              >
                COGNET9
              </div>
              <h2 className={cn(
                'tw:text-3xl tw:font-bold tw:text-gray-900',
              )}
              >
                오뚜기 O-balance
              </h2>
            </div>
          </div>
          <div className="tw:bg-gradient-to-r tw:from-yellow-50 tw:to-pink-50 tw:rounded-xl tw:p-6">
            <div className={cn(
              'tw:inline-flex tw:items-center tw:p-2',
              'tw:bg-yellow-100 tw:text-yellow-800',
              'tw:text-sm tw:font-medium tw:rounded-full',
            )}
            >
              📅2024-08 ~ 2025-05
            </div>
            <div className={cn(
              'tw:text-gray-700',
              'tw:text-lg tw:font-medium',
            )}
            >
              개인 맞춤형 식단 추천 서비스
            </div>
          </div>

          {/* 좌측 - 컨텐츠 */}
          <div className="tw:border-l-4 tw:border-red-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋관리자 웹 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(React18 + Nginx) + CI/CD(GitLab CI)
                  - 식품 관리, 제품 관리
                  - 커뮤니티 관리, 컨텐츠 관리
                  - 사용자 관리, 관리자 권한관리`}
              </li>
            </ul>
          </div>
          <div className="tw:border-l-4 tw:border-blue-500 tw:pl-6">
            <h3 className="tw:font-semibold tw:mb-1">
              📋사용자 웹앱 구축 및 유지보수
            </h3>
            <ul className="tw:pl-6 tw:list-disc">
              <li className="tw:whitespace-pre-line">
                {`사용기술: WS(React18 + Nginx) + CI/CD(GitLab CI)
                - 건강정보 기반 식단 리포트
                - 오뚜기 컨텐츠 게시판
                - 유저 게시판
                - SSO 로그인 설계 및 구현`}
              </li>
            </ul>
          </div>
        </div>
        {/* 우측 */}
        <div
          ref={setObserver}
          id="page06_02"
          className={cn(
            'tw:flex tw:flex-col tw:gap-2',
            'tw:bg-yellow-50 tw:p-3',
            'tw:flex-1/2 tw:h-full',
          )}
        >
          <div className="tw:text-xl tw:font-bold">아쉬웠던 점</div>
          <div className="tw:whitespace-pre-line">
            <span>issue 01 - 커스텀 데이터 테이블</span>
            <a className="tw:text-blue-800 tw:font-bold" href="https://github.com/JYK0128/my-workspace/blob/dev/packages/ui/lib/pages/BoardPage.tsx">[예시]</a>
            {`
              원인: 요구사항을 충족하는 데이터 테이블을 구현하기 어려움 
              개선방안: 다양한 기능을 삽입할 수 있는 커스텀 데이터 테이블이 필요
              해결방안: Tanstack Table을 사용하여 정렬/필터링/페이징 기능 구현
            `}
          </div>
        </div>
      </div>
    </div>
  );
}
