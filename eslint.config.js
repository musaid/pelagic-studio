import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'build/**',
      '.react-router/**',
      '.wrangler/**',
      'node_modules/**',
      'worker-configuration.d.ts',
    ],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  {
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // jsx-a11y (spread flat config rules manually for compatibility)
      ...jsxA11y.flatConfigs.recommended.rules,

      // Not needed with TypeScript
      'react/prop-types': 'off',

      // Enforce project conventions
      'no-var': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Prose-heavy pages use apostrophes — TypeScript covers type safety
      'react/no-unescaped-entities': 'off',
    },
  },

  // Must be last — disables rules that conflict with Prettier
  prettierConfig,
);
