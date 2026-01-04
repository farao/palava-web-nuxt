let palava
if (process.client) {
  palava = await import('palava-client')
}

export const useWebRTC = () => {
  const config = usePalavaConfig()

  const checkWebRTCSupport = (): boolean => {
    // Only check on client side (SSR-safe)
    if (!process.client) {
      return true // Assume true on server, will be checked on client
    }
    return !palava.browser.checkForWebrtcError()
  }

  const attachMediaStream = (element: HTMLMediaElement, stream: MediaStream | null, muted = false): void => {
    if (stream) {
      if (muted) {
        element.muted = true
      }
      element.srcObject = stream
      if (element.paused) {
        element.play().catch(() => {})
      }
    } else {
      if (element.srcObject) { 
        element.pause() 
      }
      element.srcObject = null
      element.muted = false
    }
  }

  const getNetworkInfo = (sdp: string) => {
    const res: any = {}

    const cLines = sdp.match(/^c=IN (?:IP4|IP6) .*$/gm)
    if (cLines) {
      res.primaryIps = cLines
        .map((cLine) => cLine.match(/^c=IN (?:IP4|IP6) (.*)$/m)?.[1])
        .filter((un, i, que) => que.indexOf(un) === i)
        .filter((ip) => ip !== "0.0.0.0")
        .map((ip) => ({
          address: ip,
          type: ip?.includes(':') ? 'IP6' : 'IP4',
        }))
    }

    const candidates = sdp.match(/^a=candidate:.+? .+? .+? .+? .+? /gm)
    if (candidates) {
      res.candidateIps = candidates
        .map((aLine) => aLine.match(/^.* (.+?) $/m)?.[1])
        .filter((un, i, que) => que.indexOf(un) === i)
        .filter((ip) => ip !== "0.0.0.0")
        .filter((ip) => res.primaryIps?.map((pip: any) => pip.address).indexOf(ip) === -1)
        .map((ip) => ({
          address: ip,
          type: ip?.includes(':') ? 'IP6' : 'IP4',
        }))
    }

    return res
  }

  const getRemoteIps = (peerConnection: RTCPeerConnection | null): string[] | null => {
    if (!peerConnection || !peerConnection.remoteDescription) { 
      return null 
    }

    const networkInfo = getNetworkInfo(peerConnection.remoteDescription.sdp)
    if (!networkInfo) { 
      return null 
    }

    return [
      ...(networkInfo.primaryIps?.map((ip: any) => ip.address) || []),
      ...(networkInfo.candidateIps?.map((ip: any) => ip.address) || []),
    ]
  }

  const getLocalIps = (peerConnection: RTCPeerConnection | null): string[] | null => {
    if (!peerConnection || !peerConnection.localDescription) { 
      return null 
    }

    const networkInfo = getNetworkInfo(peerConnection.localDescription.sdp)
    if (!networkInfo) { 
      return null 
    }

    return [
      ...(networkInfo.primaryIps?.map((ip: any) => ip.address) || []),
      ...(networkInfo.candidateIps?.map((ip: any) => ip.address) || []),
    ]
  }

  const getRelayIps = (): string[] => {
    if (!config.env.turnUrls) { 
      return [] 
    }

    return config.env.turnUrls
      .map((turnUrl) => turnUrl.match(/^(?:turn:)?(.*?)(?::\d+)?\?|$/)?.[1])
      .filter((un, i, que) => que.indexOf(un) === i)
      .filter(Boolean) as string[]
  }

  const getMyRelayStatus = (peerConnection: RTCPeerConnection): Promise<boolean | null> => {
    return peerConnection.getStats().then((stats) => {
      if (!stats) { 
        return null 
      }

      let selectedLocalCandidate: string | undefined
      const statsIterator = stats.values()
      for (let i = 0; i < stats.size; i += 1) {
        const report = statsIterator.next().value
        const { type, state, localCandidateId } = report

        if (type === 'candidate-pair' &&
            state === 'succeeded' &&
            localCandidateId) {
          selectedLocalCandidate = localCandidateId
          break
        }
      }

      return !!selectedLocalCandidate &&
             stats.get(selectedLocalCandidate)?.candidateType === 'relay'
    })
  }

  return {
    attachMediaStream,
    checkWebRTCSupport,
    getRemoteIps,
    getLocalIps,
    getRelayIps,
    getMyRelayStatus
  }
}
