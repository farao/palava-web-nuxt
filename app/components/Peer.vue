<template>
  <li
    :class="{
      peer: true,
      'peer--is-local': peer.isLocal(),
      'peer--is-remote': !peer.isLocal(),
      'peer--is-ready': peer.isReady(),
      'peer--not-ready': !peer.isReady(),
      'peer--has-audio': peer.hasAudio(),
      'peer--has-no-audio': !peer.hasAudio(),
      'peer--text-only': !peer.hasAudio() && !peer.hasVideo(),
      'peer--muted-by-user': muted,
      'peer--has-media': peer.hasVideo(),
      'peer--has-no-video': !peer.hasVideo(),
      'peer--has-error': peer.hasError(),
      'peer--in-lobby': type === 'lobby',
      'peer--on-stage': type === 'stage',
      'peer--party-landscape': partyMode === 'landscape',
      'peer--party-portrait': partyMode === 'portrait',
      'peer--stage-landscape': stageMode === 'landscape',
      'peer--stage-portrait': stageMode === 'portrait',
    }"
  >
    <transition name="fade-control">
      <NetworkInfo
        v-if="networkInfoActive"
        @close="hideNetworkInfo()"
        @open-info-screen="(page) => emit('openInfoScreen', page)"
        :peer="peer"
      />
    </transition>

    <PeerStatus
      v-if="status !== 'video'"
      :status="status"
      :error="peer.error"
      @click="togglePeerMenu()"
    />

    <span v-if="peerName" class="peer-name">{{ peerName }}</span>

    <div class="frame">
      <Placeholder
        v-if="status !== 'video' || !videoReady"
        :peer="peer"
        :color-index="colorIndex"
        :class="{ 'placeholder--hidden': status === 'video' && !videoReady }"
        @click="togglePeerMenu()"
      />
      <Stream
        v-if="status === 'video' || status === 'audio'"
        :peer="peer"
        :status="status"
        :request-fullscreen="requestFullscreen"
        :muted="muted"
        :class="{ 'stream--loading': status === 'video' && !videoReady }"
        @click="togglePeerMenu()"
        @video-ready="videoReady = true"
      />
      <nav
        :class="{
          'peer-menu': true,
          'peer-menu--in-lobby': type === 'lobby',
          'peer-menu--on-stage': type === 'stage',
        }"
      >
        <transition name="fade-control">
          <button
            type="button"
            :title="t('peer.toggleEnlargeTitle')"
            class="menu-control menu-control--toggle"
            v-if="peerMenuActive && type === 'lobby'"
            @click="togglePeer()"
          >
            <LevelUpIcon
              :aria-label="t('peer.toggleEnlargeAlt')"
              role="img"
            />
          </button>
        </transition>

        <transition name="fade-control">
          <button
            type="button"
            :title="t('peer.toggleMinimizeTitle')"
            class="menu-control menu-control--toggle"
            v-if="peerMenuActive && type === 'stage'"
            @click="togglePeer()"
          >
            <LevelDownIcon
              :aria-label="t('peer.toggleMinimizeAlt')"
              role="img"
            />
          </button>
        </transition>

        <transition name="fade-control">
          <button
            type="button"
            :title="t('peer.fullScreenTitle')"
            class="menu-control menu-control--full-screen"
            v-if="peerMenuActive && status === 'video'"
            @click="makePeerFullScreen()"
          >
            <ResizeFullScreenIcon
              :aria-label="t('peer.fullScreenAlt')"
              role="img"
            />
          </button>
        </transition>

        <transition name="fade-control">
          <button
            type="button"
            :title="t('peer.networkInfoTitle')"
            class="menu-control menu-control--network-info"
            ref="networkInfoButton"
            v-if="peerMenuActive && !peer.isLocal()"
            @click="toggleNetworkInfo()"
          >
            <NetworkIcon
              :aria-label="t('peer.networkInfoAlt')"
              role="img"
            />
          </button>
        </transition>

        <transition name="fade-control">
          <button
            type="button"
            :title="muted ? t('peer.unmuteAudioTitle') : t('peer.muteAudioTitle')"
            :class="{
              'menu-control': true,
              'menu-control--mute': !muted,
              'menu-control--unmute': muted,
            }"
            ref="muteButton"
            v-if="peerMenuActive && !peer.isLocal() && peer.hasAudio() && !peer.hasError()"
            @click="toggleMute()"
          >
            <VolumeOffIcon
              v-if="muted"
              :aria-label="t('peer.mutedAudioAlt')"
              role="img"
            />
            <VolumeUpIcon
              v-else
              :aria-label="t('peer.withAudioAlt')"
              role="img"
            />
          </button>
        </transition>
      </nav>
    </div>
  </li>
</template>

<script setup lang="ts">
import LevelUpIcon from '~/assets/icons/level-up.svg'
import LevelDownIcon from '~/assets/icons/level-down.svg'
import ResizeFullScreenIcon from '~/assets/icons/resize-full-screen.svg'
import NetworkIcon from '~/assets/icons/network.svg'
import VolumeOffIcon from '~/assets/icons/volume-off.svg'
import VolumeUpIcon from '~/assets/icons/volume-up.svg'

const { t } = useI18n()

const props = defineProps<{
  peer: any
  colorIndex: number
  type: 'lobby' | 'stage'
  partyMode: 'landscape' | 'portrait'
  stageMode: 'landscape' | 'portrait'
}>()

const emit = defineEmits<{
  togglePeer: []
  openInfoScreen: [page: string]
}>()

// Template refs
const networkInfoButton = ref<HTMLButtonElement | null>(null)
const muteButton = ref<HTMLButtonElement | null>(null)

// State
const muted = ref(false)
const peerMenuActiveInLobby = ref(true)
const requestFullscreen = ref<string | null>(null)
const networkInfoActive = ref(false)
const status = ref<'error' | 'not-ready' | 'video' | 'audio' | 'no-media'>('not-ready')
const videoReady = ref(false)

// Computed
const peerMenuActive = computed(() => {
  return peerMenuActiveInLobby.value
})

const peerName = computed(() => {
  return props.peer.status?.name || ''
})

const updateStatus = () => {
  const oldStatus = status.value
  
  if (props.peer.error) {
    status.value = 'error'
  } else if (!props.peer.isReady()) {
    status.value = 'not-ready'
  } else if (props.peer.hasVideo()) {
    status.value = 'video'
  } else if (props.peer.hasAudio()) {
    status.value = 'audio'
  } else {
    status.value = 'no-media'
  }
  
  // Reset videoReady when transitioning away from video status
  if (oldStatus === 'video' && status.value !== 'video') {
    videoReady.value = false
  }
}

onMounted(() => {
  updateStatus()
  props.peer.on('stream_ready', updateStatus)
  props.peer.on('stream_removed', updateStatus)
  props.peer.on('error', updateStatus)
  // Listen for dynamically added/removed video/audio tracks
  props.peer.on('video_added', updateStatus)
  props.peer.on('audio_added', updateStatus)
  props.peer.on('video_removed', updateStatus)
  props.peer.on('audio_removed', updateStatus)
})

onBeforeUnmount(() => {
  props.peer.off('stream_ready', updateStatus)
  props.peer.off('stream_removed', updateStatus)
  props.peer.off('error', updateStatus)
  props.peer.off('video_added', updateStatus)
  props.peer.off('audio_added', updateStatus)
  props.peer.off('video_removed', updateStatus)
  props.peer.off('audio_removed', updateStatus)
})

// Methods
const togglePeerMenu = () => {
  peerMenuActiveInLobby.value = !peerMenuActiveInLobby.value
}

const togglePeer = () => {
  emit('togglePeer')
}

const makePeerFullScreen = () => {
  requestFullscreen.value = crypto.randomUUID()
}

const toggleMute = () => {
  muted.value = !muted.value
  muteButton.value?.blur()
}

const toggleNetworkInfo = () => {
  networkInfoActive.value = !networkInfoActive.value
  networkInfoButton.value?.blur()
}

const hideNetworkInfo = () => {
  networkInfoActive.value = false
}
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles" as *;

// Peer container: represents a single participant in the video call
// State classes (--is-local, --on-stage, etc.) are applied dynamically via template
.peer {
  width: auto;
  height: auto;
  box-sizing: border-box;
  font-size: 0;
  opacity: 1;
  position: relative;

  @include fadeControl();

  // Frame wraps the video/placeholder content
  .frame {
    display: block;
    position: relative;
    width: 100%;
    height: 100%;
  }

  // Video element constraints - let parent containers control actual sizing
  :deep(.media) {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
  }

  // Mirror local video so user sees themselves as in a mirror
  &--is-local {
    :deep(video) {
      transform: scale(-1, 1);
    }
  }

  // Loading spinner sizing based on context (smaller in lobby, larger on stage)
  &--in-lobby {
    :deep(.lds-grid) {
      transform: scale(80%);
    }
  }

  &--on-stage {
    :deep(.lds-grid) {
      transform: scale(120%);
    }
  }

  // NetworkInfo popup positioning - anchored relative to peer location
  &--on-stage {
    :deep(.network-info) {
      bottom: 60px;
      left: calc(50% - 150px);
    }
  }

  // Lobby NetworkInfo positioning - offset from lobby edge to avoid overlap
  &--in-lobby {
    &.peer--party-landscape :deep(.network-info) {
      right: $lobby-width-mobile + $small-spacing;
      @media (min-width: $mobile-plus)  { right: $lobby-width-mobile-plus + $small-spacing; }
      @media (min-width: $desktop)      { right: $lobby-width-desktop + $small-spacing; }
      @media (min-width: $desktop-plus) { right: $lobby-width-desktop-plus + $small-spacing; }
      @media (min-width: $desktop-large){ right: $lobby-width-desktop-large + $small-spacing; }
      @media (min-width: $desktop-huge) { right: $lobby-width-desktop-huge + $small-spacing; }
    }

    &.peer--party-portrait :deep(.network-info) {
      bottom: $lobby-height-mobile + $small-spacing;
      @media (min-height: $mobile-plus-height)  { bottom: $lobby-height-mobile-plus + $small-spacing; }
      @media (min-height: $desktop-height)      { bottom: $lobby-height-desktop + $small-spacing; }
      @media (min-height: $desktop-plus-height) { bottom: $lobby-height-desktop-plus + $small-spacing; }
      @media (min-height: $desktop-large-height){ bottom: $lobby-height-desktop-large + $small-spacing; }
      @media (min-height: $desktop-huge-height) { bottom: $lobby-height-desktop-huge + $small-spacing; }
    }
  }
}

// Peer name label: displayed in bottom-left corner, visible on any background
.peer-name {
  position: absolute;
  bottom: $small-spacing;
  left: $small-spacing;
  z-index: 400;
  
  padding: 2px 8px;
  font-size: 14px;
  line-height: 1.4;
  
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  
  pointer-events: none;
  max-width: calc(100% - #{$small-spacing * 2});
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (min-width: $mobile) {
    font-size: 15px;
    bottom: $small-plus-spacing;
    left: $small-plus-spacing;
  }

  @media (min-width: $desktop) {
    font-size: 16px;
    bottom: $medium-spacing;
    left: $medium-spacing;
  }
}

// Peer action menu: overlay controls for mute, fullscreen, toggle stage/lobby, etc.
// Positioned at bottom-right of peer, with controls flowing right-to-left
.peer-menu {
  position: absolute;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row-reverse;
  flex-wrap: wrap-reverse;
  left: 0px;
  right: 0px;
  @include fadeControl();

  .menu-control {
    @include knob();
    &:focus, &:hover {
      &::after {
        bottom: 120%;
        right: 0;
      }
    }
  }

  // Lobby: smaller controls due to limited space
  &--in-lobby {
    bottom: calc($small-control-size / 8);
    right: calc($small-control-size / 8);
    .menu-control {
      height: $small-control-size;
      width: $small-control-size;
      font-size: calc($small-control-size / 2);
      margin: calc($small-control-size / 8);

      & > * {
        padding: 2px;
      }
    }
  }

  // Stage: larger controls, responsive sizing
  &--on-stage {
    bottom: calc($small-control-size / 8);
    right: calc($small-control-size / 8);
    @media (min-width: $mobile) {
      bottom: calc($large-control-size / 8);
      right: calc($large-control-size / 8);
    }

    .menu-control {
      height: $small-control-size;
      width: $small-control-size;
      margin: calc($small-control-size / 8);
      @media (min-width: $mobile) {
        height: $large-control-size;
        width: $large-control-size;
        margin: calc($large-control-size / 8);
      }
    }
  }
}

// Placeholder hidden state: keeps layout but invisible while video loads
.placeholder--hidden {
  visibility: hidden;
  position: absolute;
}

// Stream loading state: hidden until video metadata is ready
.stream--loading {
  position: absolute;
  opacity: 0;
}
</style>
