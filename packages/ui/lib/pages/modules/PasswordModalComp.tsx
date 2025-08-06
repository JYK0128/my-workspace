import { zodResolver } from '@hookform/resolvers/zod';
import { PropsWithChildren, useId } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FormController } from '#customs/components/FormController.tsx';
import { FormInput } from '#customs/components/FormInput.tsx';
import { useStepModal } from '#customs/hooks/index.ts';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '#shadcn/components/ui/index.ts';

const fields = z.object({
  password: z.string().min(1, '패스워드를 입력해주세요.'),
  confirmPassword: z.string().min(1, '패스워드를 확인해주세요.'),
})
  .superRefine((args, ctx) => {
    if (args.password !== args.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: '패스워드가 일치하지 않습니다.',
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: '패스워드가 일치하지 않습니다.',
      });
    }
  })
  .default({
    password: '',
    confirmPassword: '',
  });
type FieldValues = z.infer<typeof fields>;

export function PasswordModalComp(props: PropsWithChildren) {
  const formId = useId();
  const modal = useStepModal();

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (fields, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      case 'submit': {
        modal.confirm(evt);
        return;
      }
      default: {
        return;
      }
    }
  };

  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>패스워드 찾기</DialogTitle>
        <DialogDescription />
      </DialogHeader>
      <FormController
        id={formId}
        form={form}
        onSubmit={handleSubmit}
      >
        <FormInput
          control={form.control}
          orientation="horizontal"
          type="password"
          name="password"
          label="패스워드"
          labelWidth="150px"
          autoComplete="current-password"
          required
        />
        <FormInput
          control={form.control}
          orientation="horizontal"
          type="password"
          name="confirmPassword"
          label="패스워드 확인"
          labelWidth="150px"
          autoComplete="new-password"
          showError
          required
        />
      </FormController>
      <DialogFooter>
        <Button onClick={modal.cancel}>닫기</Button>
        <Button type="submit" name="submit" form={formId}>확인</Button>
      </DialogFooter>
    </DialogContent>
  );
}
