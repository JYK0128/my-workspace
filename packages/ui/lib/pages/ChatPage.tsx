import { FormController, FormRicharea, SidebarLayout } from '#customs/components/index.ts';
import { useCallbackRef } from '#customs/hooks/index.ts';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Skeleton } from '#shadcn/components/ui/index.ts';
import { cn } from '#shadcn/lib/utils.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import { CornerDownRight, Heart, Send } from 'lucide-react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

const fields = z.object({
  question: z.string().min(1),
}).default({
  question: '',
});
type FieldValues = z.infer<typeof fields>;

export function ChatPage() {
  const [submitRef, setSubmitRef] = useCallbackRef<HTMLButtonElement>();
  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  const handleSubmit: SubmitHandler<FieldValues> = (_payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;
    switch (submitter.name) {
      case 'submit':
        form.reset();
        return;
      default:
        throw new Error('unexpected error');
    }
  };

  const handleError: SubmitErrorHandler<FieldValues> = (errors) => {
    const message = Object.values(errors).at(0)?.message ?? '';
    throw new Error(message);
  };


  return (
    <SidebarLayout>
      <Card className="tw:size-full tw:grid tw:grid-rows-[auto_1fr_auto]">
        <CardHeader>
          <CardTitle>채팅방 01</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent className="tw:scroll">
          <div className="tw:flex tw:flex-col tw:gap-2">
            <Message
              {...{
                type: 'system',
                message: 'start',
                createdAt: new Date(),
              }}
            />

            {/* 내 메시지 */}
            <Message
              {...{
                type: 'sent',
                message: 'mina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina himina hi',
                createdAt: new Date(),
              }}
            />

            {/* 상대방 메시지 */}
            <Message
              {...{
                type: 'received',
                message: 'naniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga sukinaniga suki',
                createdAt: new Date(),
              }}
            />

            <Message
              {...{
                type: 'receiving',
                message: '',
                createdAt: new Date(),
              }}
            />
          </div>
        </CardContent>
        <CardFooter className="tw:flex-col">
          <FormController
            form={form}
            onSubmit={handleSubmit}
            onError={handleError}
            className="tw:relative tw:flex tw:justify-end tw:items-center tw:size-full"
          >
            <FormRicharea
              name="question"
              control={form.control}
              orientation="horizontal"
              className="tw:pr-20"
              size="full"
              onKeyDown={(e) => {
                if (!(e.altKey || e.shiftKey) && e.key === 'Enter') {
                  e.preventDefault();
                  submitRef.current?.click();
                }
              }}
            />
            <Button
              ref={setSubmitRef}
              type="submit"
              name="submit"
              className="tw:absolute tw:right-5 tw:bottom-3"
            >
              <Send />
            </Button>
          </FormController>
        </CardFooter>
      </Card>
    </SidebarLayout>
  );
}

type Props = {
  type: 'system' | 'sent' | 'received'
  message: string
  createdAt: Date
} |
{
  type: 'receiving'
};

function Message(props: Props) {
  switch (props.type) {
    case 'system':
      return <SystemMessage {...props} />;
    case 'sent':
    case 'receiving':
    case 'received':
      return <UserMessage {...props} />;
  }
}

/** 시스템 메시지 */
function SystemMessage(props: Props) {
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

/** 유저 메시지 */
function UserMessage(props: Props) {
  const { type } = props;
  return (
    <div
      className={cn(
        'tw:group',
        'tw:flex tw:gap-1 tw:w-full',
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
