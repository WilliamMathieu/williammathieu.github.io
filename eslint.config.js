const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Exclude the ESLint config itself from linting
  { ignores: ['eslint.config.js'] },

  // ── Browser calculator scripts ──────────────────────────────────────────
  {
    files: ['*.js'],
    ignores: ['validate-run.js', 'audit3.js', 'generate-values.js'],
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

  // ── Node.js headless test runners ───────────────────────────────────────
  {
    files: ['validate-run.js', 'audit3.js', 'generate-values.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        // Page-scope globals referenced inside Playwright page.evaluate() callbacks
        window: 'readonly',
        document: 'readonly',
        Chart: 'readonly',
        MathJax: 'readonly',
        SC: 'readonly',
        zToGamma: 'readonly',
        tl_type_change: 'readonly',
        loadPreset: 'readonly',
        simulate: 'readonly',
        runSpice: 'readonly',
        calculate: 'readonly',
        buildInputs: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { args: 'none' }],
      // Empty catch blocks are intentional (best-effort optional fills)
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];
