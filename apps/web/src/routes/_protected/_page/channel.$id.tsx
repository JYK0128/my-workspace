import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { ChannelParticipant } from '#/routes/_protected/-modal/channel-participant';
import { ChannelSetting } from '#/routes/_protected/-modal/channel-setting';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useTRPC } from '@packages/trpc';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, FormController, FormRicharea, Skeleton, StepModal, useCallbackRef } from '@packages/ui';
import { createFileRoute, notFound, useRouter } from '@tanstack/react-router';
import { uniqueId } from 'lodash-es';
import { CornerDownRight, Heart, MoveLeft, Send, Settings, UserSearch } from 'lucide-react';
import { useEffect, useState, type Ref } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from 'react-oidc-context';
import { z } from 'zod';

export const Route = createFileRoute('/_protected/_page/channel/$id')({
  beforeLoad: async ({ context: { trpc, queryClient }, params }) => {
    const { id: channelId } = params;
    const participantInfo = await queryClient.fetchQuery(trpc.getParticipantInfo.queryOptions({ channelId }));
    if (!participantInfo) {
      throw notFound();
    }

    return { participantInfo };
  },
  loader: ({ context: { participantInfo } }) => ({ participantInfo }),
  component: withMenu(RouteComponent),
});

const fields = z.object({
  channelId: z.string().min(1),
  content: z.string().min(1),
}).default({
  channelId: '',
  content: '',
});
type FieldValues = z.infer<typeof fields>;

function RouteComponent() {
  const trpc = useTRPC();
  const { user } = useAuth();
  const { id: channelId } = Route.useParams();
  const { data: channel, refetch } = useQuery(trpc.getChannel.queryOptions({ channelId }));
  const router = useRouter();
  const { participantInfo } = Route.useLoaderData();

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: {
      ...fields._def.defaultValue(),
      channelId,
    },
  });

  const [messages, setMessages] = useState<(FieldValues & { seq?: number, userId: string, nickname: string })[]>([]);
  const { mutateAsync: sendMessage } = useMutation(trpc.sendMessage.mutationOptions());
  const [lastMsgRef, setLastMsgRef] = useCallbackRef<HTMLDivElement>();

  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lastMsgRef, messages]);

  useEffect(() => {
    if (!channelId) return;
    const subscription = trpc.receiveMessage.subscriptionOptions({ channelId }).subscribe({
      onData: (data) => {
        setMessages((prev) => [...prev, data]);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [channelId, trpc.receiveMessage]);

  useEffect(() => {
    if (!channelId) return;
    const subscription = trpc.receiveAnswer.subscriptionOptions({ channelId }).subscribe({
      onData: (data) => {
        setMessages((messages) => {
          const idx = messages.findIndex((v) => v.userId === data.userId);
          if (idx < 0 && data.content) {
            messages.push({
              ...data,
              content: data.content,
            });
            return [...messages];
          }
          else if (idx >= 0 && data.content) {
            if (messages[idx].seq !== data.seq) {
              messages[idx] = {
                ...data,
                content: [messages[idx].content, data.content].join(''),
              };
              return [...messages];
            }
            else {
              return messages;
            }
          }
          else {
            return messages;
          }
        });
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [channelId, trpc.receiveAnswer]);

  const handleSubmit: SubmitHandler<FieldValues> = (payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;
    switch (submitter.name) {
      case 'submit': {
        sendMessage(payload);
        form.reset();
        return;
      }
      default: {
        throw new Error('unexpected error');
      }
    }
  };

  return (
    <div className="tw:size-full tw:grid tw:grid-rows-[auto_1fr]">
      <div className="tw:flex tw:justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.history.back()}
        >
          <MoveLeft />
        </Button>
        <div>
          {/* 유저 */}
          {channel && (
            <StepModal
              callback={refetch}
              closable={true}
              render={[
                <ChannelParticipant key="setting" {...{ channel }} />,
              ]}
            >
              <Button
                variant="ghost"
                size="icon"
              >
                <UserSearch />
              </Button>
            </StepModal>
          )}
          {/* 설정 */}
          {channel && (
            <StepModal
              callback={refetch}
              render={[
                <ChannelSetting key="setting" {...{ channel, participantInfo }} />,
              ]}
            >
              <Button
                variant="ghost"
                size="icon"
              >
                <Settings />
              </Button>
            </StepModal>
          )}
        </div>
      </div>
      <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
        <CardHeader>
          <CardTitle>{channel?.name}</CardTitle>
          <CardDescription>{channel?.description}</CardDescription>
        </CardHeader>
        <CardContent className="tw:overflow-y-auto">
          {messages.map((msg, idx, list) => (
            <Message
              ref={(node) => {
                if (idx === list.length - 1) setLastMsgRef(node);
              }}
              key={uniqueId()}
              {...{
                type: msg.userId === user?.profile.sub ? 'sent' : 'received',
                nickname: msg.nickname,
                message: msg.content,
                createdAt: new Date(),
              }}
            />
          ))}
        </CardContent>
        <CardFooter>
          <FormController
            form={form}
            onSubmit={handleSubmit}
            onError={(err) => console.error(err)}
            className="tw:relative tw:flex tw:justify-end tw:items-center tw:size-full"
          >
            <FormRicharea
              name="content"
              control={form.control}
              orientation="horizontal"
              className="tw:pr-20 tw:h-25"
              size="full"
              onKeyDown={(e) => {
                if (!(e.altKey || e.shiftKey) && e.key === 'Enter') {
                  e.preventDefault();
                  const form = e.currentTarget.closest('form');
                  const submitter = form?.querySelector('button[name="submit"]');
                  if (submitter instanceof HTMLButtonElement) {
                    e.currentTarget.closest('form')?.requestSubmit(submitter);
                  }
                }
              }}
            />
            <Button
              type="submit"
              name="submit"
              className="tw:absolute tw:right-5"
            >
              <Send />
            </Button>
          </FormController>
        </CardFooter>
      </Card>
    </div>
  );
}

type MsgProps = {
  ref?: Ref<HTMLDivElement>
  type: 'system' | 'sent' | 'receiving' | 'received'
  nickname: string
  message: string
  createdAt: Date
};

function Message(props: MsgProps) {
  switch (props.type) {
    case 'system':
      return <SystemMessage {...props} />;
    case 'sent':
    case 'receiving':
    case 'received':
      return <UserMessage {...props} />;
  }
}

/** 유저 메시지 */
function UserMessage(props: MsgProps) {
  const { type, nickname, ref } = props;

  return (
    <div
      ref={ref}
      className={cn(
        'tw:group',
        'tw:flex tw:gap-1 tw:w-full tw:my-2 tw:max-h-none',
        {
          sent: 'tw:self-end tw:flex-row-reverse',
          receiving: 'tw:self-start tw:flex-row',
          received: 'tw:self-start tw:flex-row',
          system: '',
        }[type],
      )}
    >
      {/* 아바타 영역 */}
      {type === 'receiving'
        ? (
          <Skeleton
            className={cn(
              'tw:size-10',
              'tw:border tw:border-solid tw:border-gray-300 tw:rounded-full!',
            )}
          />
        )
        : (
          <div
            className={cn(
              'tw:size-10',
              'tw:border tw:border-solid tw:border-gray-300 tw:rounded-full',
            )}
          />
        )}

      {/* 메시지 */}
      <div
        className={cn(
          'tw:text-sm',
          'tw:w-fit tw:max-w-[60%] tw:px-5 tw:py-2',
          'tw:border tw:border-solid tw:border-gray-300 tw:rounded-lg',
          {
            sent: 'tw:bg-yellow-200',
            receiving: 'tw:bg-white tw:w-[60%]',
            received: 'tw:bg-white',
            system: '',
          }[type],
        )}
      >
        <div className="tw:font-bold">{nickname}</div>
        {type !== 'receiving'
          ? (
            props.message
          )
          : (
            <>
              <Skeleton className="tw:h-4 tw:w-full tw:mb-2" />
              <Skeleton className="tw:h-4 tw:w-[80%] tw:mb-2" />
              <Skeleton className="tw:h-4 tw:w-[80%] tw:mb-2" />
            </>
          )}
      </div>

      {/* 시간 */}
      {type !== 'receiving' && (
        <div
          className={cn(
            'tw:text-xs',
            'tw:block tw:group-hover:hidden',
            'tw:self-end',
          )}
        >
          {props.createdAt.toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}
      {/* 메뉴 */}
      {type !== 'receiving' && (
        <div
          className={cn(
            'tw:text-xs',
            'tw:hidden tw:group-hover:block',
            'tw:self-end',
          )}
        >
          <Button size="icon" variant="outline">
            <CornerDownRight />
          </Button>
          <Button size="icon" variant="outline">
            <Heart />
          </Button>
        </div>
      )}
    </div>
  );
}

/** 시스템 메시지 */
function SystemMessage(props: MsgProps) {
  const { type, ref } = props;

  return (
    type === 'system' && (
      <div
        ref={ref}
        className={cn(
          'tw:self-center',
          'tw:w-fit tw:max-w-[60%] tw:px-5 tw:py-2',
          'tw:bg-gray-600',
          'tw:text-white tw:text-xs',
          'tw:rounded-lg tw:border tw:border-solid tw:border-gray-300',
        )}
      >
        {props.message}
      </div>
    )
  );
}
