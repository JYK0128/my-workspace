import { AppUser } from '#core/db.js';
import { loggingWith, withInsert, withUpdate } from '#core/kysely.ts';
import { protectedProcedure, router } from '#core/trpc.ts';
import { Table } from '#core/types.js';


export const authRouter = router({
  login: protectedProcedure
    .meta({
      description: `SSO 로그인 완료 즉시 호출한다.`,
    })
    .mutation(({ ctx: { user } }) => {
      const values = {
        email: user.email,
        nickname: user.nickname,
        last_login_at: new Date(),
      } satisfies Partial<Table<AppUser>>;

      return loggingWith(user, 'login', (db) => db
        .insertInto('app_user')
        .values(withInsert({ id: user.instanceId, ...values }))
        .onConflict((oc) => oc
          .column('id')
          .doUpdateSet(withUpdate({ ...values })))
        .returningAll()
        .executeTakeFirstOrThrow(),
      );
    }),
  logout: protectedProcedure
    .meta({
      description: `SSO 로그아웃 완료 즉시 호출한다.`,
    })
    .mutation(({ ctx: { user } }) => {
      const values: Partial<Table<AppUser>> = {
        last_logout_at: new Date(),
      };

      return loggingWith(user, 'logout', (db) => db
        .insertInto('app_user')
        .values(withInsert({ id: user.instanceId, ...values }))
        .onConflict((oc) => oc
          .column('id')
          .doUpdateSet(withUpdate({ ...values })))
        .returningAll()
        .executeTakeFirstOrThrow(),
      );
    }),
});
