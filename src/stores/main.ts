import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { DB } from '@/db/main'
import { fadeOutAndStop } from '@/functions/music/effects/main'
import { deleteFromArray } from '@/functions/base/main'

export const useMusicStore = defineStore('main', () => {
  const colors: Ref<{
    primary: string
    surface: string
    background: string
    onPrimary: string
    secondary: string
    tertiary: string
    outline: string
    textPrimary: string
    textSecondary: string
  }> = ref({
    primary: '#1db954',
    surface: '#282828',
    background: '#121212',
    onPrimary: '#ffffff',
    secondary: '#181818',
    tertiary: '#282828',
    outline: '#282828',
    textPrimary: '#ffffff',
    textSecondary: '#b3b3b3',
  })

  const currentPreset = ref('Flat')
  const presets = {
    Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    BassBoost: [8, 7, 6, 3, 0, -2, -4, -4, -4, -4],

    TrebleBoost: [-4, -4, -3, -2, 0, 4, 6, 8, 8, 8],

    Rock: [5, 3, -2, -3, 0, 3, 5, 6, 5, 4],

    Pop: [-1, 2, 4, 5, 3, 0, -1, -1, -1, -1],

    Electronic: [7, 6, 2, 0, -2, 2, 5, 7, 7, 6],
  }

  const name = ref<string>('No song selected')
  const author = ref<string>('')
  const imageUrl = ref<string>('')
  const title = ref<string>('No song selected')
  const id = ref<number>(0)

  const isPlaying = ref<boolean>(false)
  const progress = ref<number>(0)
  const duration = ref<string>('--/--')
  const speed = ref<number>(50)
  const volume = ref<number>(80)

  const currentAudio = ref<HTMLAudioElement | null>(null)
  const audioContext = ref<AudioContext | null>(null)
  const analyser = ref<AnalyserNode | null>(null)

  const equalizerBands = ref([
    { freq: 60, gain: 0 },
    { freq: 170, gain: 0 },
    { freq: 310, gain: 0 },
    { freq: 600, gain: 0 },
    { freq: 1000, gain: 0 },
    { freq: 3000, gain: 0 },
    { freq: 6000, gain: 0 },
    { freq: 12000, gain: 0 },
    { freq: 14000, gain: 0 },
    { freq: 16000, gain: 0 },
  ])

  const filters = ref<BiquadFilterNode[]>([])

  const initAudioGraph = (audio: HTMLAudioElement) => {
    audioContext.value ??= new AudioContext()

    const source = audioContext.value.createMediaElementSource(audio)

    filters.value = equalizerBands.value.map((band) => {
      const filter = audioContext.value!.createBiquadFilter()

      filter.type = 'peaking'
      filter.frequency.value = band.freq
      filter.gain.value = band.gain
      filter.Q.value = 1

      return filter
    })

    analyser.value = audioContext.value.createAnalyser()

    analyser.value.fftSize = 2048

    let previous: AudioNode = source

    filters.value.forEach((filter) => {
      previous.connect(filter)
      previous = filter
    })

    previous.connect(analyser.value)
    analyser.value.connect(audioContext.value.destination)
  }

  const updateBand = (index: number, gain: number) => {
    equalizerBands.value[index].gain = gain

    if (filters.value[index]) {
      filters.value[index].gain.value = gain
    }

    currentPreset.value = 'Custom'
  }

  const applyPreset = (name: keyof typeof presets) => {
    currentPreset.value = name

    presets[name].forEach((gain, index) => {
      updateBand(index, gain)
    })
  }

  const resetEqualizer = () => {
    currentPreset.value = 'Flat'

    equalizerBands.value.forEach((_, index) => {
      updateBand(index, 0)
    })
  }

  const history = ref<number[]>([])
  const queue = ref<number[]>(history.value)

  const togglePlay = () => {
    if (currentAudio.value) {
      if (isPlaying.value) {
        currentAudio.value.pause()
        isPlaying.value = false
      } else {
        currentAudio.value.play()
        isPlaying.value = true
      }
    }
  }

  const updateProgress = (event: number) => {
    console.log(progress.value)
    if (!event) return
    if (!currentAudio.value) return
    if (isPlaying.value) {
      isPlaying.value = false
    }
    console.log(progress.value)

    currentAudio.value.currentTime = (event * currentAudio.value.duration) / 100
    progress.value = event
    isPlaying.value = !isPlaying.value
  }

  const updateSpeed = (newSpeed: number): void => {
    speed.value = newSpeed
    if (!currentAudio.value) return
    currentAudio.value.playbackRate = speed.value / 50
    console.log('current speed:', speed.value)
  }

  const handlePrev = () => {
    return
  }

  const handleNext = async () => {
    queue.value = deleteFromArray(queue.value, id.value)
    history.value.push(id.value)
  }

  const play = async (musicId: number) => {
    await stop()
    id.value = musicId

    const audio = new Audio(DB.songs[id.value]?.path)
    currentAudio.value = audio
    initAudioGraph(audio)
    _applyMetaDataSong(id.value)
    await audio.play()
    togglePlay()

    audio.ontimeupdate = () => {
      _updateProgress()
    }
  }

  const stop = () => {
    return new Promise<void>(async (resolve) => {
      if (currentAudio.value) {
        await fadeOutAndStop(currentAudio.value)
        currentAudio.value.pause()
        currentAudio.value.currentTime = 0
        currentAudio.value.src = ''
        currentAudio.value.load() // сбросить плеер
        currentAudio.value = null
      }
      isPlaying.value = false
      progress.value = 0
      duration.value = '--/--'
      resolve()
    })
  }

  const updateVolume = (newVolume: number) => {
    volume.value = newVolume
    if (!currentAudio.value) return
    currentAudio.value.volume = volume.value / 100
    console.log('current volume:', volume.value)
  }

  const _updateProgress = () => {
    if (!currentAudio.value) return
    if (!isPlaying.value) return
    progress.value = (currentAudio.value.currentTime / currentAudio.value.duration) * 100
    duration.value = `${String(Math.floor(currentAudio.value.currentTime / 60)).padStart(2, '0')}:${String(Math.floor(currentAudio.value.currentTime % 60)).padStart(2, '0')}/${String(Math.floor(currentAudio.value.duration / 60)).padStart(2, '0')}:${String(Math.floor(currentAudio.value.duration % 60)).padStart(2, '0')}`
  }

  const _applyMetaDataSong = (_id: number) => {
    title.value = DB.songs[_id]?.title || ''
  }

  return {
    colors,
    isPlaying,
    togglePlay,
    name,
    author,
    imageUrl,
    title,
    progress,
    duration,
    speed,
    updateProgress,
    updateSpeed,
    handleNext,
    handlePrev,
    id,
    play,
    stop,
    volume,
    updateVolume,
    equalizerBands,
    updateBand,
    analyser,
    presets,
    applyPreset,
    currentPreset,
    resetEqualizer,
  }
})
