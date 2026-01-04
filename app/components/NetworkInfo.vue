<template>
  <aside class="network-info">
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

    <section>
      <h2>
        {{ relayStatusLocalized }}
        <button
          type="button"
          class="more-info"
          @click="emit('openInfoScreen', 'network')"
          :title="t('moreInfoTitle')"
        >
          <InfoWithCircleIcon
            :aria-label="t('moreInfoAlt')"
            role="img"
          />
        </button>
      </h2>
    </section>

    <section>
      <h3>{{ t('networkInfo.remoteIps') }}</h3>
      <ul>
        <li
          v-for="ip in allRemoteIps"
          :key="ip"
          :title="t('networkInfo.ipTitle')"
        >
          <DotSingleIcon
            :aria-label="t('networkInfo.ipAlt')"
            role="img"
          />
          {{ ip }}
          <span v-if="allRelayIps.includes(ip)"> ({{ t('networkInfo.ipIsRelay') }})</span>
        </li>
      </ul>
    </section>

    <section>
      <h3>{{ t('networkInfo.localIps') }}</h3>
      <ul>
        <li
          v-for="ip in allLocalIps"
          :key="ip"
          :title="t('networkInfo.ipTitle')"
        >
          <DotSingleIcon
            :aria-label="t('networkInfo.ipAlt')"
            role="img"
          />
          {{ ip }}
          <span v-if="allRelayIps.includes(ip)"> ({{ t('networkInfo.ipIsRelay') }})</span>
        </li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import CrossIcon from '~/assets/icons/cross.svg'
import InfoWithCircleIcon from '~/assets/icons/info-with-circle.svg'
import DotSingleIcon from '~/assets/icons/dot-single.svg'

const {
  getRemoteIps,
  getLocalIps,
  getRelayIps,
  getMyRelayStatus,
} = useWebRTC()

const { t } = useI18n()

const props = defineProps<{
  peer: any
}>()

const emit = defineEmits<{
  close: []
  openInfoScreen: [page: string]
}>()

const relayStatus = ref<'relayed' | 'direct' | null>(null)

const allLocalIps = computed(() => getLocalIps(props.peer.peerConnection))
const allRemoteIps = computed(() => getRemoteIps(props.peer.peerConnection))
const allRelayIps = computed(() => getRelayIps())

const relayStatusLocalized = computed(() => {
  if (relayStatus.value === 'relayed') {
    return t('networkInfo.relayedConnection')
  }
  if (relayStatus.value === 'direct') {
    return t('networkInfo.directConnection')
  }
  return t('networkInfo.unknownConnection')
})

onMounted(async () => {
  if (!props.peer.peerConnection) return

  const iAmRelayed = await getMyRelayStatus(props.peer.peerConnection)
  if (iAmRelayed) {
    relayStatus.value = 'relayed'
  } else if (allRemoteIps.value.some((ip) => allRelayIps.value.includes(ip))) {
    relayStatus.value = 'relayed'
  } else {
    relayStatus.value = 'direct'
  }
})
</script>

<style lang="scss" scoped>
@use '~/assets/css/styles' as *;

.network-info {
  position: absolute;
  z-index: 700;
  padding: 7px 8px 1px;
  text-align: left;
  font-size: 12px;
  line-height: 16px;
  background: white;
  opacity: 0.8;
  color: $action-1;

  @include lightShadow();

  @media (min-width: $mobile) {
    font-size: 13px;
    line-height: 18px;
  }
  @media (min-width: $mobile-plus) {
    font-size: 14px;
    line-height: 20px;
  }
  @media (min-width: $desktop) {
    font-size: 15px;
    line-height: 21px;
  }
  @media (min-width: $desktop-plus) {
    font-size: 16px;
    line-height: 22px;
  }
  @media (min-width: $desktop-large) {
    font-size: 17px;
    line-height: 23px;
  }
  @media (min-width: $desktop-huge) {
    font-size: 18px;
    line-height: 24px;
  }

  li {
    white-space: nowrap;
    svg {
      fill: currentColor;
      width: 1em;
      height: 1em;
      cursor: default;
      user-select: none;
      margin-right: 3px;
    }
  }

  button {
    @include inlineButton();
  }

  .close {
    @include closeButton(20px);
  }

  .more-info {
    & > * {
      width: 16px;
      height: 16px;
      fill: red;
    }
  }

  h2, h3 {
    font-weight: bold;
    cursor: default;
    margin-bottom: 4px;
  }

  section {
    margin-bottom: 7px;
  }
}
</style>
