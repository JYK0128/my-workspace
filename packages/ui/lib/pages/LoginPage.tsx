import { FormController, FormInput, MuteLayout, StepModal } from '#customs/components/index.ts';
import { useMessage } from '#customs/hooks/index.ts';
import { PasswordModalComp } from '#pages/modules/PasswordModalComp.tsx';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Form } from '#shadcn/components/ui/index.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';


const fields = z.object({
  email: z.string().email(),
  password: z.string().min(1),
}).default({
  email: '',
  password: '',
});
type FieldValues = z.infer<typeof fields>;


export function LoginPage() {
  const { message } = useMessage();
  const formId = useId();
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (_payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    if (submitter.name === 'login') {
      message({
        type: 'alert',
        description: '로그인 예시입니다.',
      }).then((v) => console.log(v))
        .catch((v) => console.log(v));
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    console.log(errors);
  };

  return (
    <MuteLayout>
      <Card className="tw:size-2/3 tw:grid tw:grid-rows-[auto_1fr_auto]">
        <Form
          {...form}
        >
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>안녕하세요</CardDescription>
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
                orientation="horizontal"
                type="email"
                name="email"
                label="이메일"
                labelWidth="100px"
                placeholder="example@example.com"
                autoComplete="username"
                required
              />

              <FormInput
                control={form.control}
                orientation="horizontal"
                type="password"
                name="password"
                label="비밀번호"
                labelWidth="100px"
                placeholder="********"
                autoComplete="current-password"
                required
              />
            </FormController>
          </CardContent>

          <CardFooter className="tw:justify-between">
            <StepModal
              closable={[false]}
              render={[<PasswordModalComp key="modal" />]}
            >
              <Button>비밀번호 찾기</Button>
            </StepModal>
            <Button type="submit" form={formId} name="login">
              로그인
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </MuteLayout>
  );
}
