/* eslint-env node */
import globals from 'globals';

import babelParser from '@babel/eslint-parser';

import htmlPlugin from 'eslint-plugin-html';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

import js from '@eslint/js';

const rules = {
  eslint: {
    'no-case-declarations': 'off',
    'import/no-unresolved': 'off',
    'import/namespace': 'off',
    'import/no-duplicates': 'off',
    'no-async-promise-executor': 'off',
    'import/named': 'off',
    curly: 2,
    'no-throw-literal': 'off',
    camelcase: [
      'error',
      {
        properties: 'always',
      },
    ],
    'arrow-spacing': ['error', { before: true, after: true }],
    'operator-assignment': ['error', 'always'],
    'no-var': 'error',
    'func-style': 'error',
    'no-console': [
      'error',
      {
        allow: ['warn', 'trace', 'group', 'groupCollapsed', 'groupEnd'],
      },
    ],
    'promise/catch-or-return': 'off',
    'promise/always-return': 'off',
  },
  prefixBlocks: {},
};

const addPrefixesToRules = () => {
  const prefixedRules = {};

  for (const prefixBlock of Object.keys(rules.prefixBlocks)) {
    const { prefix, rules: notPrefixedRules } = rules.prefixBlocks[prefixBlock];

    const prefixedBlockRules = {};
    Object.keys(notPrefixedRules).forEach((rule) => {
      const prefixedRule = `${prefix}/${rule}`;
      prefixedBlockRules[prefixedRule] = notPrefixedRules[rule];
    });

    prefixedRules[prefixBlock] = prefixedBlockRules;
  }

  return prefixedRules;
};

const readyRules = {
  eslint: rules.eslint,
  ...addPrefixesToRules(),
};

const eslint = {
  ignores: ['node_modules/*', 'dist/*', 'package-lock.json'],
  languageOptions: {
    ecmaVersion: 2023,
    sourceType: 'module',
    parser: babelParser,
    globals: {
      ...globals.browser,
      ...globals.node,
      // myCustomGlobal: "readonly"
    },
  },
  plugins: {
    html: htmlPlugin,
  },
  rules: {
    ...readyRules['eslint'],
  },
  settings: {
    'prettier/prettier': 'error',
    'import/extensions': ['.js', '.jsx'],
    'import/resolver': {
      alias: {
        map: [['@', './src']],
      },
    },
  },
};

export default [js.configs.recommended, eslint, prettierPlugin];
