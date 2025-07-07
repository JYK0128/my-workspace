import nodeConfig from '@packages/eslint-config/node.js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  nodeConfig,
);
