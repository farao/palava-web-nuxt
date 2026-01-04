<template>
  <aside
    ref="infoScreenEl"
    tabindex="0"
    role="button"
    class="info-screen"
    @keydown.esc="emit('close')"
  >
    <button
      type="button"
      class="close"
      @click="emit('close')"
    >
      <CrossIcon
        :aria-label="t('closeAlt')"
        role="img"
      />
    </button>
    <Navigation
      type="screen"
      @open-info-screen="(page) => emit('openInfoScreen', page)"
    />
    <div
      class="info-content"
      v-html="infoPage?.content || ''"
    />
  </aside>
</template>

<script setup lang="ts">
import CrossIcon from '~/assets/icons/cross.svg'

const { t, tm, rt } = useI18n()

const props = defineProps<{
  page: string
}>()

const emit = defineEmits<{
  close: []
  openInfoScreen: [page: string]
}>()

const infoScreenEl = ref<HTMLElement | null>(null)

// Find the info page content for current locale
const infoPage = computed(() => {
  const pages = tm('infoPages') as any[]
  return pages
    .map(p => ({
      ...p,
      id: rt(p.id),
      title: rt(p.title),
      content: rt(p.content),
    }))
    .find((ip: any) => ip.id === props.page) || {}
})

// Focus the element when mounted or when page changes
onMounted(() => {
  if (props.page) {
    infoScreenEl.value?.focus()
  }
})

watch(() => props.page, (newPage) => {
  if (newPage) {
    infoScreenEl.value?.focus()
  }
})
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles" as *;
@use "~/assets/css/info-shared" as *;

.info-screen {
  @include info-container();
  
  // Positioning
  position: fixed;
  z-index: 700;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  // Visual overrides
  outline: none;
  overflow: auto;

  // Shadow effect
  @include defaultShadow();

  // Responsive styles
  @media (min-width: $mobile-plus) {
    left: $medium-spacing;
    top: $large-control-size * 2;
    max-width: calc(100% - #{$medium-spacing * 2});
    bottom: $medium-spacing;
    opacity: 0.92;
  }

  @media (min-width: $desktop) {
    width: $desktop;
  }

  @media (min-width: $desktop-large) {
    width: $desktop-plus;
  }

  .close {
    @include inlineButton();
    @include closeButton(36px);
  }

  :deep(.navigation) {
    padding-top: 0;
    border-top: none;
    padding-right: 36px;
    width: 100%;
  }

  .info-content {
    padding-bottom: $medium-plus-spacing;
  }
}
</style>
