import reactConfig from '@packages/eslint-config/react.js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  reactConfig,
);
