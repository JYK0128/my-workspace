import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

/** @type {import("eslint").Linter.Config[]} */
export default [
  js.configs['recommended'],
  ...tseslint.configs['recommended'],
  stylistic.configs['recommended'],
  sonarjs.configs['recommended'],
  {
    rules: {
      /* sonarjs */
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-nested-functions': 'warn',
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/no-dead-store': 'off',
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/table-header': 'off',

      /* eslint */
      'eqeqeq': ['error', 'always'],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
          'ignoreRestSiblings': true,
        }
      ],

      /* @stylistic - recommended */
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/no-multi-spaces': ['error',
        { ignoreEOLComments: true },
      ],
      '@stylistic/no-multiple-empty-lines': ['error',
        { max: 2, maxEOF: 1 },
      ],
      '@stylistic/object-property-newline': ['error',
        { allowAllPropertiesOnSameLine: true },
      ],
      '@stylistic/array-element-newline': ['error',
        {
          ArrayExpression: { multiline: true, consistent: true },
          ArrayPattern: { multiline: true, consistent: true },
        },
      ],
      '@stylistic/indent': ['error',
        2,
        {
          ImportDeclaration: 'first',
          SwitchCase: 1,
          flatTernaryExpressions: true,
        },
      ],
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/object-curly-newline': ['error',
        {
          ObjectExpression: { multiline: true, consistent: true },
          ObjectPattern: { multiline: true, consistent: true },
          ImportDeclaration: 'never',
          ExportDeclaration: 'never',
        },
      ],
      '@stylistic/jsx-self-closing-comp': ['error',
        {
          component: true,
          html: true,
        },
      ],
    },
  },
  { ignores: ['node_modules', 'dist', 'build'] },
];
