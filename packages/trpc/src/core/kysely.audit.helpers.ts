import { DB, JsonValue } from '#core/db.js';
import { db } from '#core/kysely.ts';
import { Context } from '#core/trpc.ts';
import { Kysely } from 'kysely';

export const loggingWith = <T>(
  user: Context['user'],
  action: string,
  callback: (db: Kysely<DB>, resolver: (meta: JsonValue) => void) => Promise<T>,
) => {
  let err: Error;
  let metadata: JsonValue | undefined;
  const resolver = (meta: JsonValue) => {
    metadata = meta;
  };
  return callback(db, resolver)
    .catch((error) => {
      err = error instanceof Error ? error : Error('unknown');
      throw error;
    })
    .finally(async () => {
      await db
        .insertInto('user_log')
        .values({
          action: action ?? 'unknown',
          level: err ? 'error' : 'info',
          created_at: new Date(),
          user_id: user.instanceId,
          user_agent: user.userAgent,
          user_ip: user.userIp,
          metadata: metadata,
        })
        .executeTakeFirstOrThrow();
    });
};

export const withLogging = <T>(data: T, id?: string) => {
  return {
    ...data,
    created_at: new Date(),
    created_by: id,
  };
};

export const withInsert = <T>(data: T, id?: string) => {
  return {
    ...data,
    created_at: new Date(),
    created_by: id,
    updated_at: new Date(),
    updated_by: id,
  };
};

export const withUpdate = <T>(data: T, id?: string) => {
  return {
    ...data,
    updated_at: new Date(),
    updated_by: id,
  };
};

export const withDelete = <T>(data: T, id?: string) => {
  return {
    ...data,
    updated_at: new Date(),
    updated_by: id,
    deleted_at: new Date(),
    deleted_by: id,
  };
};
