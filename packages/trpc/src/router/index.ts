import { mergeRouters } from '#core/trpc.ts';
import { appRouter } from '#router/app.ts';
import { authRouter } from '#router/auth.ts';
import { channelRouter } from '#router/channel.ts';
import { contactRouter } from '#router/contact.ts';


export const MainRouter = mergeRouters(
  appRouter,
  authRouter,
  channelRouter,
  contactRouter,
);

export type MainRouter = typeof MainRouter;
