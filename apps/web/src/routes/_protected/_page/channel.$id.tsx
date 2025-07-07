import { withMenu } from '#/routes/_protected/-layout/with-menu';
import { useQuery, useTRPC } from '@packages/trpc';
import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/_page/channel/$id')({
  beforeLoad: async ({ context: { trpc, queryClient }, params }) => {
    const data = await queryClient.fetchQuery(trpc.isParticipant.queryOptions({ channelId: params.id }));

    if (!data) {
      throw notFound();
    }
  },
  component: withMenu(RouteComponent),
});

function RouteComponent() {
  const trpc = useTRPC();
  const params = Route.useParams();
  const { data: channel } = useQuery(trpc.getChannel.queryOptions({ channelId: params.id }));

  return (
    <div>
      <div>{channel?.name}</div>
      <div>{channel?.description}</div>
      <div>채팅하자</div>
    </div>
  );
}
