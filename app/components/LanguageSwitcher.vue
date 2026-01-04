<template>
  <button
    type="button"
    :title="t('switchLanguageTitle')"
    class="language-switcher"
    @click="switchLanguage"
  >
    <span :aria-label="t('switchLanguageAlt')">{{ locale.toUpperCase() }}</span>
  </button>
</template>

<script setup lang="ts">
const { locale, setLocale, t } = useI18n()

const switchLanguage = () => {
  setLocale(locale.value === 'de' ? 'en' : 'de')
}
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles.scss" as *;

.language-switcher {
  /* Typography */
  @include footerFont();
  text-transform: uppercase;
  color: $shade;

  /* Box model */
  padding: 0;

  /* Visual */
  border: none;
  background: none;

  /* Interactive */
  cursor: pointer;

  /* States */
  &:hover {
    color: $action-2;
  }

  &:focus {
    outline: 1px dashed $action-2;
  }
}
</style>
