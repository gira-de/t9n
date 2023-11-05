export default {
    input: './lib/index.js',
    output: {
      file: './lib/index.umd.js',
      format: 'umd',
      name: 't9n',
      sourcemap: true,
      globals: {
        'svelte/store': 'store',
      }
    },
    external: ['svelte/store'],
  };