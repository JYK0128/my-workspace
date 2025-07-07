import { emitter } from '#core/bridge.ts';
import { db } from '#core/kysely.ts';
import { ExpressContext } from '#server/express.ts';
import { SocketContext } from '#server/socket.ts';
import { safeParse } from '@packages/utils';
import { initTRPC, TRPCError } from '@trpc/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import SuperJSON from 'superjson';
import { TRPCPanelMeta } from 'trpc-ui';

export const createContextInner = (user: {
  userAgent: string
  userIp: string
  accessToken?: string
  instanceId?: string
}) => {
  return { db, user, emitter };
};
export type Context = SocketContext | ExpressContext;
const t = initTRPC.meta<TRPCPanelMeta>().context<Context>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    console.error(error);

    return {
      code: shape.code,
      message: safeParse(shape.message),
      data: {
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
      },
    };
  },
});
export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;


const JWKS = createRemoteJWKSet(
  new URL(`${process.env.APP_AUTH_URL}/protocol/openid-connect/certs`),
);
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { user } = ctx;

  const InvalidTokenError = new TRPCError({
    code: 'UNAUTHORIZED',
    message: 'invalid token',
  });

  // CASE01 - 토큰 없음
  if (!user.accessToken) {
    throw InvalidTokenError;
  }

  // CASE02 - 토큰 검증 실패
  const { payload } = await jwtVerify(user.accessToken,
    JWKS,
    {
      issuer: process.env.APP_AUTH_URL,
      audience: 'account',
    },
  ).catch(() => {
    throw InvalidTokenError;
  });

  // CASE03 - OIDC client 없음
  if (payload.azp !== 'my-client' || !payload.sub) {
    throw InvalidTokenError;
  }

  return next({
    ctx: {
      ...ctx,
      user: {
        ...ctx.user,
        instanceId: payload.sub,
      },
    },
  });
});
