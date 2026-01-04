<template>
  <main
    :class="{
      party: true,
      'party--landscape': partyMode === 'landscape',
      'party--portrait': partyMode === 'portrait',
    }"
  >
    <nav class="top-control">
      <button
        type="button"
        :title="t('party.toggleControls')"
        :class="{
          'logo-control': true,
          'logo-control--active': controlsActive,
          'logo-control--inactive': !controlsActive,
        }"
        ref="logoButton"
        @click="toggleControls"
      >
        <PalavaIcon :aria-label="t('palavaLogoAlt')" role="img" />
      </button>

      <transition name="fade-control">
        <button
          type="button"
          :title="t('party.infoTitle')"
          class="control control--info"
          @click="emit('openInfoScreen', 'about')"
          v-if="controlsActive"
        >
          <InfoWithCircleIcon
            :aria-label="t('party.infoAlt')"
            role="img"
          />
        </button>
      </transition>

      <transition name="fade-control">
        <button
          type="button"
          :title="t('party.copyLinkTitle')"
          class="control control--copy-link"
          @click="copyShareLink"
          ref="copyLinkButton"
          v-if="controlsActive && canShare"
        >
          <LinkIcon
            :aria-label="t('party.copyLinkAlt')"
            role="img"
          />
        </button>
      </transition>

      <transition name="fade-control">
        <button
          type="button"
          :title="cameraOff ? t('party.turnOnCameraTitle') : t('party.turnOffCameraTitle')"
          class="control control--camera"
          @click="toggleCamera"
          v-if="controlsActive"
        >
          <VideoCameraOffIcon
            v-if="cameraOff"
            :aria-label="t('party.cameraAlt')"
            role="img"
          />
          <VideoCameraIcon
            v-else
            :aria-label="t('party.cameraAlt')"
            role="img"
          />
        </button>
      </transition>

      <transition name="fade-control">
        <button
          type="button"
          :title="microphoneMuted ? t('party.unmuteMicrophoneTitle') : t('party.muteMicrophoneTitle')"
          class="control control--microphone"
          @click="toggleMicrophone"
          v-if="controlsActive"
        >
          <MicOffIcon
            v-if="microphoneMuted"
            :aria-label="t('party.microphoneAlt')"
            role="img"
          />
          <MicIcon
            v-else
            :aria-label="t('party.microphoneAlt')"
            role="img"
          />
        </button>
      </transition>

      <transition name="fade-control">
        <button
          type="button"
          :title="t('switchLanguageTitle')"
          class="control control--switch-language"
          ref="switchLanguageButton"
          @click="switchLanguage"
          v-if="controlsActive"
        >
          <span :aria-label="t('switchLanguageAlt')">{{ locale.toUpperCase() }}</span>
        </button>
      </transition>

      <transition name="fade-control">
        <NuxtLink
          to="/"
          :title="t('party.hangUpTitle')"
          class="control control--hang-up"
          v-if="controlsActive"
        >
          <PhoneIcon
            :aria-label="t('party.hangUpAlt')"
            role="img"
          />
        </NuxtLink>
      </transition>
    </nav>

    <div
      :class="{
        stage: true,
        'stage--landscape': stageMode === 'landscape',
        'stage--portrait': stageMode === 'portrait',
      }"
      ref="stageElement"
    >
      <transition-group
        name="fade-control"
        tag="ul"
        :class="{
          spotlight: true,
          'spotlight--empty': stagePeers.length === 0,
          'spotlight--one': stagePeers.length === 1,
          'spotlight--two': stagePeers.length === 2,
          'spotlight--three': stagePeers.length === 3,
          'spotlight--four': stagePeers.length === 4,
          'spotlight--five': stagePeers.length === 5,
          'spotlight--six': stagePeers.length === 6,
        }"
      >
        <Peer
          v-for="peer in stagePeers"
          :key="peer.id"
          type="stage"
          :party-mode="partyMode"
          :stage-mode="stageMode"
          :peer="peer"
          :color-index="getColorIndex(peer)"
          @toggle-peer="togglePeer(peer)"
          @open-info-screen="(page) => emit('openInfoScreen', page)"
        />
      </transition-group>
    </div>

    <transition name="fade-control" @after-leave="onResize">
      <div class="lobby" v-if="lobbyPeers.length > 0">
        <transition-group name="fade-control" tag="ul" class="couch">
          <Peer
            v-for="peer in lobbyPeers"
            :key="peer.id"
            type="lobby"
            :party-mode="partyMode"
            :stage-mode="stageMode"
            :peer="peer"
            :color-index="getColorIndex(peer)"
            @toggle-peer="togglePeer(peer)"
            @open-info-screen="(page) => emit('openInfoScreen', page)"
          />
        </transition-group>
      </div>
    </transition>
  </main>
</template>

<script setup lang="ts">
import PalavaIcon from '~/assets/icons/palava.svg'
import InfoWithCircleIcon from '~/assets/icons/info-with-circle.svg'
import LinkIcon from '~/assets/icons/link.svg'
import VideoCameraIcon from '~/assets/icons/video-camera.svg'
import VideoCameraOffIcon from '~/assets/icons/video-camera-off.svg'
import MicIcon from '~/assets/icons/mic.svg'
import MicOffIcon from '~/assets/icons/mic-off.svg'
import PhoneIcon from '~/assets/icons/phone.svg'

const { t, locale, setLocale } = useI18n()
const config = usePalavaConfig()

const props = defineProps<{
  peers: any[]
  localPeer: any
  initialVideoEnabled: boolean
  initialAudioEnabled: boolean
}>()

const emit = defineEmits<{
  openInfoScreen: [page: string]
}>()

// Template refs
const logoButton = ref<HTMLButtonElement | null>(null)
const copyLinkButton = ref<HTMLButtonElement | null>(null)
const switchLanguageButton = ref<HTMLButtonElement | null>(null)
const stageElement = ref<HTMLDivElement | null>(null)

// State
const partyMode = ref<'landscape' | 'portrait'>('landscape')
const stageMode = ref<'landscape' | 'portrait'>('landscape')
const peersInLobby = ref<string[]>([])
const manuallyAdjustedPeers = ref<string[]>([]) // Track peers moved manually by user
const peerColors = ref<(string | null)[]>(Array(config.peerColors.length - 1).fill(null))
const controlsActive = ref(true)
const cameraOff = ref(false)
const microphoneMuted = ref(false)

// Computed
const stagePeers = computed(() => {
  return props.peers.filter((peer) => !peersInLobby.value.includes(peer.id))
})

const lobbyPeers = computed(() => {
  return props.peers.filter((peer) => peersInLobby.value.includes(peer.id))
})

const shareLink = computed(() => {
  if (import.meta.client) {
    return window.location.href
  }
  return ''
})

const canShare = computed(() => {
  if (!import.meta.client) return false
  return !!(navigator.share || (navigator.clipboard && navigator.clipboard.writeText))
})

// Methods
const togglePeer = (peer: any) => {
  // Mark this peer as manually adjusted so autoAdjustPeers won't override
  if (!manuallyAdjustedPeers.value.includes(peer.id)) {
    manuallyAdjustedPeers.value = [...manuallyAdjustedPeers.value, peer.id]
  }
  
  if (peersInLobby.value.includes(peer.id)) {
    peersInLobby.value = peersInLobby.value.filter((id) => id !== peer.id)
  } else {
    peersInLobby.value = [...peersInLobby.value, peer.id]
  }
}

const sendPeerToLobby = (peer: any) => {
  if (!peersInLobby.value.includes(peer.id)) {
    peersInLobby.value = [...peersInLobby.value, peer.id]
  }
}

const sendPeerToStage = (peer: any) => {
  if (peersInLobby.value.includes(peer.id)) {
    peersInLobby.value = peersInLobby.value.filter((id) => id !== peer.id)
  }
}

const cleanLobby = (removedPeers: any[]) => {
  const removedIds = removedPeers.map((peer) => peer.id)
  peersInLobby.value = peersInLobby.value.filter(
    (id) => !removedIds.includes(id)
  )
  // Also clean up manually adjusted tracking for removed peers
  manuallyAdjustedPeers.value = manuallyAdjustedPeers.value.filter(
    (id) => !removedIds.includes(id)
  )
}

const getColorIndex = (peer: any): number => {
  return peerColors.value.indexOf(peer.id) + 1
}

const assignColorIndexes = (introducedPeers: any[], removedPeers: any[] = []) => {
  // Remove old peers from color index list
  peerColors.value = peerColors.value.map((idOrNull) => {
    const removedPeersIds = removedPeers.map((rp) => rp.id)
    if (removedPeersIds.includes(idOrNull)) {
      return null
    }
    return idOrNull
  })

  // Assign random color index (which is not taken yet)
  introducedPeers.forEach((peer) => {
    if (!peerColors.value.includes(null)) {
      return
    }
    let newIndex = null
    do {
      newIndex = Math.floor(Math.random() * Math.floor(config.peerColors.length - 1))
    } while (peerColors.value[newIndex] !== null)
    
    peerColors.value = peerColors.value.map((idOrNull, index) => 
      index === newIndex ? peer.id : idOrNull
    )
  })
}

const autoAdjustPeers = (peers: any[]) => {
  const remotePeers = peers.filter((peer) => !peer.isLocal())
  
  if (remotePeers.length === 1) {
    // if there is only one remote peer, it should be on stage and we in the lobby
    // but only if they haven't been manually adjusted
    if (!manuallyAdjustedPeers.value.includes(props.localPeer.id)) {
      sendPeerToLobby(props.localPeer)
    }
    if (!manuallyAdjustedPeers.value.includes(remotePeers[0].id)) {
      sendPeerToStage(remotePeers[0])
    }
  } else if (remotePeers.length === 0) {
    // we are the only peer and should therefore be on stage
    // but only if we haven't been manually adjusted
    if (!manuallyAdjustedPeers.value.includes(props.localPeer.id)) {
      sendPeerToStage(props.localPeer)
    }
  } else {
    // 2+ remote peers: group call, everyone on stage (if not manually adjusted)
    if (!manuallyAdjustedPeers.value.includes(props.localPeer.id)) {
      sendPeerToStage(props.localPeer)
    }
  }
}

const toggleControls = () => {
  controlsActive.value = !controlsActive.value
  logoButton.value?.blur()
}

const copyShareLink = () => {
  if (navigator.share) {
    navigator.share({ url: shareLink.value })
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareLink.value)
  }

  copyLinkButton.value?.blur()
}

const switchLanguage = () => {
  setLocale(locale.value === 'de' ? 'en' : 'de')
  switchLanguageButton.value?.blur()
}

const toggleCamera = async () => {
  if (cameraOff.value) {
    // Want to turn on camera
    try {
      await props.localPeer.requestVideo(config.gumVideoConstraints)
      cameraOff.value = false
    } catch (error) {
      console.error('Failed to request video:', error)
    }
  } else {
    // Want to turn off camera - remove video track
    props.localPeer.disableVideo()
    cameraOff.value = true
  }
}

const toggleMicrophone = async () => {
  if (microphoneMuted.value) {
    // Want to unmute/enable audio
    try {
      await props.localPeer.requestAudio()
      microphoneMuted.value = false
    } catch (error) {
      console.error('Failed to request audio:', error)
    }
  } else {
    // Want to mute - remove audio track
    props.localPeer.disableAudio()
    microphoneMuted.value = true
  }
}

const onResize = () => {
  const partyWidth = window.innerWidth
  const partyHeight = window.innerHeight
  const stageWidth = stageElement.value?.clientWidth || 0
  const stageHeight = stageElement.value?.clientHeight || 0

  if (partyMode.value === 'landscape' && partyWidth < partyHeight) {
    partyMode.value = 'portrait'
  } else if (partyMode.value === 'portrait' && partyWidth >= partyHeight) {
    partyMode.value = 'landscape'
  }

  if (stageMode.value === 'landscape' && stageWidth < stageHeight) {
    stageMode.value = 'portrait'
  } else if (stageMode.value === 'portrait' && stageWidth >= stageHeight) {
    stageMode.value = 'landscape'
  }
}

// Lifecycle
onMounted(() => {
  // Initialize camera/mic state based on user's initial choice
  cameraOff.value = !props.initialVideoEnabled
  microphoneMuted.value = !props.initialAudioEnabled
  
  window.addEventListener('resize', onResize)
  onResize()
  assignColorIndexes(props.peers)
  autoAdjustPeers(props.peers)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})

// Watch for peer changes
watch(() => props.peers, (newPeers, oldPeers) => {
  const introducedPeers = newPeers.filter((newPeer) => !oldPeers.includes(newPeer))
  const removedPeers = oldPeers.filter((oldPeer) => !newPeers.includes(oldPeer))
  cleanLobby(removedPeers)
  assignColorIndexes(introducedPeers, removedPeers)
  autoAdjustPeers(newPeers)
})
</script>

<style lang="scss" scoped>
@use "~/assets/css/styles.scss" as *;

// Top navigation bar with logo and control buttons (info, share, camera, mic, language, hangup)
.top-control {
  position: absolute;
  z-index: 1000;
  top: calc($small-control-size / 3);
  display: flex;
  flex-direction: row;
  align-items: center;

  @media (min-width: $mobile) {
    top: calc($large-control-size / 3);
  }

  .logo-control, .control {
    margin-left: calc($small-control-size / 3);
    @media (min-width: $mobile) {
      margin-left: calc($large-control-size / 3);
    }
  }

  // Palava logo button - toggles control visibility
  .logo-control {
    height: $large-control-size;
    width: $large-control-size;
    opacity: 0.7;
    filter: grayscale(1);

    @include knobLike();
    @include focusTitle();

    @media (min-width: $mobile) {
      height: $logo-control-size;
      width: $logo-control-size;
    }

    &:focus-visible,
    &:hover {
      outline: none;
      filter: none;
      opacity: 1;

      &::after {
        top: 120%;
        left: 0;
      }
    }

    svg {
      height: 100%;
      width: 100%;
    }
  }

  // Standard control buttons (camera, mic, etc.)
  .control {
    height: $small-control-size;
    width: $small-control-size;

    @include knob();

    @media (min-width: $mobile) {
      height: $large-control-size;
      width: $large-control-size;
    }

    &:focus-visible, &:hover {
      &::after {
        top: 120%;
        left: 0;
      }
    }

    &--switch-language > * {
      font-size: calc($small-control-size / 2.2);
      text-transform: uppercase;
      transform: translate(-1px, 0px);

      @media (min-width: $mobile) {
        font-size: calc($large-control-size / 2.2);
      }
    }

    &--hang-up > * {
      filter: grayscale(0);
      transform: rotate(225deg);
      fill: red;
    }
  }

  @include fadeControl();
}

// Main container: fullscreen flex layout, direction changes based on orientation
.party {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
  background: black;
  display: flex;
  @include fadeControl();

  // Landscape: lobby on right side (column of peers)
  &--landscape {
    flex-direction: row;
    .lobby {
      height: 100%;
    }

    .lobby :deep(.peer) {
      width: $lobby-width-mobile;
      @media (min-width: $mobile-plus) {
        width: $lobby-width-mobile-plus;
      }
      @media (min-width: $desktop) {
        width: $lobby-width-desktop;
      }
      @media (min-width: $desktop-plus) {
        width: $lobby-width-desktop-plus;
      }
      @media (min-width: $desktop-large) {
        width: $lobby-width-desktop-large;
      }
      @media (min-width: $desktop-huge) {
        width: $lobby-width-desktop-huge;
      }
    }

    .lobby :deep(.peer .media) {
      width: 100%;
    }
  }

  // Portrait: lobby at bottom (row of peers)
  &--portrait {
    flex-direction: column;
    .lobby {
      width: 100%;
    }
    .lobby :deep(.peer) {
      height: $lobby-height-mobile;
      @media (min-height: $mobile-plus-height) {
        height: $lobby-height-mobile-plus;
      }
      @media (min-height: $desktop-height) {
        height: $lobby-height-desktop;
      }
      @media (min-height: $desktop-plus-height) {
        height: $lobby-height-desktop-plus;
      }
      @media (min-height: $desktop-large-height) {
        height: $lobby-height-desktop-large;
      }
      @media (min-height: $desktop-huge-height) {
        height: $lobby-height-desktop-huge;
      }
    }

    .lobby :deep(.peer .media) {
      height: 100%;
    }
  }
}

.lobby {
  overflow: hidden;
  background: #222;
  opacity: 1;
}

// Stage spotlight: layout system for 1-6 featured peers
.stage {
  flex: 1;
  overflow: hidden;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;

  .spotlight {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  :deep(.media) {
    object-fit: cover;
  }

  // 3-4 peers: 2x2 grid
  .spotlight--three,
  .spotlight--four {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 50% 50%;

    :deep(.peer .media) {
      width: 100%;
      height: 100%;
    }
  }

  // 5-6 peers: grid (columns vary by orientation)
  .spotlight--five,
  .spotlight--six {
    display: grid;
    
    :deep(.peer .media) {
      width: 100%;
      height: 100%;
    }
  }
}

// Landscape stage layouts
.stage--landscape {
  // Single peer: centered, full height
  .spotlight--empty,
  .spotlight--one {
    display: flex;
    justify-content: center;
    align-items: center;
    
    :deep(.peer) {
      height: 100%;
      max-width: 100%;
    }
    
    :deep(.peer .media) {
      height: 100%;
      max-width: 100%;
    }
  }

  // Two peers: side by side
  .spotlight--two {
    display: flex;
    align-items: center;

    :deep(.peer), :deep(.peer .media) {
      max-height: 100%;
    }
    :deep(.peer) {
      width: 50%;
    }
    :deep(.media) {
      width: 100%;
    }
  }

  // 5-6 peers: 3x2 grid
  .spotlight--five,
  .spotlight--six {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 50% 50%;
  }
}

// Portrait stage layouts
.stage--portrait {
  // Single peer: centered, full width
  .spotlight--empty,
  .spotlight--one {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    
    :deep(.peer) {
      width: 100%;
      max-height: 100%;
    }
    
    :deep(.peer .media) {
      width: 100%;
      max-height: 100%;
    }
  }

  // Two peers: stacked vertically
  .spotlight--two {
    text-align: center;
    
    :deep(.peer), :deep(.peer .media) {
      max-width: 100%;
    }
    :deep(.peer) {
      height: 50%;
    }
    :deep(.media) {
      height: 100%;
    }
  }

  // 5-6 peers: 2x3 grid
  .spotlight--five,
  .spotlight--six {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
}

.couch {
  height: 100%;
  width: 100%;
  display: flex;

  .party--portrait & {
    flex-direction: row;
    overflow-x: auto;
  }
  .party--landscape & {
    flex-direction: column;
    overflow-y: auto;
  }
  @include fadeControl();
}
</style>
