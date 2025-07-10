import { DB } from '#core/db.js';
import { emitter, EmitterMap, on } from '#core/emitter.ts';
import { buildGroupClause, buildOrderClause, buildPagination, buildSelectAggregateClause, buildSelectGroupClause, buildWhereFilterClause, loggingWith, withDelete, withInsert, withUpdate } from '#core/kysely.ts';
import { AggRequest, CursorRequest, PageRequest } from '#core/kysely.zod.helpers.ts';
import { protectedProcedure, publicProcedure, router } from '#core/trpc.ts';
import { MAX_DATE } from '@packages/utils';
import bcrypt from 'bcryptjs';
import { sql } from 'kysely';
import OpenAI from 'openai';
import { z } from 'zod';

const API = {
  GOOGLE: {
    apiKey: process.env.APP_GOOGLE_KEY,
    baseURL: process.env.APP_GOOGLE_API,
  },
  OPEN_ROUTER: {
    apiKey: process.env.APP_OPEN_ROUTER_KEY,
    baseURL: process.env.APP_OPEN_ROUTER_API,
  },
};

/**
 * OPEN API 메시지 정의
 * 1) role
 * - system(응답스타일 정의) / user(질문) / assistant(답변)
 * - function(단일 함수 결과) / tool(복수 함수 결과) / developer(함수 정의)
 */
const openai = new OpenAI(API['GOOGLE']);

export const channelRouter = router({
  // 채널 목록
  getChannels: protectedProcedure
    .input(z.object({

    }))
    .query(({ ctx: { user, db }, input }) => {
      return db
        .selectFrom('channel')
        .where((eb) => eb.and([
          eb('deleted_at', 'is', null),
        ]))
        .selectAll()
        .execute();
    }),

  test: publicProcedure
    .query(() => {
      return '';
    }),

  // 채널 통계
  getChannelSummary: publicProcedure
    .input(AggRequest<DB, 'channel'>())
    .query(({ ctx: { user, db }, input }) => {
      const { groups, having, filters, fns } = input;

      return db
        .selectFrom('channel')
        .where(({ eb }) => eb.and([
          buildWhereFilterClause(eb, filters),
          eb('deleted_at', 'is', null),
        ]))
        .select((eb) => ([
          ...buildSelectAggregateClause(eb, fns),
          ...buildSelectGroupClause(eb, groups),
        ]))
        .$call((qb) => buildGroupClause(qb, groups, having))
        .execute();
    }),

  // 채널 페이지(커서)
  getChannelCursor: publicProcedure
    .input(CursorRequest<DB, 'channel' | 'channel_participant'>())
    .query(({ ctx: { user, db }, input }) => {
      const { cursor, orders, filters } = input;

      const sign = cursor.index !== -1 && orders?.find((v) => v.default)?.sort === 'desc' ? '<' : '>';
      return db.transaction().execute(async (trx) => {
        const content = await trx
          .selectFrom('channel')
          .leftJoin('channel_participant', 'channel_participant.channel_id', 'channel.id')
          .selectAll('channel')
          .select((eb) => ([
            eb.fn.count('channel_participant.id').as('count'),
            sql<boolean>`channel.password_encrypted <> ''`.as('is_secret'),
          ]))
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('channel.deleted_at', 'is', null),
            eb('channel.id', sign, `${cursor.index}`),
          ]))
          .groupBy('channel.id')
          .$call((qb) => buildOrderClause(qb, orders))
          .limit(cursor.size)
          .execute();

        const page = await trx
          .selectFrom('channel')
          .leftJoin('channel_participant', 'channel_participant.channel_id', 'channel.id')
          .select(({ eb }) => buildPagination(eb, { content, orders, info: cursor }))
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('channel.deleted_at', 'is', null),
          ]))
          .executeTakeFirst();

        return { ...page?.data, content };
      });
    }),

  // 채널 페이지(페이징)
  getChannelPage: publicProcedure
    .input(PageRequest<DB, 'channel'>())
    .query(({ ctx: { user, db }, input }) => {
      const { page, orders, filters } = input;

      return db.transaction().execute(async (trx) => {
        const content = await trx
          .selectFrom('channel')
          .selectAll()
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('deleted_at', 'is', null),
          ]))
          .$call((qb) => buildOrderClause(qb, orders))
          .offset((page.index) * page.size)
          .limit(page.size)
          .execute();

        const pager = await trx
          .selectFrom('channel')
          .where(({ eb }) => eb.and([
            buildWhereFilterClause(eb, filters),
            eb('deleted_at', 'is', null),
          ]))
          .select(({ eb }) => buildPagination(eb, { content, orders, info: page }))
          .executeTakeFirstOrThrow();

        return { ...pager.data, content };
      });
    }),

  // 채널 상세
  getChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .query(({ ctx: { user, db }, input }) => {
      return db
        .selectFrom('channel')
        .where('id', '=', input.channelId)
        .selectAll()
        .executeTakeFirstOrThrow();
    }),

  // 채널 생성
  createChannel: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string(),
      password: z.string(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      const { password, ...values } = input;

      return loggingWith(user, 'create_channel', (db) =>
        db.transaction().execute(async (trx) => {
          const channel = await trx
            .insertInto('channel')
            .values(withInsert({
              ...values,
              password_encrypted: password && bcrypt.hashSync(password),
            }))
            .returningAll()
            .executeTakeFirstOrThrow();

          const participant = await trx
            .insertInto('channel_participant')
            .values(withInsert({
              channel_id: channel.id,
              user_id: user.instanceId,
              is_master: true,
            }))
            .returningAll()
            .executeTakeFirstOrThrow();

          return channel;
        }),
      );
    }),

  // 채널 설정 변경
  modifyChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      name: z.string().min(1),
      description: z.string(),
      password: z.string(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      const { channelId, password, ...values } = input;

      return loggingWith(user, 'modify_channel', (db) => db
        .updateTable('channel')
        .set(withUpdate({
          ...values,
          password_encrypted: password && bcrypt.hashSync(password),
        }))
        .returningAll()
        .executeTakeFirstOrThrow(),
      );
    }),

  // 참여자 확인
  isParticipant: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .query(({ ctx: { user }, input }) => {
      return loggingWith(user, 'check_participant', (db) => db
        .selectFrom('channel_participant')
        .where((eb) => eb.and([
          eb('channel_id', '=', input.channelId),
          eb('user_id', '=', user.instanceId),
          eb('deleted_at', 'is', null),
          eb.or([
            eb('banned_until', 'is', null),
            eb('banned_until', '<', new Date()),
          ]),
        ]))
        .selectAll()
        .executeTakeFirstOrThrow(),
      );
    }),

  // 채널 들어가기
  joinChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      password: z.string(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      return loggingWith(user, 'enter_channel', (db) =>
        db.transaction().execute(async (trx) => {
          const channel = await trx
            .selectFrom('channel')
            .where('id', '=', input.channelId)
            .selectAll()
            .executeTakeFirstOrThrow();

          let isValidPw = !channel.password_encrypted;
          if (channel.password_encrypted) {
            isValidPw = bcrypt.compareSync(input.password, channel.password_encrypted);
            if (!isValidPw) throw Error('invalid password');
          }

          const participant = await trx.insertInto('channel_participant')
            .values(withInsert({
              channel_id: input.channelId,
              user_id: user.instanceId,
              is_master: false,
            }))
            .onConflict((oc) => oc
              .column('id')
              .doUpdateSet(withUpdate({
                banned_until: null,
                deleted_at: null,
                muted_until: null,
              }))
              .where((eb) => eb.or([
                eb('channel_participant.banned_until', '<', new Date()),
                eb('channel_participant.banned_until', 'is', null),
              ])),
            )
            .returningAll()
            .executeTakeFirstOrThrow();

          return channel;
        }),
      );
    }),

  // 채널 나가기
  leaveChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      return loggingWith(user, 'leave_channel', (db) => db
        .transaction().execute(async (trx) => {
          const statusOld = await trx
            .selectFrom('channel_participant')
            .where((eb) => eb.and([
              eb('channel_id', '=', input.channelId),
              eb('user_id', '=', user.instanceId),
            ]))
            .selectAll()
            .executeTakeFirstOrThrow();

          const statusNew = await trx
            .updateTable('channel_participant')
            .set(withDelete({
              is_master: false,
            }))
            .where((eb) => eb.and([
              eb('channel_id', '=', input.channelId),
              eb('user_id', '=', user.instanceId),
            ]))
            .returningAll()
            .executeTakeFirstOrThrow();

          if (statusOld.is_master) {
            const participants = await trx
              .selectFrom('channel_participant')
              .where((eb) => eb.and([
                eb('user_id', '!=', statusOld.user_id),
                eb('channel_id', '=', statusOld.channel_id),
                eb('deleted_at', 'is', null),
                eb.or([
                  eb('banned_until', 'is', null),
                  eb('banned_until', '<', new Date()),
                ]),
              ]))
              .orderBy('created_at', 'asc')
              .selectAll()
              .execute();

            if (participants.length) {
              const masterNew = await trx
                .updateTable('channel_participant')
                .set('is_master', true)
                .where('user_id', '=', participants[0].user_id)
                .returningAll()
                .executeTakeFirstOrThrow();
            }
            else {
              const channelDeleted = await trx
                .updateTable('channel')
                .set('deleted_at', new Date())
                .where('id', '=', statusOld.channel_id);
            }

            return statusNew;
          }
        }),
      );
    }),

  // 참가자 목록
  getParticipants: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .mutation(({ ctx: { user, db }, input }) => {
      return db
        .selectFrom('channel_participant')
        .where((eb) => eb.and([
          eb('channel_id', '=', input.channelId),
          eb('deleted_at', 'is', null),
          eb.or([
            eb('banned_until', 'is', null),
            eb('banned_until', '<', new Date()),
          ]),
        ]));
    }),
  // 권한 위임
  delegateMaster: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      return loggingWith(user, 'delegate_master', (db, resolve) => db
        .transaction().execute(async (trx) => {
          const participant = await trx
            .selectFrom('channel_participant')
            .where((eb) => eb.and([
              eb('channel_id', '=', input.channelId),
              eb('user_id', '=', input.userId),
              eb('deleted_at', 'is', null),
              eb.or([
                eb('banned_until', 'is', null),
                eb('banned_until', '<', new Date()),
              ]),
            ]))
            .selectAll()
            .executeTakeFirstOrThrow();

          const masterOld = await trx
            .updateTable('channel_participant')
            .set('is_master', false)
            .where('user_id', '=', user.instanceId)
            .returningAll()
            .executeTakeFirstOrThrow();

          const masterNew = await trx
            .updateTable('channel_participant')
            .set('is_master', true)
            .where('user_id', '=', participant.user_id)
            .returningAll()
            .executeTakeFirstOrThrow();

          resolve(masterNew.user_id);
          return masterNew;
        }),
      );
    }),

  // 채팅 금지
  muteParticipant: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
      mutedUntil: z.coerce.date().optional(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      return loggingWith(user, 'mute_participant', (db, resolve) => db
        .transaction().execute(async (trx) => {
          const mutedUser = await trx.updateTable('channel_participant')
            .set(withUpdate({
              muted_until: input.mutedUntil ?? MAX_DATE,
            }))
            .where((eb) => eb.and([
              eb('channel_id', '=', input.channelId),
              eb('user_id', '=', input.userId),
            ]))
            .returningAll()
            .executeTakeFirstOrThrow();

          resolve(mutedUser.user_id);
          return mutedUser;
        }),
      );
    }),

  // 강퇴
  banParticipant: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      userId: z.string(),
      bannedUntil: z.coerce.date().optional(),
    }))
    .mutation(({ ctx: { user }, input }) => {
      return loggingWith(user, 'ban_participant', (db, resolve) => db
        .transaction().execute(async (trx) => {
          const bannedUser = await trx.updateTable('channel_participant')
            .set(withDelete({
              banned_until: input.bannedUntil ?? MAX_DATE,
            }))
            .where((eb) => eb.and([
              eb('channel_id', '=', input.channelId),
              eb('user_id', '=', input.userId),
            ]))
            .returningAll()
            .executeTakeFirstOrThrow();

          resolve(bannedUser.user_id);
          return bannedUser;
        }),
      );
    }),

  // 메시지 발신
  sendMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx: { user }, input }) => {
      emitter.emit('message', { ...input, userId: user.instanceId });
    }),

  // 메시지 수신
  receiveMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
    }))
    .subscription(async function* ({ ctx: { user }, input, signal }) {
      for await (const [data] of on(emitter, 'message', { signal: signal })) {
        const message = data as EmitterMap['message'][number];
        if (message.channelId === input.channelId) {
          yield message;
        }
      }
    }),

  // LLM 질의
  sendQuestion: protectedProcedure
    .input(z.object({
      content: z.string(),
    }))
    .mutation(({ input }) => {
      // TODO: langChain 또는 langGraph 변경
      return openai.chat.completions.create({
        model: 'gemma-3-12b-it',
        messages: [
          { role: 'user', ...input },
        ],
        // stream: true,
      });
    }),
});
