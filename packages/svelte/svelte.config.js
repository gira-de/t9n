import preprocess from 'svelte-preprocess';

export default {
  preprocess: preprocess(),
  kit: {
    files: {
      lib: 'src',
    },
  },
};
