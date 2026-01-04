<template>
  <img
    tabindex="0"
    role="button"
    class="media media--orientation-landscape"
    src="~/assets/icons/placeholder.png"
    :alt="t('peer.placeholderAlt', { color: background })"
    ref="placeholder"
    :style="{ background }"
    @click="emit('click')"
    @keypress.enter="emit('click')"
  >
</template>

<script setup lang="ts">
const { t } = useI18n()
const config = usePalavaConfig()

const props = withDefaults(defineProps<{
  peer: any
  colorIndex?: number
}>(), {
  colorIndex: 0
})

const emit = defineEmits<{
  click: []
}>()

const background = computed(() => config.peerColors[props.colorIndex])
</script>
