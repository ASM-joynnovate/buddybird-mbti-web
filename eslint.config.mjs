import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import unusedImports from 'eslint-plugin-unused-imports';
import { defineConfig, globalIgnores } from 'eslint/config';

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
