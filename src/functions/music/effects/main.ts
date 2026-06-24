export const fadeOutAndStop = async (audio: HTMLAudioElement, duration = 500) => {
  return new Promise<void>((resolve) => {
    const steps = 20
    const interval = duration / steps
    let currentStep = 0

    const originalVolume = audio.volume

    const fade = setInterval(() => {
      currentStep++
      const volume = originalVolume * (1 - currentStep / steps)
      audio.volume = Math.max(volume, 0)

      if (currentStep >= steps) {
        clearInterval(fade)
        audio.pause()
        audio.currentTime = 0
        audio.volume = originalVolume // вернуть громкость на будущее
        resolve()
      }
    }, interval)
  })
}
