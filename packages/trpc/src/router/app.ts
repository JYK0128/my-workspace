import { publicProcedure, router } from '#core/trpc.ts';


export const appRouter = router({
  routers: publicProcedure
    .meta({
      description: '모든 라우팅 정보를 가져온다.',
    })
    .query(({ ctx: { db } }) => {
      return db.selectFrom('app_router')
        .where('deleted_at', 'is', null)
        .selectAll()
        .execute();
    }),
});
