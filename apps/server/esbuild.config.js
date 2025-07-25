import dotenvFlow from 'dotenv-flow';
import esbuild from 'esbuild';
import { nodeExternals } from 'esbuild-plugin-node-externals';

// env
dotenvFlow.config();
const env = Object.entries(process.env).reduce((acc, [k, v]) => {
  if (k.startsWith('APP_') || k.startsWith('NODE_') || k.startsWith('DATABASE_')) {
    acc[`process.env.${k}`] = JSON.stringify(v);
  }
  return acc;
}, {});

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: ['src/main.ts'],
  tsconfig: 'tsconfig.app.json',
  sourcemap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  outfile: 'dist/index.cjs',
  minify: process.env.NODE_ENV === 'production',
  drop: ['debugger'],
  define: {
    ...env,
  },
  logLevel: 'info',
  external: ['trpc-ui'],  // @packages/trpc에서 의존 중
  plugins: [
    nodeExternals({
      packagePaths: './package.json',
      withDeps: false,
      include: [],
      forceExternalList: [],
    }),
  ],
};

// watch
const isWatching = !!process.argv.includes('--watch');
if (isWatching) {
  esbuild.context(options).then((ctx) => {
    ctx.watch();
  });
}
else {
  esbuild.build(options);
}
