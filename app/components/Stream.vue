<template>
  <video
    ref="videoEl"
    tabindex="0"
    role="button"
    autoplay
    playsinline
    :class="{
      media: status === 'video',
      'media--hidden': status !== 'video',
      'media--orientation-landscape': status === 'video' && orientation === 'landscape',
      'media--orientation-portrait': status === 'video' && orientation === 'portrait',
      'media--orientation-unknown': status === 'video' && orientation === 'unknown',
    }"
    @click="emit('click')"
    @keypress.enter="emit('click')"
  />
</template>

<script setup lang="ts">
const { attachMediaStream } = useWebRTC()

const props = withDefaults(defineProps<{
  peer: any
  status: string
  muted?: boolean
  requestFullscreen?: string | null
}>(), {
  muted: false,
  requestFullscreen: null,
})

const emit = defineEmits<{
  click: []
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const attached = ref(false)
const orientation = ref<'unknown' | 'portrait' | 'landscape'>('unknown')

const isMuted = () => {
  return props.peer.isMuted() || props.peer.isLocal() || props.muted
}

const attachPeerStream = () => {
  if (!videoEl.value) return
  attachMediaStream(videoEl.value, props.peer.getStream(), isMuted())
  attached.value = true
}

const attachPeerStreamWhenReady = () => {
  props.peer.on('stream_ready', attachPeerStream)
  if (props.peer.isReady()) {
    attachPeerStream()
  }
}

watch(() => props.requestFullscreen, () => {
  videoEl.value?.requestFullscreen()
})

watch(() => props.muted, (newMuteStatus) => {
  if (videoEl.value) {
    videoEl.value.muted = newMuteStatus
  }
})

const updateOrientation = () => {
  if (!videoEl.value) {
    orientation.value = 'unknown'
  } else if (videoEl.value.videoWidth < videoEl.value.videoHeight) {
    orientation.value = 'portrait'
  } else {
    orientation.value = 'landscape'
  }
}

onMounted(() => {
  videoEl.value?.addEventListener('loadedmetadata', updateOrientation)
  attachPeerStreamWhenReady()
})

onBeforeUnmount(() => {
  videoEl.value?.removeEventListener('loadedmetadata', updateOrientation)
  props.peer.off('stream_ready', attachPeerStream)
})
</script>

<style lang="scss" scoped>
video {
  background: black;
}

.media--hidden {
  height: 0;
}
</style>
