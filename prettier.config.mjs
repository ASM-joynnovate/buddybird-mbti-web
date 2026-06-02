/** @type {import("prettier").Config} */
const config = {
    semi: false,
    singleQuote: true,
    jsxSingleQuote: false,
    printWidth: 100,
    trailingComma: 'all',
    tabWidth: 4,
    // @ianvs/prettier-plugin-sort-imports
    importOrder: ['^react$', '^next(/.*)?$', '<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
    importOrderTypeScriptVersion: '5.0.0',
    // prettier-plugin-tailwindcss (Tailwind v4: point to the CSS entry point)
    tailwindStylesheet: './app/globals.css',
    // Also sort classes passed to these helper functions
    tailwindFunctions: ['clsx', 'cn', 'cva', 'tw'],
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
        // prettier-plugin-tailwindcss MUST be the last plugin in the array
        'prettier-plugin-tailwindcss',
    ],
}

export default config
