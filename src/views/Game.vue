<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-4 bg-indigo-600">
          <h1 class="text-2xl font-bold text-white">{{ gameMode === 'test' ? 'Spelling Test' : 'Spelling Practice' }}</h1>
          <p v-if="currentWordlist" class="text-indigo-100 mt-1">
            {{ gameMode === 'test' ? 'Testing' : 'Practicing' }}: {{ currentWordlist.name }}
          </p>
          <p v-else class="text-indigo-100 mt-1">
            {{ gameMode === 'test' ? 'Spelling Test Mode' : 'Spaced Repetition Practice' }}
          </p>
        </div>

        <div class="p-6">
          <div v-if="!gameStarted" class="text-center">
            <div class="mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">Choose Your Game Mode</h2>
              <p class="text-gray-600 mb-4">
                {{ currentWordlist ? `Words from "${currentWordlist.name}"` : 'Words from your assigned wordlists' }}
              </p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  @click="gameMode = 'practice'"
                  :class="[
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    gameMode === 'practice' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <h3 class="font-semibold text-gray-900">Practice Mode</h3>
                  <p class="text-sm text-gray-600 mt-1">Spaced repetition learning with hints and feedback</p>
                </div>

                <div
                  @click="gameMode = 'test'"
                  :class="[
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    gameMode === 'test' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  ]"
                >
                  <h3 class="font-semibold text-gray-900">Test Mode</h3>
                  <p class="text-sm text-gray-600 mt-1">Word appears briefly, then you type what you remember</p>
                </div>
              </div>
            </div>

            <button
              @click="startGame"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Start {{ gameMode === 'test' ? 'Test' : 'Practice' }}
            </button>
          </div>

          <div v-else-if="showResults" class="text-center">
            <div class="mb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-2">{{ gameMode === 'test' ? 'Test Complete!' : 'Practice Complete!' }}</h2>
              <p class="text-gray-600 mb-4">
                You completed {{ gameResults.length }} words
                ({{ gameResults.filter(r => r.correct).length }} correct,
                {{ gameResults.filter(r => !r.correct).length }} incorrect)
              </p>

              <!-- Results Summary -->
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 class="font-medium text-gray-900 mb-3">Results Summary</h3>

                <div class="space-y-2 text-left max-w-md mx-auto">
                  <div v-for="result in gameResults" :key="result.word" class="flex items-center justify-between p-2 rounded"
                       :class="result.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
                    <div class="flex-1">
                      <span class="font-medium">{{ result.word }}</span>
                      <span v-if="!result.correct" class="text-sm ml-2">
                        → {{ result.userAnswer }}
                      </span>
                    </div>
                    <span class="ml-2" :class="result.correct ? 'text-green-600' : 'text-red-600'">
                      {{ result.correct ? '✓' : '✗' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="$router.push('/dashboard')"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Dashboard
            </button>
          </div>

          <div v-else class="space-y-6">
            <div class="text-center">
              <div class="mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  Score: {{ score }}
                </span>
              </div>

              <div v-if="gameMode !== 'test'" class="bg-gray-50 rounded-lg p-4 mb-6">
                <button
                  @click="showAudioSettings = !showAudioSettings"
                  class="flex items-center w-full text-sm font-semibold text-gray-900 hover:text-indigo-600"
                >
                  <span class="text-lg">{{ showAudioSettings ? '▼' : '▶' }}</span>
                  <span class="ml-2">Audio & Test Settings</span>
                </button>
                <div v-if="showAudioSettings" class="mt-4 text-left">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-3">
                    <label class="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        v-model="autoSpeakEnabled"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span class="ml-2">Auto-speak words</span>
                    </label>
                    <label class="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        v-model="speechSpellOut"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span class="ml-2">Spell out letters</span>
                    </label>
                    <label class="flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        v-model="usePuterTts"
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span class="ml-2">Use Puter TTS (online)</span>
                    </label>
                    <div v-if="usePuterTts">
                      <label class="block text-xs text-gray-600 mb-1">Puter engine</label>
                      <select
                        v-model="puterEngine"
                        class="block w-full border-gray-300 rounded-md text-sm"
                      >
                        <option value="standard">Standard</option>
                        <option value="neural">Neural</option>
                        <option value="generative">Generative</option>
                      </select>
                      <label class="block text-xs text-gray-600 mb-1 mt-2">Puter voice (optional, English)</label>
                      <input
                        v-model="puterVoice"
                        type="text"
                        placeholder="e.g., Joanna"
                        class="block w-full border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Speech rate ({{ speechRate.toFixed(1) }})</label>
                      <input
                        type="range"
                        min="0.6"
                        max="1.2"
                        step="0.1"
                        v-model.number="speechRate"
                        class="w-full"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-600 mb-1">Speech pitch ({{ speechPitch.toFixed(1) }})</label>
                      <input
                        type="range"
                        min="0.8"
                        max="1.4"
                        step="0.1"
                        v-model.number="speechPitch"
                        class="w-full"
                      />
                    </div>
                    <div class="border-t pt-3">
                      <button
                        @click="showVoiceSettings = !showVoiceSettings"
                        class="flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <span>{{ showVoiceSettings ? '▼' : '▶' }}</span>
                        <span class="ml-2">Advanced Voice Settings</span>
                      </button>
                      <div v-if="showVoiceSettings" class="mt-3">
                        <label class="block text-xs text-gray-600 mb-1">Voice</label>
                        <select
                          v-model="speechVoice"
                          class="block w-full border-gray-300 rounded-md text-sm"
                        >
                          <option :value="null">Auto (English)</option>
                          <option v-for="voice in englishVoiceOptions" :key="voice.name" :value="voice.name">
                            {{ voice.name }} ({{ voice.lang }})
                          </option>
                        </select>
                      </div>
                    </div>
                    </div>
                    <div v-if="gameMode === 'test'" class="space-y-3">
                      <div>
                        <label class="block text-xs text-gray-600 mb-1">Show duration (seconds)</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          v-model.number="testShowDuration"
                          class="block w-full border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label class="block text-xs text-gray-600 mb-1">Answer time limit (seconds, 0 = off)</label>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          v-model.number="testAnswerTimeLimit"
                          class="block w-full border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <p class="text-xs text-gray-500">Keyboard shortcuts: Alt+S to speak, Alt+H to reveal (if allowed).</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Test Mode: Show word briefly -->
              <div v-if="gameMode === 'test' && testPhase === 'show'" class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Memorize this word:</h3>
                <div class="text-4xl font-bold text-indigo-600 mb-4">
                  {{ currentWord }}
                </div>
                <p class="text-sm text-gray-500">Word will disappear in {{ countdown }} seconds...</p>
              </div>

              <!-- Input Phase (both modes) -->
              <div v-else class="mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ gameMode === 'test' ? 'Type the word you just saw:' : 'Spell this word:' }}
                </h3>
                <p v-if="gameMode === 'test' && testAnswerTimeLimit > 0" class="text-sm text-gray-500 mb-2">
                  Time remaining: {{ testInputRemaining }}s
                </p>
                <div v-if="gameMode === 'practice'" class="text-3xl font-bold text-indigo-600 mb-4">
                  {{ currentWord }}
                </div>
                
                <!-- Audio Controls -->
                <div class="flex justify-center gap-3 mb-4">
                  <button
                    @click="speakWord(true)"
                    :disabled="wordSpeakCount >= MAX_WORD_SPEAKS"
                    aria-label="Speak word"
                    class="inline-flex items-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    Speak Word ({{ wordSpeakCount }}/{{ MAX_WORD_SPEAKS }})
                  </button>
                  
                  <button
                    v-if="gameMode === 'test' && !wordRevealed && canShowWord"
                    @click="revealWord"
                    aria-label="Show word"
                    class="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Show Word (-2 points)
                  </button>
                </div>
                
                <!-- Revealed word for test mode -->
                <div v-if="gameMode === 'test' && wordRevealed" class="text-2xl font-bold text-yellow-600 mb-4">
                  {{ currentWord }}
                  <p class="text-sm text-yellow-700 mt-2">(-2 points penalty)</p>
                </div>
              </div>

              <div class="max-w-md mx-auto space-y-4">
                <input
                  v-model="userInput"
                  @keyup.enter="checkAnswer"
                  ref="inputRef"
                  type="text"
                  :disabled="gameMode === 'test' && testPhase === 'show' || isCheckingAnswer"
                  class="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center text-xl font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :placeholder="gameMode === 'test' && testPhase === 'show' ? 'Wait for word to disappear...' : isCheckingAnswer ? 'Checking answer...' : 'Type the word here...'"
                  autocomplete="off"
                />

                <button
                  v-if="gameMode === 'test' && testPhase === 'input'"
                  @click="checkAnswer"
                  :disabled="!userInput.trim() || isCheckingAnswer"
                  class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
                <button
                  v-else-if="gameMode === 'practice'"
                  @click="checkAnswer"
                  :disabled="!userInput.trim() || isCheckingAnswer"
                  class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              </div>

              <div v-if="feedback" class="mt-6">
                <p :class="feedback.includes('Correct') || feedback.includes('Great job') ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
                  {{ feedback }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSpacedRepetitionStore, type WordItem } from '../stores/spacedRepetition'
import { useGamificationStore } from '../stores/gamification'
import { useWordlistStore } from '../stores/wordlist'
import { useAuthStore } from '../stores/auth'
import { useAnalyticsStore } from '../stores/analytics'
import { useUserSettingsStore } from '../stores/userSettings'

declare const puter: undefined | {
  ai?: {
    txt2speech: (text: string, options?: { voice?: string; engine?: string; language?: string }) => Promise<HTMLAudioElement>
  }
}

const route = useRoute()
const spacedRepetitionStore = useSpacedRepetitionStore()
const gamificationStore = useGamificationStore()
const wordlistStore = useWordlistStore()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()
const userSettingsStore = useUserSettingsStore()

const gameStarted = ref(false)
const currentWordItem = ref<WordItem | null>(null)
const userInput = ref('')
const feedback = ref('')
const score = ref(0)
const inputRef = ref<HTMLInputElement>()
const currentWordlist = ref<any>(null)
const gameWords = ref<string[]>([])
const gameMode = ref<'practice' | 'test'>('practice' as const)
const testPhase = ref<'show' | 'input'>('show')
const currentWord = ref('')
const currentWordIndex = ref(0)
const countdown = ref(3)
const countdownTimer = ref<number | null>(null)
const gameResults = ref<Array<{
  word: string
  userAnswer: string
  correct: boolean
  wordlistId?: number
}>>([])
const showResults = ref(false)
const isCheckingAnswer = ref(false)
const wordRevealed = ref(false)
const canShowWord = computed(() => currentWordlist.value?.allowShowWord ?? true)

const MAX_WORD_SPEAKS = 3
const wordSpeakCount = ref(0)
const availableVoices = ref<SpeechSynthesisVoice[]>([])
const englishVoices = computed(() =>
  availableVoices.value.filter(voice => voice.lang?.toLowerCase().startsWith('en-'))
)

const premiumVoices = computed(() =>
  englishVoices.value.filter(voice => {
    const name = voice.name.toLowerCase()
    return (
      name.includes('premium') ||
      name.includes('enhanced') ||
      name.includes('neural') ||
      name.includes('natural') ||
      name.includes('hd') ||
      name.includes('studio') ||
      name.includes('wavenet')
    )
  })
)

const englishVoiceOptions = computed(() =>
  premiumVoices.value.length > 0 ? premiumVoices.value : englishVoices.value
)
const autoSpeakEnabled = ref(true)
const speechRate = ref(0.8)
const speechPitch = ref(1.0)
const speechSpellOut = ref(false)
const speechVoice = ref<string | null>(null)
const usePuterTts = ref(true)
const puterEngine = ref<'standard' | 'neural' | 'generative'>('neural')
const puterVoice = ref<string | null>(null)
const currentPuterAudio = ref<HTMLAudioElement | null>(null)
const testShowDuration = ref(3)
const testAnswerTimeLimit = ref(0)
const testInputRemaining = ref(0)
const testInputTimer = ref<number | null>(null)
const settingsSaveTimer = ref<number | null>(null)
const showVoiceSettings = ref(false)
const showAudioSettings = ref(false)

const loadVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  availableVoices.value = window.speechSynthesis.getVoices()
}

const applySettingsFromStore = () => {
  const settings = userSettingsStore.settings
  autoSpeakEnabled.value = settings.autoSpeakEnabled
  speechRate.value = settings.speechRate
  speechPitch.value = settings.speechPitch
  speechSpellOut.value = settings.speechSpellOut
  speechVoice.value = settings.speechVoice
  usePuterTts.value = settings.usePuterTts
  puterEngine.value = settings.puterEngine
  puterVoice.value = settings.puterVoice
  testShowDuration.value = settings.testShowDuration
  testAnswerTimeLimit.value = settings.testAnswerTimeLimit
  if (speechVoice.value && !englishVoiceOptions.value.find(v => v.name === speechVoice.value)) {
    speechVoice.value = null
  }
}

const scheduleSaveSettings = () => {
  if (!authStore.user) return
  if (settingsSaveTimer.value) {
    clearTimeout(settingsSaveTimer.value)
  }
  settingsSaveTimer.value = window.setTimeout(() => {
    userSettingsStore.saveSettings(authStore.user!.id, {
      autoSpeakEnabled: autoSpeakEnabled.value,
      speechRate: speechRate.value,
      speechPitch: speechPitch.value,
      speechSpellOut: speechSpellOut.value,
      usePuterTts: usePuterTts.value,
      puterEngine: puterEngine.value,
      puterVoice: puterVoice.value?.trim() || null,
      speechVoice: speechVoice.value,
      testShowDuration: testShowDuration.value,
      testAnswerTimeLimit: testAnswerTimeLimit.value
    })
  }, 500)
}

watch(
  [autoSpeakEnabled, speechRate, speechPitch, speechSpellOut, usePuterTts, puterEngine, puterVoice, speechVoice, testShowDuration, testAnswerTimeLimit],
  () => {
    scheduleSaveSettings()
  }
)

const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  const isTypingField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
  const key = event.key.toLowerCase()

  if (isTypingField && !event.altKey && !event.ctrlKey && !event.metaKey) return

  if (key === 's') {
    event.preventDefault()
    speakWord(true)
  }

  if (key === 'h' && canShowWord.value && gameMode.value === 'test' && !wordRevealed.value) {
    event.preventDefault()
    revealWord()
  }
}

onMounted(async () => {
  const wordlistId = route.query.wordlist as string
  const mode = route.query.mode as string

  // Set game mode
  if (mode === 'test') {
    gameMode.value = 'test'
  } else {
    gameMode.value = 'practice'
  }

  if (authStore.user) {
    await userSettingsStore.loadSettings(authStore.user.id)
    applySettingsFromStore()
  }

  if (wordlistId) {
    const wordlist = await wordlistStore.getWordlistById(parseInt(wordlistId))
    if (wordlist) {
      // Check if student is assigned to this wordlist
      if (authStore.isStudent && !wordlist.assignedStudents.includes(authStore.user?.id || 0)) {
        feedback.value = 'You are not assigned to this wordlist.'
        return
      }

      currentWordlist.value = wordlist
      gameWords.value = [...wordlist.words]

      // Add words to spaced repetition if not already there (for practice mode)
      if (gameMode.value === 'practice') {
        gameWords.value.forEach(word => {
          if (!spacedRepetitionStore.words.some(w => w.word === word)) {
            spacedRepetitionStore.addWord(word)
          }
        })
      }
    } else {
      feedback.value = 'Wordlist not found.'
    }
  } else {
    await wordlistStore.loadWordlists()
    // Default behavior - use all available words for the student
    if (authStore.isStudent) {
      const assignedWordlists = wordlistStore.getWordlistsForStudent(authStore.user?.id || 0)
      gameWords.value = assignedWordlists.flatMap(wl => wl.words)

      // Fallback: if no assigned wordlists, use default words
      if (gameWords.value.length === 0) {
        gameWords.value = [
          'hello', 'world', 'spelling', 'practice', 'learning', 'student', 'teacher', 'school', 'book', 'pencil',
          'computer', 'keyboard', 'mouse', 'screen', 'window', 'door', 'table', 'chair', 'paper', 'pen'
        ]
        feedback.value = 'No wordlists assigned. Using default practice words.'
      }
    } else {
      const allWordlists = wordlistStore.getWordlists()
      gameWords.value = allWordlists.flatMap(wl => wl.words)

      if (gameWords.value.length === 0) {
        gameWords.value = [
          'hello', 'world', 'spelling', 'practice', 'learning', 'student', 'teacher', 'school', 'book', 'pencil',
          'computer', 'keyboard', 'mouse', 'screen', 'window', 'door', 'table', 'chair', 'paper', 'pen'
        ]
        feedback.value = 'No wordlists available. Using default practice words.'
      }
    }
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadVoices()
    }
    loadVoices()
  }

  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  stopAllAudio()
  if (settingsSaveTimer.value) {
    clearTimeout(settingsSaveTimer.value)
  }
  if (testInputTimer.value) {
    clearInterval(testInputTimer.value)
    testInputTimer.value = null
  }
  window.removeEventListener('keydown', handleKeyDown)
  resetGame()
})

const startGame = () => {
  gameStarted.value = true
  currentWordIndex.value = 0
  gameResults.value = []
  score.value = 0
  showResults.value = false

  // Shuffle words for test mode to make it more challenging
  if (gameMode.value === 'test') {
    gameWords.value = [...gameWords.value].sort(() => Math.random() - 0.5)
  }

  nextWord()
}

const nextWord = () => {
  // Check if we've completed all words
  if (currentWordIndex.value >= gameWords.value.length) {
    showResults.value = true

    // Save analytics data
    if (authStore.user) {
      analyticsStore.saveAnalyticsData(authStore.user.id)
    }

    // Award achievements for completing the session
    gamificationStore.earnBadge('first-session')

    // Check for perfect score
    const totalWords = gameResults.value.length
    const correctWords = gameResults.value.filter(r => r.correct).length
    if (totalWords > 0 && correctWords === totalWords) {
      gamificationStore.earnBadge('perfect-score')
    }

    return
  }

  const word = gameWords.value[currentWordIndex.value]!
  currentWord.value = word
  currentWordItem.value = spacedRepetitionStore.words.find(w => w.word === word) || null
  wordRevealed.value = false
  wordSpeakCount.value = 0
  clearTestInputTimer()

  if (gameMode.value === 'test') {
    // Test mode: show word briefly
    testPhase.value = 'show'
    countdown.value = Math.max(1, testShowDuration.value)

    // Start countdown
    countdownTimer.value = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value)
          countdownTimer.value = null
        }
        testPhase.value = 'input'
        if (autoSpeakEnabled.value) {
          speakWord(false).catch(err => console.error('Auto-speak error:', err))
        }
        startTestInputTimer()
        
        nextTick(() => {
          inputRef.value?.focus()
        })
      }
    }, 1000)
  } else {
    // Practice mode: word stays visible
    testPhase.value = 'input'
    if (autoSpeakEnabled.value) {
      nextTick(() => {
        speakWord(false).catch(err => console.error('Auto-speak error:', err))
      })
    }
  }

  userInput.value = ''
  feedback.value = ''

  if (gameMode.value === 'practice' || testPhase.value === 'input') {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const clearTestInputTimer = () => {
  if (testInputTimer.value) {
    clearInterval(testInputTimer.value)
    testInputTimer.value = null
  }
  testInputRemaining.value = 0
}

const startTestInputTimer = () => {
  clearTestInputTimer()
  if (gameMode.value !== 'test') return
  if (testAnswerTimeLimit.value <= 0) return
  testInputRemaining.value = testAnswerTimeLimit.value
  testInputTimer.value = window.setInterval(() => {
    testInputRemaining.value--
    if (testInputRemaining.value <= 0) {
      clearTestInputTimer()
      handleTimeUp()
    }
  }, 1000)
}

const stopAllAudio = () => {
  if (currentPuterAudio.value) {
    currentPuterAudio.value.pause()
    currentPuterAudio.value = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

const speakWord = async (isManualReplay: boolean) => {
  if (!currentWord.value) return
  if (typeof window === 'undefined') return
  if (wordSpeakCount.value >= MAX_WORD_SPEAKS) return

  if (isManualReplay) {
    analyticsStore.audioReplayCount++
  }

  wordSpeakCount.value++

  const spokenText = speechSpellOut.value
    ? currentWord.value.split('').join(' ')
    : currentWord.value

  stopAllAudio()

  // Try Puter TTS first if enabled
  if (usePuterTts.value && puter?.ai?.txt2speech) {
    try {
      const audio = await puter.ai.txt2speech(spokenText, {
        engine: puterEngine.value,
        language: 'en-US',
        voice: puterVoice.value || undefined
      })
      currentPuterAudio.value = audio
      await audio.play()
      return
    } catch (error) {
      console.error('Puter TTS error:', error)
      // Fall through to browser TTS
    }
  }

  // Fallback to browser TTS
  if (!window.speechSynthesis) return

  const utterance = new SpeechSynthesisUtterance(spokenText)
  const adjustedRate = speechSpellOut.value ? Math.max(0.6, speechRate.value - 0.2) : speechRate.value
  utterance.rate = adjustedRate
  utterance.pitch = speechPitch.value
  utterance.volume = 1.0

  const voices = englishVoiceOptions.value.length > 0
    ? englishVoiceOptions.value
    : window.speechSynthesis.getVoices().filter(voice => voice.lang?.toLowerCase().startsWith('en-'))
  const preferredVoice = speechVoice.value
    ? voices.find(voice => voice.name === speechVoice.value)
    : voices.find(voice => voice.lang === 'en-US')
      || voices.find(voice => voice.lang === 'en-GB')
      || voices[0]

  if (preferredVoice) {
    utterance.voice = preferredVoice
  }

  window.speechSynthesis.speak(utterance)
}

const revealWord = () => {
  if (gameMode.value === 'test' && !wordRevealed.value && canShowWord.value) {
    wordRevealed.value = true
    analyticsStore.showWordCount++
    // Apply penalty for revealing the word
    score.value = Math.max(0, score.value - 2)
  }
}

const finalizeAnswer = async (isCorrect: boolean, timedOut = false) => {
  if (!currentWord.value || isCheckingAnswer.value) return

  isCheckingAnswer.value = true
  clearTestInputTimer()

  // Record result
  gameResults.value.push({
    word: currentWord.value,
    userAnswer: userInput.value,
    correct: isCorrect,
    wordlistId: currentWordlist.value?.id
  })

  if (isCorrect) {
    feedback.value = 'Correct!'
    score.value++

    if (gameMode.value === 'practice' && currentWordItem.value) {
      // Award points based on difficulty
      const points = Math.round(10 * (1 + currentWordItem.value.difficulty))
      gamificationStore.addPoints(points)

      // Process correct answer (quality 5 = perfect)
      await spacedRepetitionStore.processAnswer(currentWordItem.value.id, 5)
    } else {
      // Test mode or no spaced repetition data - award fixed points
      gamificationStore.addPoints(5)
    }
  } else {
    feedback.value = timedOut
      ? `Time's up. The word was ${currentWord.value}`
      : `Incorrect. The word was ${currentWord.value}`

    if (gameMode.value === 'practice' && currentWordItem.value) {
      // Process incorrect answer (quality 1 = wrong)
      await spacedRepetitionStore.processAnswer(currentWordItem.value.id, 1)
    }
  }

  // Move to next word after a delay
  currentWordIndex.value++
  setTimeout(() => {
    nextWord()
    isCheckingAnswer.value = false
  }, 2000)
}

const checkAnswer = () => {
  if (!currentWord.value || isCheckingAnswer.value) return
  const isCorrect = userInput.value.toLowerCase() === currentWord.value.toLowerCase()
  finalizeAnswer(isCorrect, false)
}

const handleTimeUp = () => {
  if (!currentWord.value || isCheckingAnswer.value) return
  finalizeAnswer(false, true)
}

const resetGame = () => {
  // Cancel any ongoing speech
  stopAllAudio()
  
  gameStarted.value = false
  currentWordItem.value = null
  currentWord.value = ''
  currentWordIndex.value = 0
  userInput.value = ''
  feedback.value = ''
  score.value = 0
  testPhase.value = 'show'
  gameResults.value = []
  showResults.value = false
  isCheckingAnswer.value = false
  wordRevealed.value = false
  wordSpeakCount.value = 0
  clearTestInputTimer()
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}
</script>

<style scoped>
.game {
  padding: 2rem;
}
input {
  padding: 0.5rem;
  margin-right: 1rem;
}
button {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>