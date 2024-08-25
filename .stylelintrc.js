export default {
  extends: ['stylelint-config-standard-scss'],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'no-empty-source': null,
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'v-bind'],
      },
    ],
    'selector-class-pattern': /^[a-zA-Z]+(-[a-zA-Z]+)*(__[a-zA-Z]+(-[a-zA-Z]+)*)?(--[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?$/,
    'max-nesting-depth': 2,
    'value-keyword-case': [
      'lower',
      {
        ignoreKeywords: ['/colors..*.DEFAULT/'],
        ignoreFunctions: ['v-bind'],
      },
    ],
  },
};
