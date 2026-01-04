<template>
  <div class="room">
    <transition name="fade">
      <ScreenMessage :message="screenMessage" v-if="screenMessage" />
    </transition>

    <transition name="fade">
      <InfoScreen
        v-if="infoScreenIsVisible"
        :page="infoPage"
        @close="closeInfoScreen"
        @open-info-screen="openInfoScreen"
      />
    </transition>

    <!-- Media configuration screen -->
    <UserMediaConfigurator
      v-if="roomState === 'configure'"
      :error="configError"
      @join-room="joinRoom"
      @open-info-screen="openInfoScreen"
    />

    <!-- Error screen -->
    <RoomError
      v-else-if="roomState === 'error'"
      :error="errorType"
    />

    <!-- Video call party -->
    <Party
      v-else-if="roomState === 'party'"
      :peers="peers"
      :local-peer="localPeer"
      :initial-video-enabled="initialVideoEnabled"
      :initial-audio-enabled="initialAudioEnabled"
      @open-info-screen="openInfoScreen"
    />
  </div>
</template>

<script setup lang="ts">
let palava: any
if (process.client) {
  palava = await import('palava-client')
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const config = usePalavaConfig()
const logger = useLogger()

// Import components
import UserMediaConfigurator from '~/components/UserMediaConfigurator.vue'
import RoomError from '~/components/RoomError.vue'
import Party from '~/components/Party.vue'

// Import sounds
const enteringKnock = import.meta.client ? new Audio('/sounds/entering-room-knock.mp3') : null
const leavingBirds = import.meta.client ? new Audio('/sounds/leaving-room-bird.mp3') : null

// State
type RoomState = 'configure' | 'error' | 'party'
const roomState = ref<RoomState>('configure')
const configError = ref<string | null>(null)
const errorType = ref<string | null>(null)
const screenMessage = ref<string | null>(null)
const peers = ref<any[]>([])
const localPeer = ref<any | null>(null)
const infoPage = ref<string | null>(null)
const signalingState = ref<'initial' | 'connected' | 'reconnect_scheduled' | 'trying_to_reconnect'>('initial')
const soundsEnabled = ref(true)
const initialVideoEnabled = ref(true)
const initialAudioEnabled = ref(true)

let rtc: any = null

// Computed
const infoScreenIsVisible = computed(() => !!infoPage.value)

// Get room ID from route (always normalized to lowercase)
const roomId = computed(() => (route.params.roomid as string).toLowerCase())

// Set page title
useHead({
  title: computed(() => t('room.emptyTitle'))
})

// Redirect to lowercase URL if needed (case-insensitive room IDs)
const normalizeRoomIdInUrl = () => {
  const rawRoomId = route.params.roomid as string
  if (rawRoomId !== rawRoomId.toLowerCase()) {
    router.replace(`/${rawRoomId.toLowerCase()}`)
  }
}

// Methods
const catchInvalidRoomId = (id: string) => {
  if (process.client && id.length > 50) {
    router.replace(`/${id.substring(0, 50)}`)
  }
}

const showConfigure = (error: string | null = null) => {
  screenMessage.value = null
  roomState.value = 'configure'
  configError.value = error
}

const showError = (error: string) => {
  screenMessage.value = null
  roomState.value = 'error'
  errorType.value = error
}

const showParty = () => {
  screenMessage.value = null
  roomState.value = 'party'
}

const setupRtc = (rtcSession: any) => {
  rtcSession.on('webrtc_no_support', () => {
    logger.error('webrtc not supported')
    if (route.query.supported === '1') {
      return
    }
    router.push({ path: '/', query: { supported: '0' } })
  })

  rtcSession.on('signaling_not_reachable', () => {
    logger.error('signaling server not reachable')
    reconnectRtcWhenOnLine()
  })

  rtcSession.on('signaling_error', (errorType: string, error: any) => {
    logger.error('signaling error', errorType, error)
    if (errorType === 'socket' || errorType === 'missing_pongs') {
      reconnectRtcWhenOnLine()
    }
  })

  rtcSession.on('signaling_shutdown', (seconds: number) => {
    logger.warn(`Sorry, your connection will be reset in ${seconds} seconds!`)
    showError('maintenance')
  })

  rtcSession.on('local_stream_error', (error: any) => {
    logger.error('local stream error', error)
    showConfigure('local_stream_error')
  })

  rtcSession.on('local_stream_ready', (stream: MediaStream) => {
    logger.log('local stream ready', stream)
  })

  rtcSession.on('room_join_error', () => {
    logger.error('room join error (timeout)')
    showError('connection_error')
  })

  rtcSession.on('room_full', () => {
    logger.error('room full')
    showError('room_full')
  })

  rtcSession.on('room_joined', (room: any) => {
    logger.log(`room joined with ${room.getRemotePeers().length} other peers`)
    signalingState.value = 'connected'

    const allPeers = rtcSession.room.getAllPeers()

    if (allPeers.length > config.maximumPeers) {
      rtcSession.destroy()
      showError('room_full')
      return
    }

    peers.value = allPeers
    localPeer.value = rtcSession.room.getLocalPeer()
    showParty()
  })

  rtcSession.on('peer_joined', (peer: any) => {
    logger.log('peer joined', peer)
    if (soundsEnabled.value) {
      enteringKnock?.play()
    }
    peers.value = rtcSession.room.getAllPeers()
  })

  rtcSession.on('peer_stream_ready', (peer: any) => {
    logger.log('peer stream ready', peer)
  })

  rtcSession.on('peer_stream_removed', (peer: any) => {
    logger.log('peer stream removed', peer)
  })

  rtcSession.on('peer_left', (peer: any) => {
    logger.log('peer left', peer)
    if (soundsEnabled.value) {
      leavingBirds?.play()
    }
    peers.value = rtcSession.room.getAllPeers()
  })

  rtcSession.on('session_reconnect', () => {
    logger.log('trying to reconnect and rejoin room')
  })

  rtcSession.on('session_before_destroy', () => {
    logger.log('destroying rtc session')
  })

  rtcSession.on('peer_connection_pending', (peer: any) => {
    logger.log('peer connection pending', peer)
  })

  rtcSession.on('peer_connection_established', (peer: any) => {
    logger.log('peer connection established', peer)
  })

  rtcSession.on('peer_connection_disconnected', (peer: any) => {
    logger.warn('peer connection disconnected', peer)
  })

  rtcSession.on('peer_connection_closed', (peer: any) => {
    logger.warn('peer connection closed', peer)
  })

  rtcSession.on('peer_connection_failed', (peer: any) => {
    logger.error('peer connection failed', peer)
  })

  return rtcSession
}

const joinRoom = (config: { userMediaConfig: any, name: string, soundsEnabled: boolean }) => {
  screenMessage.value = t('room.waitingForUserMedia')
  soundsEnabled.value = config.soundsEnabled
  
  // Store user's initial preferences for UI state
  initialVideoEnabled.value = !!config.userMediaConfig.video
  initialAudioEnabled.value = !!config.userMediaConfig.audio

  const identity = new palava.Identity({
    userMediaConfig: config.userMediaConfig,
    name: config.name,
  })

  rtc.connect({
    identity,
  })
}

const reconnectRtcWhenOnLine = () => {
  logger.log('scheduled reconnect when online')
  if (signalingState.value !== 'initial' && signalingState.value !== 'reconnect_scheduled') {
    screenMessage.value = t('room.waitingForRoomServer')
    signalingState.value = 'reconnect_scheduled'
    window.addEventListener('online', onlineEventListener)
    if (navigator.onLine) window.dispatchEvent(new Event('online'))
  } else {
    showError('connection_error')
  }
}

const onlineEventListener = () => {
  logger.log('now online, trying to reconnect')
  window.removeEventListener('online', onlineEventListener)

  if (signalingState.value === 'reconnect_scheduled') {
    signalingState.value = 'trying_to_reconnect'
    rtc.reconnect()
  } else if (signalingState.value === 'trying_to_reconnect') {
    setTimeout(() => rtc.reconnect(), config.reconnectTimeout)
  }
}

const closeInfoScreen = () => {
  infoPage.value = null
}

const openInfoScreen = (page: string) => {
  infoPage.value = page
}

// Lifecycle
onMounted(() => {
  // Redirect to lowercase URL if user entered uppercase letters
  normalizeRoomIdInUrl()

  const currentRoomId = roomId.value
  catchInvalidRoomId(currentRoomId)

  const sessionConfig = {
    roomId: currentRoomId,
    webSocketAddress: config.env.rtcUrl || config.defaultRtcUrl,
    stun: config.env.stunUrl || config.defaultStunUrl,
    joinTimeout: config.defaultJoinTimeout,
    filterIceCandidateTypes: config.env.filterIceCandidateTypes,
  }

  if (config.env.turnUrls) {
    (sessionConfig as any).turnUrls = config.env.turnUrls
  }

  rtc = setupRtc(new palava.Session(sessionConfig))
})

onBeforeUnmount(() => {
  if (rtc) {
    rtc.destroy()
  }
})
</script>

<style lang="scss" scoped>
.room {
  height: 100%;
}

.fade-enter-active {
  transition: opacity .3s ease-in;
}

.fade-leave-active {
  transition: opacity .5s ease-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
