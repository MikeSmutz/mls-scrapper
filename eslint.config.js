module.exports = [
  {
    files: ['**/*.{js,ts}'],
    ignores: [
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'dist/**',
      'build/**'
    ],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        browser: true,
        node: true,
        es2022: true,
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-const': 'error',
      
      // General JavaScript/TypeScript rules
      'no-console': 'off', // Allow console.log for automation scripts
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Formatting (will be handled by Prettier)
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { allowTemplateLiterals: true }],
      'comma-dangle': ['error', 'never'],
      
      // Best practices for automation
      'no-magic-numbers': 'off', // Allow magic numbers for timeouts, etc.
      'max-len': ['warn', { code: 120 }],
    },
  },
];
