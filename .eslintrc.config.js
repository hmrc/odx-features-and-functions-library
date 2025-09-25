export default [
  {
    parserOptions: {
      project: ['./tsconfig.json']
    },
    plugins: ['jsdoc'],
    rules: {
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/require-param': 'warn',
      'jsdoc/require-returns': 'warn'
    }
  }
]
