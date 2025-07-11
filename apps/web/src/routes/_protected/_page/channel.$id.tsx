import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useTRPC } from '@packages/trpc';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cn, FormController, FormRicharea, Skeleton } from '@packages/ui';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { uniqueId } from 'lodash-es';
import { CornerDownRight, Heart, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from 'react-oidc-context';
import { z } from 'zod';

export const Route = createFileRoute('/_protected/_page/channel/$id')({
  beforeLoad: async ({ context: { trpc, queryClient }, params }) => {
    const data = await queryClient.fetchQuery(trpc.isParticipant.queryOptions({ channelId: params.id }));

    if (!data) {
      throw notFound();
    }
  },
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
  const params = Route.useParams();
  const { data: channel } = useQuery(trpc.getChannel.queryOptions({ channelId: params.id }));

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  useEffect(() => {
    if (channel?.id) {
      form.reset(
        { ...fields._def.defaultValue(), channelId: channel.id },
      );
    }
  }, [channel, form]);

  const [messages, setMessages] = useState<(FieldValues & { seq?: number, userId: string, nickname: string })[]>([]);
  const { mutateAsync: sendMessage } = useMutation(trpc.sendMessage.mutationOptions());

  useEffect(() => {
    if (!channel) return;
    const subscription = trpc.receiveMessage.subscriptionOptions({ channelId: channel.id }).subscribe({
      onData: (data) => {
        setMessages((prev) => [...prev, data]);
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel]);

  useEffect(() => {
    if (!channel) return;
    const subscription = trpc.receiveAnswer.subscriptionOptions({ channelId: channel.id }).subscribe({
      onData: (data) => {
        setMessages((old) => {
          const idx = old.findIndex((v) => v.userId === data.userId);
          if (idx === -1 && data.content) {
            console.log('cond 01: ', idx, data.content);
            old.push({
              ...data,
              content: data.content ?? '',
            });
            return [...old];
          }
          else if (idx !== -1 && data.content) {
            if (old[idx].seq !== data.seq) {
              old[idx] = {
                ...old[idx],
                content: [old[idx].content, data.content].join(''),
              };
              return [...old];
            }
            else {
              return old;
            }
          }
          else {
            console.log('cond 03: ', idx, data.content);
            return old;
          }
        });
      },
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [channel, trpc.receiveAnswer]);

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
    <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
      <CardHeader>
        <CardTitle>{channel?.name}</CardTitle>
        <CardDescription>{channel?.description}</CardDescription>
      </CardHeader>
      <CardContent className="tw:overflow-y-auto">
        {messages.map((msg) => (
          <Message
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
  );
}

type MsgProps = {
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
  const { type, nickname } = props;

  return (
    <div
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
  const { type } = props;

  return (
    type === 'system' && (
      <div
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
