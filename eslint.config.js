import js from '@eslint/js';
import json from '@eslint/json';

import globals from 'globals';

import parserBabel from '@babel/eslint-parser';

import tseslint from 'typescript-eslint';
import * as tsResolver from 'eslint-import-resolver-typescript';

import pluginImportX from 'eslint-plugin-import-x';

import pluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import * as configPrettier from 'eslint-config-prettier';

const isProd = process.env.NODE_ENV === 'production';
const runInProd = (config) => (!isProd ? 'off' : config);

const rulesJs = {
  ...js.configs.recommended.rules,
  ...configPrettier.rules,
  'no-console': 'warn',
};
const rulesTs = {
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/no-unused-vars': 'error',
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-dynamic-delete': 'warn',
  'no-console': 'warn',
};

const localConfigIgnores = {
  ignores: ['node_modules', '.vscode', 'package-lock.json', 'dist', '.cache'],
};

const localConfigImport = {
  files: ['**/*.js', 'src/**/*.ts', 'vite.config.ts'],
  plugins: {
    'import-x': pluginImportX,
  },
  settings: {
    'import-x/resolver': {
      name: 'tsResolver',
      resolver: tsResolver,
    },
    'import-x/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
      '@babel/eslint-parser': ['.js'],
    },
  },
  rules: {
    ...pluginImportX.configs.recommended.rules,
    'import-x/export': 'error',
    'import-x/first': 'off',
    'import-x/extensions': 'off',
    'import-x/no-self-import': 'error',
    'import-x/no-unresolved': 'error',
    'import-x/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true,
      },
    ],
    'import-x/order': 'off',
    'import-x/no-cycle': runInProd('error'),
    'import-x/no-deprecated': runInProd('warn'),
    'import-x/no-unused-modules': runInProd('error'),
    'import-x/no-named-as-default': runInProd('error'),
  },
};

const localConfigJsNode = [
  {
    files: ['eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
      parser: parserBabel,
    },
    settings: {
      'prettier/prettier': 'error',
    },
    rules: {
      ...rulesJs,
    },
  },
];

const localConfigJs = {
  files: ['**/*.js'],
  ignores: localConfigJsNode[0].files,
  plugins: {},
  languageOptions: {
    ecmaVersion: 'latest',
    globals: {
      ...globals.builtin,
      ...globals.browser,
    },
    parser: parserBabel,
  },
  settings: {
    'prettier/prettier': 'error',
  },
  rules: {
    ...rulesJs,
  },
};

const localConfigTsNode = [
  {
    files: ['vite.config.ts'],
    plugins: {},
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.node,
      },
    },
    settings: {
      'prettier/prettier': 'error',
      'import-x/resolver': {
        options: {
          project: ['tsconfig.node.json'],
        },
      },
    },
    rules: {
      ...rulesTs,
    },
  },
];

const localConfigTs = [
  ...tseslint.configs.strict,
  pluginImportX.configs.typescript,
  {
    files: ['**/*.ts'],
    ignores: localConfigTsNode[0].files,
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.builtin,
        ...globals.browser,
      },
    },
    settings: {
      'prettier/prettier': 'error',
      'import-x/resolver': {
        options: {
          project: ['tsconfig.src.json'],
        },
      },
    },
    rules: {
      ...rulesTs,
    },
  },
];

const localConfigJson = [
  {
    plugins: {
      json,
    },
  },
  {
    files: ['**/*.json'],
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },
];

export default tseslint.config(
  localConfigIgnores,
  pluginPrettierRecommended,
  localConfigImport,
  localConfigJs,
  ...localConfigJsNode,
  ...localConfigTs,
  ...localConfigTsNode,
  ...localConfigJson
);
