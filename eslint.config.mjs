import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

// `[locale]` would parse as a glob character class, so the bracket is escaped as `[[]` and every path is a glob.
const LOCALE_DIR = './src/app/[[]locale]';
const routeZones = [
	['(forest)', '(forest)/_components'],
	['(forest)/test', '(forest)/test'],
	['(forest)/species', '(forest)/species'],
	['result', 'result'],
].map(([route, except]) => ({
	target: `${LOCALE_DIR}/${route}/_components/**`,
	from: `${LOCALE_DIR}/**`,
	except: [`**/src/app/[[]locale]/${except}/**`],
}));

export default defineConfig([
	...nextVitals,
	...nextTs,
	{
		plugins: { 'no-relative-import-paths': noRelativeImportPaths },
		rules: {
			'no-relative-import-paths/no-relative-import-paths': [
				'error',
				{ allowSameFolder: true, rootDir: '.', prefix: '@' },
			],
		},
	},
	{
		rules: {
			'import/no-restricted-paths': ['error', { zones: routeZones }],
		},
	},
	{
		plugins: { 'unused-imports': unusedImports },
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{ vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
			],
		},
	},
	prettier,
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.yarn/**']),
]);
