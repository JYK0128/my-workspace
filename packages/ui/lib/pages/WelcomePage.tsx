import { FormController, FormInput, MuteLayout } from '#customs/components/index.ts';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '#shadcn/components/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { PropsWithAction, useId, useState } from 'react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  username: z.string()
    .email('이메일을 입력해주세요.'),
  password: z.string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 해요.' })
    .regex(/[a-zA-Z]/, { message: '비밀번호에는 영문이 포함되어야 해요.' })
    .regex(/\d/, { message: '비밀번호에는 숫자가 포함되어야 해요.' })
    .regex(/[@$!%*?&]/, { message: '비밀번호에는 특수문자가 포함되어야 해요.' }),
  passwordConfirm: z.string(),
})
  .refine((v) => v.password === v.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '패스워드가 동일하지 않아요.',
  })
  .default({
    username: '',
    password: '',
    passwordConfirm: '',
  });
type FieldValues = z.infer<typeof fields>;

type ActionMap = {
  PREV: never
  NEXT: never
  MOVE: number
  FINISH_SURVEY: never
  CANCEL_SURVEY: never
  INCOMPLETE_FORM: never
  COMPLETE_FORM: never
  USER_REGISTER: FieldValues
  RESEND_EMAIL: FieldValues
  GOTO_LOGIN: never
};

export function WelcomePage(props: PropsWithAction<ActionMap>) {
  const formId = useId();
  const [api, setApi] = useState<CarouselApi>();
  const [prevHold, setPrevHold] = useState(false);
  const [nextHold, setNextHold] = useState(false);

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;
    switch (submitter.name) {
      case 'user-register':
        actionResolver({ action: 'USER_REGISTER', payload })();
        actionResolver({ action: 'NEXT' })();
        return;
      case 'resend-email':
        actionResolver({ action: 'RESEND_EMAIL', payload })();
        return;
      default:
        throw new Error('unexpected error');
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    const priority = ['username', 'password', 'passwordConfirm'] satisfies Array<keyof FieldValues>;
    for (const key of priority) {
      const target = errors[key];
      if (target) {
        const error = new Error(target.message);
        throw error;
      }
    }

    throw new Error('unexpected error');
  };

  const actionResolver: ActionResolver<ActionMap> = ({ action, payload }) => {
    switch (action) {
      case 'PREV':
        return () => {
          props['onPrev'](payload);
          if (api?.canScrollPrev()) api.scrollPrev();
        };
      case 'NEXT':
        return () => {
          props['onNext'](payload);
          if (api?.canScrollNext()) api.scrollNext();
        };
      case 'MOVE':
        return () => {
          props['onMove'](payload);
          api?.scrollTo(payload);
        };
      case 'FINISH_SURVEY':
        return () => {
          props['onFinishSurvey'](payload);
          setPrevHold(true);
        };
      case 'INCOMPLETE_FORM':
        return () => {
          props['onIncompleteForm'](payload);
          if (!form.formState.isValid) setNextHold(true);
        };
      case 'CANCEL_SURVEY':
        return () => {
          props['onCancelSurvey'](payload);
          setPrevHold(false);
        };
      case 'COMPLETE_FORM':
        return () => {
          props['onCompleteForm'](payload);
          setNextHold(false);
        };
      case 'USER_REGISTER':
        return () => {
          props['onUserRegister'](payload);
        };
      case 'RESEND_EMAIL':
        return () => {
          props['onResendEmail'](payload);
        };
      case 'GOTO_LOGIN':
        return () => {
          props['onGotoLogin']();
        };
      default:
        throw new Error('unexpected error');
    }
  };

  return (
    <MuteLayout>
      <div className="tw:w-2/3 tw:h-2/3">
        <Carousel
          setApi={setApi}
          onKeyDownCapture={() => {}}
          className="tw:size-full tw:[&>div]:size-full"
        >
          <CarouselContent>
            <CarouselItem>
              <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
                <CardHeader>
                  <CardTitle>환영합니다.</CardTitle>
                  <CardDescription />
                </CardHeader>
                <CardContent>
                  <div>서비스 관리/운영을 위해</div>
                  <div>프로젝트 초기설정을 진행할게요.</div>
                </CardContent>
                <CardFooter className="tw:flex tw:justify-end tw:gap-1">
                  <Button
                    onClick={actionResolver({ action: 'NEXT' })}
                  >
                    다음으로
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
            <CarouselItem>
              <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
                <CardHeader>
                  <CardTitle>첫 사용자 계정을 만들어주세요.</CardTitle>
                  <CardDescription />
                </CardHeader>

                <CardContent>
                  <FormController
                    form={form}
                    id={formId}
                    onSubmit={handleSubmit}
                    onError={handleError}
                    className="tw:flex tw:flex-col tw:gap-2"
                  >
                    <FormInput
                      control={form.control}
                      labelWidth="150px"
                      label="이메일"
                      name="username"
                      autoComplete="username"
                      required
                    />
                    <FormInput
                      control={form.control}
                      labelWidth="150px"
                      label="신규 패스워드"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      required
                    />
                    <FormInput
                      control={form.control}
                      labelWidth="150px"
                      label="패스워드 확인"
                      type="password"
                      name="passwordConfirm"
                      autoComplete="new-password"
                      required
                    />
                  </FormController>
                </CardContent>
                <CardFooter className="tw:flex tw:justify-end tw:gap-1">
                  <Button
                    type="submit"
                    form={formId}
                    name="user-register"
                  >
                    다음으로
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
            <CarouselItem>
              <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
                <CardHeader>
                  <CardTitle>프로젝트 초기설정이 완료되었어요.</CardTitle>
                  <CardDescription />
                </CardHeader>
                <CardContent>
                  <div>사용자 인증을 위해</div>
                  <div>가입하신 계정으로 인증메일을 보냈어요.</div>
                  <div>인증 후 로그인 페이지로 이동하세요.</div>
                </CardContent>
                <CardFooter className="tw:flex tw:justify-end tw:gap-1">
                  <Button
                    type="submit"
                    form={formId}
                    name="resend-email"
                  >
                    이메일 재전송
                  </Button>
                  <Button
                    onClick={actionResolver({ action: 'GOTO_LOGIN' })}
                  >
                    로그인 이동
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious
            disabled={prevHold || !api?.canScrollPrev()}
            onClick={actionResolver({ action: 'PREV' })}
          />
          <CarouselNext
            disabled={nextHold || !api?.canScrollNext()}
            onClick={actionResolver({ action: 'NEXT' })}
          />
        </Carousel>
      </div>
    </MuteLayout>
  );
}
