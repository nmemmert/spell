import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export interface UserSettings {
  autoSpeakEnabled: boolean
  speechRate: number
  speechPitch: number
  speechSpellOut: boolean
  usePuterTts: boolean
  puterEngine: 'standard' | 'neural' | 'generative'
  puterVoice: string | null
  speechVoice: string | null
  testShowDuration: number
  testAnswerTimeLimit: number
}

const defaultSettings: UserSettings = {
  autoSpeakEnabled: true,
  speechRate: 0.8,
  speechPitch: 1.0,
  speechSpellOut: false,
  usePuterTts: true,
  puterEngine: 'neural',
  puterVoice: null,
  speechVoice: null,
  testShowDuration: 3,
  testAnswerTimeLimit: 0
}

export const useUserSettingsStore = defineStore('userSettings', () => {
  const settings = ref<UserSettings>({ ...defaultSettings })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const loadSettings = async (userId: number) => {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetch(`${API_BASE}/api/settings/${userId}`)
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      settings.value = {
        autoSpeakEnabled: data.auto_speak_enabled ?? true,
        speechRate: data.speech_rate ?? 0.8,
        speechPitch: data.speech_pitch ?? 1.0,
        speechSpellOut: data.speech_spell_out ?? false,
        usePuterTts: data.use_puter_tts === null || data.use_puter_tts === undefined ? true : data.use_puter_tts,
        puterEngine: data.puter_engine ?? 'neural',
        puterVoice: data.puter_voice ?? null,
        speechVoice: data.speech_voice ?? null,
        testShowDuration: data.test_show_duration ?? 3,
        testAnswerTimeLimit: data.test_answer_time_limit ?? 0
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load settings'
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async (userId: number, updates?: Partial<UserSettings>) => {
    try {
      if (updates) {
        settings.value = { ...settings.value, ...updates }
      }
      isLoading.value = true
      error.value = null
      const response = await fetch(`${API_BASE}/api/settings/${userId}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_speak_enabled: settings.value.autoSpeakEnabled,
          speech_rate: settings.value.speechRate,
          speech_pitch: settings.value.speechPitch,
          speech_spell_out: settings.value.speechSpellOut,
          use_puter_tts: settings.value.usePuterTts,
          puter_engine: settings.value.puterEngine,
          puter_voice: settings.value.puterVoice,
          speech_voice: settings.value.speechVoice,
          test_show_duration: settings.value.testShowDuration,
          test_answer_time_limit: settings.value.testAnswerTimeLimit
        })
      })
      if (!response.ok) throw new Error('Failed to save settings')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save settings'
    } finally {
      isLoading.value = false
    }
  }

  const resetSettings = () => {
    settings.value = { ...defaultSettings }
  }

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    resetSettings
  }
})
