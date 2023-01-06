<script lang="ts">
  import de from '../locale/de.json';
  import meta from '../locale/meta.json';
  import type { TranslationArgs } from '../locale/types';
  import { newT9n } from '@gira-de/t9n-svelte';

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
      `[t9n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Using the fallback language: «${fallbackLanguage.locale}».`,
    );

  const logMissing = (translationKey: string, currentLanguage: string) =>
    console.warn(
      `[t9n] The translationKey «${translationKey}» is missing within «${currentLanguage}». Neither does the fallback language.`,
    );

  const { locale, t, ti } = newT9n<TranslationArgs>()({
    languages,
    fallbackLanguage,
    logFallback,
    logMissing,
  });

  let selected: 'meta' | 'de' | 'en';
</script>

<main>
  <h1>@gira-de/t9n-svelte</h1>

  <form on:submit|preventDefault>
    <label for="languageSelection">Select Language</label>
    <select
      id="languageSelection"
      bind:value={selected}
      on:change={() => locale.set(selected)}
    >
      {#each languages as language}
        <option value={language.locale}
          >{language.name} ({language.locale})</option
        >
      {/each}
    </select>
  </form>

  <div id="content">
    <h2>{$t('pageOne.headline')}</h2>

    <div class="card">
      <div>Current language: <strong>{$locale}</strong></div>
      <div>
        Translation key found in: <strong>{$ti('pageOne.headline').hit}</strong>
      </div>
    </div>
  </div>

  <footer>
    This example is based on <a
      href="https://vitejs.dev/guide/#scaffolding-your-first-vite-project"
      target="_blank"
      rel="noreferrer">Vite</a
    >. Check out
    <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </footer>
</main>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  select {
    padding: 5px 8px;
  }

  #content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  footer {
    padding-top: 35px;
  }
</style>
