const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Exclude the ESLint config itself from linting
  { ignores: ['eslint.config.js'] },

  // ── Browser calculator scripts ──────────────────────────────────────────
  {
    files: ['*.js'],
    ignores: ['validate-run.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Third-party CDN globals (Chart.js, MathJax)
        Chart: 'readonly',
        MathJax: 'readonly',
        // Shared utilities exposed as globals from tool-enhancements.js
        engFmt: 'readonly',
        nfBuild: 'readonly',
        nfCalc: 'readonly',
        updateDbm: 'readonly',
        vswrUpdate: 'readonly',
        drawDiagram: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Many tool callback parameters are intentionally unused
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
    },
  },

  // ── Node.js headless test runner ────────────────────────────────────────
  {
    files: ['validate-run.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { args: 'none' }],
    },
  },
];
