import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useTRPC } from '@packages/trpc';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormController, FormInput, useMessage, useStepModal } from '@packages/ui';
import { useNavigate } from '@tanstack/react-router';
import { PropsWithChildren, useId } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  password: z.string(),
}).default({
  password: '',
});
type FieldValues = z.infer<typeof fields>;

interface Props {
  channelId: string
};
export function ChannelJoin({ channelId }: PropsWithChildren<Props>) {
  const formId = useId();
  const { cancel, confirm } = useStepModal();
  const { message } = useMessage();
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { mutateAsync: joinChannel } = useMutation(trpc.joinChannel.mutationOptions());

  const handleSubmit: SubmitHandler<FieldValues> = (fields, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      case 'submit': {
        confirm(
          joinChannel({ channelId, ...fields })
            .then((ch) => navigate({
              to: '/channel/$id',
              params: ch,
            }))
            .catch(() => message({
              type: 'error',
              description: '비밀번호가 틀렸어요.',
            })),
        );
        return;
      }
      default: {
        return;
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>패스워드 입력</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <FormController
        form={form}
        id={formId}
        onSubmit={handleSubmit}
      >
        <FormInput
          type="password"
          control={form.control}
          name="password"
          label="비밀번호"
          showError
        />
      </FormController>

      <DialogFooter>
        <Button onClick={cancel} variant="ghost">취소</Button>
        <Button type="submit" name="submit" form={formId}>확인</Button>
      </DialogFooter>
    </DialogContent>
  );
}
