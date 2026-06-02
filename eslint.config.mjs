import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import { globalIgnores } from 'eslint/config'

const eslintConfig = [
    ...nextVitals,
    ...nextTs,
    // Enable React Compiler-aware rules (not yet bundled in eslint-config-next)
    reactHooks.configs.flat['recommended-latest'],
    {
        plugins: { 'unused-imports': unusedImports },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
        },
    },
    // prettier disables formatting rules; must come after all other configs
    prettier,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]

export default eslintConfig
