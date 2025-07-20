import { Cosmax01, Github, Health01, Health02, KB01, KB02, Medilinx01, Medilinx02, Medilinx03, Ottogi01, Ottogi02, Overview01, Profile, Storybook } from '#/assets';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useTRPC } from '@packages/trpc';
import { Button, cn, FormController, FormInput, FormRicharea, useMessage } from '@packages/ui';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

export const Route = createFileRoute('/_public/_page/home')({
  component: RouteComponent,
  staticData: {
    title: 'HOME',
    order: 1,
  },
});

const emailFields = z.object({
  email: z.string().email(),
  title: z.string().min(1),
  content: z.string().min(1),
  files: z.instanceof(File).array(),
}).default({
  email: '',
  title: '',
  content: '',
  files: [],
});
type EmailFieldValues = z.infer<typeof emailFields>;

function RouteComponent() {
  const trpc = useTRPC();
  const { message } = useMessage();

  const emailForm = useForm({
    resolver: zodResolver(emailFields.removeDefault()),
    defaultValues: emailFields._def.defaultValue(),
  });
  const { mutateAsync: sendMail } = useMutation(trpc.sendMail.mutationOptions());

  const formHandlers: {
    email: SubmitHandler<EmailFieldValues>
  } = {
    email: (_, evt) => {
      const formData = new FormData(evt?.target);

      sendMail(formData)
        .then(
          () => message({
            type: 'alert',
            description: '문의가 정상적으로 접수되었습니다.',
          }),
        )
        .catch(
          () => message({
            type: 'error',
            description: '오류가 발생했습니다. 다시 시도바랍니다.',
          }),
        );
    },
  };

  return (
    <div className={cn(
      'tw:size-full tw:overflow-y-auto',
      'tw:snap-y tw:snap-mandatory',
    )}
    >
      {/* 자기소개 */}
      <div
        id="page01"
        className={cn(
          'tw:size-full tw:snap-start',
          'tw:flex tw:justify-evenly tw:items-center tw:flex-wrap',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:basis-sm',
          'tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-5',
        )}
        >
          <img
            src={Profile}
            className={cn(
              'tw:object-center',
              'tw:w-40 tw:h-40 tw:rounded-full',
              'tw:bg-gradient-to-br tw:from-blue-500 tw:to-cyan-600',
            )}
          />
          <div className="tw:text-2xl tw:font-extrabold tw:text-center">
            <div>안녕하세요.</div>
            <div>4년차 개발자, 김진용 입니다.</div>
          </div>
        </div>
        <div className="tw:basis-sm">
          <div className="tw:whitespace-pre-line tw:text-center tw:text-2xl tw:font-extrabold">
            {
              `IT기술로
              다양한 문제를 해결하는 것을 좋아합니다.`
            }
          </div>

          <div className={cn(
            'tw:mt-10',
            'tw:flex tw:justify-center tw:items-center tw:gap-10',
          )}
          >
            <a
              href="https://github.com/JYK0128/my-workspace"
              className="tw:flex tw:items-center tw:gap-5"
            >
              <img src={Github} className="tw:size-4 tw:inline" />
              Github
            </a>
            <a
              href="/storybook"
              className="tw:flex tw:items-center tw:gap-5"
            >
              <img src={Storybook} className="tw:size-4 tw:inline" />
              Storybook
            </a>
          </div>
        </div>
      </div>
      {/* 개인목표 */}
      <div
        id="page02"
        className={cn(
          'tw:size-full tw:snap-start',
          'tw:flex tw:justify-evenly tw:items-center tw:flex-wrap',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:basis-sm',
          'tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-extrabold tw:text-center">
            Goal
          </div>
          <div>기술과 실행을 연결하는 문제해결 아키텍처</div>

          <div className="tw:text-2xl tw:font-extrabold tw:text-center">
            Plan
          </div>
          <ul>
            <li>✔️프로토 타입 제작에 유용한 UI 라이브러리</li>
            <li>✔️효과적인 개발자 경험을 위한 System 프레임워크</li>
            <li>👌효율적인 커뮤니케이션을 위한 데이터/지식 기반 피드백</li>
          </ul>
        </div>

        <div className="tw:basis-sm tw:h-full tw:flex tw:justify-center tw:items-center">
          <img src={Overview01} className="tw:w-200 tw:object-cover" />
          <div className="tw:absolute tw:bottom-20 tw:right-20">
            <Link to="/overview" hash="page01">👉자세히 보기</Link>
          </div>
        </div>

      </div>
      {/* 메디링스 */}
      <div
        id="page03"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-row tw:justify-evenly',
        )}
        >
          <img src={Medilinx01} className="tw:object-cover" />
          <img src={Medilinx02} className="tw:object-cover" />
          <img src={Medilinx03} className="tw:object-cover" />
        </div>
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-col tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-bold">
            메디링스
          </div>
          <div className="tw:text-lg tw:font-bold tw:text-gray-500">
            모바일 건강검진/사후관리 서비스
          </div>
          <ul>
            <li>➡️레거시 시스템 오류 문의 80% 감소</li>
            <li>➡️서비스 오픈 소요기간 80% 감소</li>
          </ul>
          <div className="tw:flex tw:justify-end">
            <Link to="/about" hash="page02">👉자세히 보기</Link>
          </div>
        </div>
      </div>
      {/* KB 금융비서 */}
      <div
        id="page04"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-row tw:justify-evenly',
        )}
        >
          <img src={KB01} className="tw:object-cover" />
          <img src={KB02} className="tw:object-cover" />
        </div>
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-col tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-bold">
            KB 금융비서
          </div>
          <div className="tw:text-lg tw:font-bold tw:text-gray-500">
            모바일 금융 AI챗봇 서비스
          </div>
          <ul>
            <li>➡️관리자 서비스 딜리버리 100% 달성</li>
            <li>➡️모바일 Web App 오류 99.9% 처리</li>
          </ul>
          <div className="tw:flex tw:justify-end">
            <Link to="/about" hash="page03">👉자세히 보기</Link>
          </div>
        </div>
      </div>
      {/* 광주서구청 스마트 돌봄 */}
      <div
        id="page05"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-row tw:justify-evenly',
        )}
        >
          <img src={Health01} className="tw:object-cover" />
          <img src={Health02} className="tw:object-cover" />
        </div>
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-col tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-bold">
            광주서구청 스마트 돌봄
          </div>
          <div className="tw:text-lg tw:font-bold tw:text-gray-500">
            IoT 디바이스 연계 노령층 건강관리 서비스
          </div>
          <ul>
            <li>➡️사용자 / 관리자 서비스 오류 99.9% 처리</li>
            <li>➡️사용자 / 관리자 서비스 딜리버리 100% 달성</li>
          </ul>
          <div className="tw:flex tw:justify-end">
            <Link to="/about" hash="page04">👉자세히 보기</Link>
          </div>
        </div>
      </div>
      {' '}
      {/* 코스맥스 Cos-Chat */}
      <div
        id="page06"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-row tw:justify-evenly',
        )}
        >
          <img src={Cosmax01} className="tw:object-cover" />
        </div>
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-col tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-bold">
            코스맥스 Cos-Chat
          </div>
          <div className="tw:text-lg tw:font-bold tw:text-gray-500">
            MS TEAMS 사내 AI챗봇 플러그인
          </div>
          <ul>
            <li>➡️관리자 서비스 딜리버리 100% 달성</li>
          </ul>
          <div className="tw:flex tw:justify-end">
            <Link to="/about" hash="page05">👉자세히 보기</Link>
          </div>
        </div>
      </div>
      {' '}
      {/* 오뚜기 O-balance */}
      <div
        id="page07"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-row tw:justify-evenly',
        )}
        >
          <img src={Ottogi01} className="tw:object-cover" />
          <img src={Ottogi02} className="tw:object-cover" />
        </div>
        <div className={cn(
          'tw:h-1/2 tw:px-20 tw:py-10',
          'tw:flex tw:flex-col tw:gap-5',
        )}
        >
          <div className="tw:text-2xl tw:font-bold">
            오뚜기 O-balance
          </div>
          <div className="tw:text-lg tw:font-bold tw:text-gray-500">
            개인 맞춤형 식단 추천 서비스
          </div>
          <ul>
            <li>➡️사용자 서비스 오류 99.9% 처리</li>
            <li>➡️관리자 서비스 딜리버리 100% 달성</li>
          </ul>
          <div className="tw:flex tw:justify-end">
            <Link to="/about" hash="page06">👉자세히 보기</Link>
          </div>
        </div>
      </div>

      {/* 기술 스택 */}
      <div
        id="page07"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:flex tw:justify-center tw:items-center',
          'tw:sticky tw:top-0 tw:bg-background',
        )}
      >
        <div className={cn(
          'tw:w-full',
          'tw:flex tw:flex-row tw:justify-evenly tw:items-start',
        )}
        >
          <div className="tw:text-center">
            <div className="tw:text-2xl tw:font-extrabold">Frontend</div>
            <ul>
              <li>React</li>
              <li>Vue</li>
              <li>Tanstack Skills</li>
            </ul>
          </div>
          <div className="tw:text-center">
            <div className="tw:text-2xl tw:font-extrabold">Backend</div>
            <ul>
              <li>Express</li>
              <li>NestJs</li>
              <li>tRPC</li>
            </ul>
          </div>
          <div className="tw:text-center">
            <div className="tw:text-2xl tw:font-extrabold">Others</div>
            <ul>
              <li>Python</li>
              <li>Nginx</li>
              <li>K8S</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 연락 */}
      <div
        id="page08"
        className={cn(
          'tw:size-full tw:shrink-0 tw:bg-background tw:snap-start',
          'tw:sticky tw:top-0 tw:bg-background tw:px-20 tw:py-10',
        )}
      >
        <div className="tw:size-full tw:grid tw:grid-rows-[auto_1fr] tw:gap-5">
          <h2 className="tw:font-extrabold">이메일 문의</h2>
          <FormController
            form={emailForm}
            onSubmit={formHandlers['email']}
            className="tw:grid tw:grid-rows-[auto_auto_1fr_auto] tw:gap-5"
          >
            <FormInput
              control={emailForm.control}
              label="연락처"
              labelWidth={100}
              orientation="vertical"
              name="email"
            />
            <FormInput
              control={emailForm.control}
              label="제목"
              labelWidth={100}
              orientation="vertical"
              name="title"
            />
            <FormRicharea
              control={emailForm.control}
              label="내용"
              labelWidth={100}
              orientation="vertical"
              name="content"
            />
            <Button type="submit">보내기</Button>
          </FormController>
        </div>
      </div>
    </div>
  );
}
