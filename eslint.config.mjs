// eslint.config.js
import prettier from 'eslint-plugin-prettier';

const eslintConfig = {
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals: {
      // Define global variables here if needed
    },
  },
  plugins: {
    prettier: prettier,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        singleQuote: true,
        semi: true,
        tabWidth: 2,
        trailingComma: 'es5',
        arrowParens: 'always',
      },
    ],
  },
  files: ['**/*.js'],
  ignores: ['node_modules/**', 'dist/**'],
};

export default eslintConfig;
