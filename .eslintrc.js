module.exports = {
  root: true,
  extends: ['@lnd-boilerplate/eslint-config'],
  ignorePatterns: ['node_modules/', 'dist/', '.next/', 'build/'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
