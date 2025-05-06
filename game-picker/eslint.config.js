// Flat config for ESLint v9+ (game-picker)
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // Base configuration for all files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'warn'
    }
  },
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  // React configuration
  {
    files: ['**/*.jsx', '**/*.tsx'],
    plugins: {
      'react': react,
      'react-hooks': reactHooks
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
