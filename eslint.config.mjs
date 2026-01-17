// @ts-check

import { fixupPluginRules } from '@eslint/compat';
import pluginJs from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import pluginQuery from '@tanstack/eslint-plugin-query';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import prettierConfig from 'eslint-config-prettier';
import { readGitignoreFiles } from 'eslint-gitignore';
import pluginJson from 'eslint-plugin-json';
import pluginJsonc from 'eslint-plugin-jsonc';
import prettierPlugin from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginYml from 'eslint-plugin-yml';
import globals from 'globals';
import * as tseslint from 'typescript-eslint';
import yamlParser from 'yaml-eslint-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commonJsRules = {
  'no-console': 'warn',
  'no-debugger': 'warn',
};

const defaultJsRules = {
  semi: ['warn', 'always'],
  'no-extra-semi': 'warn',
  'no-redeclare': 'warn',
  'no-undef': 'error',
  'no-unreachable': 'warn',
  'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  'prefer-const': 'warn',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  'no-constant-binary-expression': 'off',
};

export default [
  {
    ignores: [
      // Ignore `.gitignore` specified fiels etc...
      ...readGitignoreFiles({ cwd: __dirname }),
      '.next/**',
      'src/generated/prisma/**',
      '*~',
    ],
  },

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // Base JS configuration for all JavaScript/TypeScript files
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      // @ts-expect-error: Check types for the plugin
      '@next/next': fixupPluginRules(nextPlugin),
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...defaultJsRules,
      ...commonJsRules,
    },
  },

  // Core project source files
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      // tailwindcss: tailwindcssPlugin,
      'react-hooks': fixupPluginRules(pluginReactHooks),
      '@tanstack/query': pluginQuery,
    },
    rules: {
      // ...defaultJsRules,
      // ...tailwindcssPlugin.configs.recommended.rules,
      // 'tailwindcss/no-custom-classname': ['warn', { callees: ['twMerge'] }],
      ...pluginReactHooks.configs.recommended.rules,
      ...commonJsRules,
      '@tanstack/query/exhaustive-deps': 'warn',
    },
  },

  // React configuration with version specified
  {
    files: ['**/*.{jsx,tsx}'],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...commonJsRules,
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // Typescript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // NOTE: The order is important
      ...pluginJs.configs.recommended.rules,
      // ...defaultJsRules,
      ...tsPlugin.configs.recommended.rules,
      ...commonJsRules,
      'no-undef': 'off', // Disable for TypeScript files - TypeScript handles this
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-constant-binary-expression': 'off',
    },
  },

  // Override for root config files
  {
    files: ['*.{js,mjs,cjs,ts}'],
    ignores: [
      // Ignored files...
      'src/**',
      '*~',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        module: 'writable',
      },
    },
    rules: {
      ...commonJsRules,
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Jest test files
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'src/jest/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      ...commonJsRules,
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Override for source files to disable specific rules
  {
    files: ['src/**/*.{js,ts}'],
    rules: {
      ...commonJsRules,
      'no-unused-vars': 'off',
    },
  },

  // YAML configuration
  {
    files: ['**/*.{yml,yaml}'],
    plugins: {
      yml: pluginYml,
    },
    languageOptions: {
      parser: yamlParser,
    },
    rules: {
      ...pluginYml.configs.recommended.rules,
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-unused-expressions': 'off',
    },
  },

  // JSONC files - commented json (@see https://www.npmjs.com/package/eslint-plugin-jsonc)
  {
    files: ['**/*.jsonc'],
    plugins: {
      jsonc: pluginJsonc,
      prettier: prettierPlugin,
    },
    rules: {
      ...pluginJsonc.configs['recommended-with-jsonc'].rules,
      'prettier/prettier': 'warn',
      // Disable JavaScript/TypeScript specific rules that don't apply to JSON
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-constant-binary-expression': 'off',
    },
  },

  // JSON files (@see https://www.npmjs.com/package/eslint-plugin-json)
  {
    files: ['**/*.json'],
    plugins: {
      json: pluginJson,
      prettier: prettierPlugin,
    },
    rules: {
      ...pluginJson.configs['recommended-legacy'].rules,
      'prettier/prettier': 'warn',
      // Disable JavaScript/TypeScript specific rules that don't apply to JSON
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-constant-binary-expression': 'off',
    },
  },

  // Prettier integration
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
];
