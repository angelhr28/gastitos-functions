module.exports = {
  root: true,
  env: { es6: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.dev.json'],
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  ignorePatterns: [
    '/lib/**/*',        // build
    '/generated/**/*',  // código generado
  ],
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  rules: {
    // estilo general
    quotes: ['warn', 'double', { avoidEscape: true }],
    indent: ['warn', 2, { SwitchCase: 1 }],
    'eol-last': ['warn', 'always'],
    'max-len': ['warn', { code: 120, ignoreComments: true, ignoreStrings: true }],
    'no-multi-spaces': 'warn',
    'object-curly-spacing': ['warn', 'always'],

    // TS/Imports
    'import/no-unresolved': 'off', // TypeScript resuelve paths
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

    // Desactivar JSDoc obligatorio (venía del preset google/valid-jsdoc)
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: { project: '.' },
    },
  },
};