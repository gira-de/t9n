<script lang="ts">
  import de from '../locale/de.json';
  import meta from '../locale/meta.json';
  import type { TranslationArgs } from '../locale/types';
  import svelteLogo from './assets/svelte.svg';
  import Counter from './lib/Counter.svelte';
  import { newT9n } from '@gira/t9n-svelte';

  // dictionary with all languages
  const languages = [
    {
      locale: 'meta',
      name: 'Developer',
      dictionary: meta,
    },
    {
      locale: 'de',
      name: 'German',
      dictionary: de,
    },
    {
      locale: 'en',
      name: 'English',
      dictionary: {},
    },
  ] as const;

  // default language
  const fallbackLanguage = languages[0];

  // logging functions
  const logFallback = (translationKey: string, currentLanguage: string) =>
    console.warn(
      `[i18n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Using the fallback language: «${fallbackLanguage.locale}».`,
    );

  const logMissing = (translationKey: string, currentLanguage: string) =>
    console.warn(
      `[i18n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Neither does the fallback language.`,
    );

  const { t, ti } = newT9n<TranslationArgs>()({
    languages,
    fallbackLanguage,
    logFallback,
    logMissing,
  });
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>{$t('pageOne.headline')}</h1>

  <!-- <p>{JSON.stringify($ti('pageTwo.headline'))}</p> -->

  <div class="card">
    <Counter />
  </div>

  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
