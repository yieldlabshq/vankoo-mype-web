import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // The skills are vendored reference material, not app code: their templates are
  // placeholders with names like __Entity__List that no lint rule can ever accept.
  globalIgnores(['dist', '.agents', '.claude']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // shadcn generates these, and its canonical output exports the cva variants
    // beside the component. That trips react-refresh, and the shadcn skill is
    // explicit that hand-editing generated components is the last resort — so the
    // rule is relaxed here rather than the files rewritten.
    files: ['src/components/ui/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
