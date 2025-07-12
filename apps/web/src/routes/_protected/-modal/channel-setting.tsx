import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useTRPC, type Channel, type ChannelParticipant, type Table } from '@packages/trpc';
import { Button, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormController, FormInput, FormTextarea, useMessage, useStepModal } from '@packages/ui';
import { useRouter } from '@tanstack/react-router';
import { useId, type PropsWithChildren } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  password: z.string(),
  newPassword: z.string(),
  passwordConfirm: z.string(),
})
  .refine((v) => v.password === v.passwordConfirm, {
    path: ['passwordConfirm'],
    message: '패스워드가 동일하지 않아요.',
  })
  .default({
    id: '',
    name: '',
    description: '',
    password: '',
    newPassword: '',
    passwordConfirm: '',
  });

type FieldValues = z.infer<typeof fields>;

interface Props {
  channel: Table<Channel>
  participantInfo: Table<ChannelParticipant>
};
export function ChannelSetting({ channel, participantInfo }: PropsWithChildren<Props>) {
  const formId = useId();
  const { cancel, confirm } = useStepModal();
  const { message } = useMessage();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: {
      ...fields._def.defaultValue(),
      ...channel,
    },
  });

  const trpc = useTRPC();
  const { mutateAsync: updateChannel } = useMutation(trpc.updateChannel.mutationOptions());
  const { mutateAsync: leaveChannel } = useMutation(trpc.leaveChannel.mutationOptions());

  const handleSubmit: SubmitHandler<FieldValues> = (fields, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;

    switch (submitter.name) {
      case 'submit': {
        confirm(
          updateChannel(fields)
            .catch(() => message({
              type: 'error',
              description: '방정보를 갱신하지 못했어요.',
            })),
        );
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>채널 설정</DialogTitle>
        <DialogDescription />
      </DialogHeader>

      <FormController
        form={form}
        id={formId}
        onSubmit={handleSubmit}
      >
        <FormInput
          type="text"
          control={form.control}
          name="name"
          label="제목"
          labelWidth={100}
          showError
          disabled={!participantInfo.is_master}
        />
        <FormTextarea
          control={form.control}
          name="description"
          label="설명"
          labelWidth={100}
          showError
          disabled={!participantInfo.is_master}
        />
        <FormInput
          type="password"
          control={form.control}
          name="password"
          label="비밀번호"
          labelWidth={100}
          placeholder="********"
          autoComplete="current-password"
          required
          showError
          disabled={!participantInfo.is_master}
        />
        <FormInput
          type="password"
          control={form.control}
          name="newPassword"
          label="신규 비밀번호"
          labelWidth={100}
          placeholder="********"
          autoComplete="new-password"
          showError
          disabled={!participantInfo.is_master}
        />
        <FormInput
          type="password"
          control={form.control}
          name="passwordConfirm"
          label="비밀번호 확인"
          labelWidth={100}
          placeholder="********"
          autoComplete="new-password"
          showError
          disabled={!participantInfo.is_master}
        />
      </FormController>

      <DialogFooter>
        <Button
          className="tw:mr-auto"
          onClick={() => {
            leaveChannel({ channelId: channel.id });
            router.history.back();
          }}
        >
          탈퇴
        </Button>
        <Button onClick={cancel} variant="ghost">취소</Button>
        <Button
          type="submit"
          name="submit"
          form={formId}
          disabled={!participantInfo.is_master}
        >
          수정
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
