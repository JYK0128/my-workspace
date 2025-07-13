import { DB } from '#core/db.js';
import { Kysely, PostgresDialect } from 'kysely';
import * as pg from 'pg';
export * from './kysely.audit.helpers';
export * from './kysely.query.helpers';

const dialect = new PostgresDialect({
  pool: new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({
  dialect,
  log(event) {
    if (event.level === 'error') {
      console.error('Query failed : ', {
        durationMs: event.queryDurationMillis,
        error: event.error,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    }
    else {
      console.log('Query executed : ', {
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    }
  },
});

const shutdown = async () => {
  console.log('Shutting down DB connection...');
  await db.destroy();
  console.log('DB connection closed.');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
