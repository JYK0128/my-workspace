import reactConfig from '@packages/eslint-config/react.js';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  reactConfig,
  pluginQuery.configs['flat/recommended'],
);
