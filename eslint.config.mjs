import { readdirSync } from 'node:fs'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import reactHooks from 'eslint-plugin-react-hooks'
import unusedImports from 'eslint-plugin-unused-imports'
import { globalIgnores } from 'eslint/config'

// Screen-composition modules (ADR-0010) — the only features allowed to import
// other features. Every other folder under features/ is a capability feature
// and gets a cross-feature ban zone generated automatically below, so adding
// a new capability feature needs no config change.
const COMPOSITION_FEATURES = new Set(['intro', 'result'])

const capabilityZones = readdirSync('./features', { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !COMPOSITION_FEATURES.has(entry.name))
    .map((entry) => ({
        target: `./features/${entry.name}`,
        from: './features',
        except: [`./${entry.name}`],
    }))

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
    {
        // Architecture boundaries (ADR-0010, bulletproof-react pattern).
        // `import` plugin + TS alias resolver come from eslint-config-next,
        // which only applies to source files — so scope this object the same
        // way or bare `eslint` fails on .mjs/config files.
        files: ['app/**', 'features/**', 'shared/**', 'lib/**', 'content/**'],
        rules: {
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        ...capabilityZones,
                        // Unidirectional: app → features → shared/lib/content.
                        { target: './features', from: './app' },
                        {
                            target: ['./shared', './lib', './content'],
                            from: ['./features', './app'],
                        },
                    ],
                },
            ],
        },
    },
    // prettier disables formatting rules; must come after all other configs
    prettier,
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]

export default eslintConfig
