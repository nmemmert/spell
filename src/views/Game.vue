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
                <div v-if="gameMode === 'practice'" class="text-3xl font-bold text-indigo-600 mb-4">
                  {{ currentWord }}
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
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useSpacedRepetitionStore, type WordItem } from '../stores/spacedRepetition'
import { useGamificationStore } from '../stores/gamification'
import { useWordlistStore } from '../stores/wordlist'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const spacedRepetitionStore = useSpacedRepetitionStore()
const gamificationStore = useGamificationStore()
const wordlistStore = useWordlistStore()
const authStore = useAuthStore()

const gameStarted = ref(false)
const currentWordItem = ref<WordItem | null>(null)
const userInput = ref('')
const feedback = ref('')
const score = ref(0)
const inputRef = ref<HTMLInputElement>()
const currentWordlist = ref<any>(null)
const gameWords = ref<string[]>([])
const gameMode = ref<'practice' | 'test'>('practice')
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

onMounted(async () => {
  const wordlistId = route.query.wordlist as string
  const mode = route.query.mode as string

  // Set game mode
  if (mode === 'test') {
    gameMode.value = 'test'
  } else {
    gameMode.value = 'practice'
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
    }
  }
})

onBeforeUnmount(() => {
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

  if (gameMode.value === 'test') {
    // Test mode: show word briefly
    testPhase.value = 'show'
    countdown.value = 3

    // Start countdown
    countdownTimer.value = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value)
          countdownTimer.value = null
        }
        testPhase.value = 'input'
        nextTick(() => {
          inputRef.value?.focus()
        })
      }
    }, 1000)
  } else {
    // Practice mode: word stays visible
    testPhase.value = 'input'
  }

  userInput.value = ''
  feedback.value = ''

  if (gameMode.value === 'practice' || testPhase.value === 'input') {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

const checkAnswer = () => {
  if (!currentWord.value || isCheckingAnswer.value) return

  isCheckingAnswer.value = true

  const isCorrect = userInput.value.toLowerCase() === currentWord.value.toLowerCase()

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
      spacedRepetitionStore.processAnswer(currentWordItem.value.id, 5)
    } else {
      // Test mode or no spaced repetition data - award fixed points
      gamificationStore.addPoints(5)
    }

  } else {
    feedback.value = `Incorrect. The word was ${currentWord.value}`

    if (gameMode.value === 'practice' && currentWordItem.value) {
      // Process incorrect answer (quality 1 = wrong)
      spacedRepetitionStore.processAnswer(currentWordItem.value.id, 1)
    }
  }

  // Move to next word after a delay
  currentWordIndex.value++
  setTimeout(() => {
    nextWord()
    isCheckingAnswer.value = false
  }, 2000)
}

const resetGame = () => {
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