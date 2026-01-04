<template>
  <div class="logo">
    <NuxtLink to="/">
      <PalavaIcon
        :aria-label="t('palavaLogoAlt')"
        role="img"
      />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import PalavaIcon from '~/assets/icons/palava.svg'

const { t } = useI18n()
</script>

<style lang="scss" scoped>
// No styles needed here - parent components handle sizing
// The logo adapts to whatever size the parent sets
.logo {
  display: inline-block;
}
</style>
