import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/node/index.ts'],
    splitting: false,
    clean: true,
    format: 'esm',
    treeshake: true,
    shims: true,
    banner: {
        js: '#!/usr/bin/env node'
    }
})