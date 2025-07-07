import base from '@packages/eslint-config/base.js';
import react from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import customPlugin from './plugins/react-plugin.js';


/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactRefresh.configs['vite'],
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react': react,
      'react-hooks': reactHooks,
      'custom': customPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs['recommended'].rules,
      "react-refresh/only-export-components": 'warn',
      "react/function-component-definition": ["error", {
        "namedComponents": "function-declaration",
        "unnamedComponents": "arrow-function"
      }],
      // "custom/no-console": "error"
    },
  },
];
