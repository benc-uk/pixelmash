import globals from 'globals'
import js from '@eslint/js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'off',
      'no-undef': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'sort-imports': 'warn',
    },
  },
]
