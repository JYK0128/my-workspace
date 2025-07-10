import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useTRPC } from '@packages/trpc';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, FormController, FormRicharea } from '@packages/ui';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { uniqueId } from 'lodash-es';
import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
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
  const params = Route.useParams();
  const { data: channel } = useQuery(trpc.getChannel.queryOptions({ channelId: params.id }));

  const form = useForm({
    resolver: zodResolver(fields.removeDefault()),
    defaultValues: fields._def.defaultValue(),
  });

  useEffect(() => {
    if (channel?.id) {
      form.reset(
        { ...form.getValues(), channelId: channel.id },
      );
    }
  }, [channel, form]);

  const [messages, setMessages] = useState<(FieldValues & { userId: string })[]>([]);
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

  const handleSubmit: SubmitHandler<FieldValues> = (payload, evt) => {
    const { submitter } = (evt?.nativeEvent ?? {}) as SubmitEvent;
    if (!(submitter instanceof HTMLButtonElement)) return;
    switch (submitter.name) {
      case 'submit': {
        sendMessage(payload);
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
      <CardContent>
        {messages.map((msg) => (
          <div key={uniqueId()}>
            <div>{msg.userId}</div>
            <div>{msg.content}</div>
          </div>
        ),
        )}
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
            className="tw:pr-20"
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
