<template>
  <nav class="navigation">
    <ul>
      <li
        v-for="infoPage in infoPages"
        :key="infoPage.id"
      >
        <NuxtLink :to="`/info/${infoPage.id}`">
          <span
            tabindex="0"
            role="button"
            @click="checkScreen(infoPage.id, $event)"
            @keypress.enter="checkScreen(infoPage.id, $event)"
          >
            {{ infoPage.title }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const { tm, rt } = useI18n()

const props = withDefaults(defineProps<{
  type?: string
}>(), {
  type: 'page'
})

const emit = defineEmits<{
  openInfoScreen: [page: string]
}>()

const infoPages = computed(() => {
  const pages = tm('infoPages') as any[]
  return pages
    .map(p => ({
      ...p,
      id: rt(p.id),
      title: rt(p.title),
      linked: p.linked,
    }))
    .filter((ip) => ip.linked !== false)
})

const checkScreen = (infoPageId: string, event: Event) => {
  if (props.type === 'screen') {
    event.preventDefault()
    emit('openInfoScreen', infoPageId)
  }
}
</script>

<style lang="scss">
@use '~/assets/css/styles.scss' as *;

.navigation {
  border-bottom: 1px solid $background;
  margin-top: -$tiny-plus-spacing;
  padding-top: $medium-spacing - 1px;
  border-top: 1px solid $background;

  @media (min-width: $mobile-plus) {
    padding-top: 0;
    border-top: none;
  }

  ul {
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: 1fr 1fr;
    @media (min-width: $mobile-plus) {
      grid-template-rows: 1fr;
    }
  }

  li {
    padding-bottom: $medium-spacing - 1px;
    padding-right: $medium-spacing;
  }

  a, a span {
    display: block;
    height: 100%;
  }

  .router-link-active {
    color: $action-2;
  }
}
</style>
