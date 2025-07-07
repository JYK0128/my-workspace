import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useTRPC } from '@packages/trpc';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormController, FormInput, useMessage, useStepModal } from '@packages/ui';
import { useId } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  name: z.string().min(1),
  description: z.string(),
  password: z.string(),
  passwordConfirm: z.string(),
})
  .refine((v) => v.password === v.passwordConfirm, {
    message: 'invalid password',
    path: ['passwordConfirm'],
  })
  .default({
    name: '',
    description: '',
    password: '',
    passwordConfirm: '',
  });
type FieldValues = z.infer<typeof fields>;

export function ChannelCreate() {
  const formId = useId();
  const trpc = useTRPC();
  const { message } = useMessage();
  const { cancel, confirm } = useStepModal();
  const { mutateAsync: createChannel } = useMutation(trpc.createChannel.mutationOptions());

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (fields, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      case 'submit':
        confirm(
          createChannel(fields)
            .then(() => message({
              type: 'alert',
              description: '방을 생성했어요',
            }))
            .catch(() => message({
              type: 'error',
              description: '방을 생성하지 못했어요',
            })),
        );
        return;
      default:
        throw new Error('unexpected error');
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>채널 생성</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <FormController
        form={form}
        id={formId}
        onSubmit={handleSubmit}
      >
        <FormInput
          control={form.control}
          name="name"
          label="제목"
          labelWidth="120px"
          showError
        />
        <FormInput
          control={form.control}
          name="description"
          label="설명"
          labelWidth="120px"
          showError
        />
        <FormInput
          type="password"
          control={form.control}
          name="password"
          label="패스워드"
          labelWidth="120px"
          showError
        />
        <FormInput
          type="password"
          control={form.control}
          name="passwordConfirm"
          label="패스워드 확인"
          labelWidth="120px"
          showError
        />
      </FormController>

      <DialogFooter>
        <Button onClick={cancel} variant="ghost">취소</Button>
        <Button type="submit" name="submit" form={formId}>저장</Button>
      </DialogFooter>
    </DialogContent>
  );
}
