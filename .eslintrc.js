module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable strict rules for MVP deployment
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error', // Keep this as error for safety
    '@next/next/no-img-element': 'warn',
    '@next/next/no-html-link-for-pages': 'warn',
    'jsx-a11y/alt-text': 'warn',
    'prefer-const': 'warn'
  }
}
