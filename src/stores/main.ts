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

    currentAudio.value.currentTime = event * currentAudio.value.duration / 100;
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
    id.value = musicId

    const audio = new Audio(DB.songs[id.value]?.path)
    currentAudio.value = audio
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

  const _applyMetaDataSong = (_id : number) => {
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
  }
})
