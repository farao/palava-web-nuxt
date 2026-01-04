export const usePalavaConfig = () => {
  const runtimeConfig = useRuntimeConfig()
  
  return {
    env: {
      rtcUrl: runtimeConfig.public.rtcUrl,
      stunUrl: runtimeConfig.public.stunUrl,
      turnUrls: runtimeConfig.public.turnUrls ? 
        runtimeConfig.public.turnUrls.split(',') : undefined,
      filterIceCandidateTypes: runtimeConfig.public.filterIceCandidateTypes ?
        runtimeConfig.public.filterIceCandidateTypes.split(',') : undefined,
    },
    defaultRtcUrl: 'ws://localhost:4233',
    defaultStunUrl: 'stun:stun.palava.tv',
    defaultJoinTimeout: 3000,
    gumVideoConstraints: {
      facingMode: 'user',
      width: 1280,
      height: 720,
    },
    reconnectTimeout: 1000,
    maximumPeers: 6,
    peerColors: [
      'transparent',
      '#ffe6c0',
      '#ffc0cb',
      '#c0dcff',
      '#caa5a5',
      '#c0d8c3',
      '#e5dcf5',
      '#989898',
      '#fffdc0',
      '#eaeaea',
      '#8ad7e8',
    ]
  }
}
