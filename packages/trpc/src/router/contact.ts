import { Readable } from 'stream';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { DB } from '#core/db.js';
import { withInsert, withUpdate } from '#core/kysely.audit.helpers.ts';
import { buildOrderClause, buildPagination, buildWhereFilterClause } from '#core/kysely.ts';
import { CursorRequest } from '#core/kysely.zod.helpers.ts';
import { mailer } from '#core/mailer.ts';
import { publicProcedure, router } from '#core/trpc.ts';

export const contactRouter = router({
  sendMail: publicProcedure
    .input(zfd.formData({
      email: zfd.text(z.string().email()),
      title: zfd.text(z.string().min(1)),
      content: zfd.text(z.string().min(1)),
      files: zfd.repeatableOfType(zfd.file(z.instanceof(File).optional()))
        .transform((data) => data.filter((v) => v?.size)),
    }))
    .mutation(async ({ ctx: { db }, input }) => {
      return mailer.sendMail({
        replyTo: input.email,
        to: 'wlsyong90@gmail.com',
        subject: input.title,
        html: input.content,
        attachments: input.files.filter((v) => !!v).map((file) => ({
          filename: file.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: Readable.fromWeb(file.stream() as any),
        })),
      });
    }),

  getComments: publicProcedure
    .input(CursorRequest<DB, 'guestbook'>())
    .query(async ({ ctx: { db }, input }) => {
      const { cursor, orders, filters } = input;

      const sign = cursor.index !== -1 && orders?.find((v) => v.field === 'id')?.sort === 'desc' ? '<' : '>';
      return db.transaction().execute(async (trx) => {
        const content = await trx
          .selectFrom('guestbook')
          .selectAll()
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('deleted_at', 'is', null),
            eb('id', sign, `${cursor.index}`),
          ]))
          .$call((qb) => buildOrderClause(qb, orders))
          .limit(cursor.size)
          .execute();

        const page = await trx
          .selectFrom('guestbook')
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('deleted_at', 'is', null),
          ]))
          .select(({ eb }) => buildPagination(eb, { content, orders, info: cursor }))
          .executeTakeFirstOrThrow();

        return { ...page.data, content };
      });
    }),
  postComment: publicProcedure
    .input(z.object({
      nickname: z.string().min(1),
      comment: z.string().min(1),
    }))
    .mutation(async ({ ctx: { db }, input }) => {
      return db
        .insertInto('guestbook')
        .values(withInsert(input))
        .returningAll()
        .executeTakeFirstOrThrow();
    }),

  editComment: publicProcedure
    .input(z.object({
      id: z.string(),
      nickname: z.string().min(1),
      comment: z.string().min(1),
    }))
    .mutation(async ({ ctx: { db }, input }) => {
      return db
        .updateTable('guestbook')
        .set(withUpdate(input))
        .where('id', '=', input.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    }),

  deleteComment: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx: { db }, input }) => {
      return db
        .deleteFrom('guestbook')
        .where('id', '=', input.id)
        .returningAll()
        .executeTakeFirstOrThrow();
    }),
});
