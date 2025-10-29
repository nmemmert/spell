import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export interface WordItem {
  id: string
  word: string
  difficulty: number // 0-1, higher = harder
  repetitions: number
  interval: number // days
  easeFactor: number
  nextReview: Date
  lastReviewed: Date | null
  correctCount: number
  incorrectCount: number
}

export const useSpacedRepetitionStore = defineStore('spacedRepetition', () => {
  const authStore = useAuthStore()
  const words = ref<WordItem[]>([])

  const dueWords = computed(() => {
    const now = new Date()
    return words.value.filter(word => word.nextReview <= now)
  })

  const newWords = computed(() => {
    return words.value.filter(word => word.repetitions === 0)
  })

  const reviewWords = computed(() => {
    return words.value.filter(word => word.repetitions > 0)
  })

  const getNextWord = () => {
    // Prioritize due words, then new words
    const due = dueWords.value
    if (due.length > 0) {
      return due[0]
    }

    const newW = newWords.value
    if (newW.length > 0) {
      return newW[0]
    }

    return null
  }

  const processAnswer = async (wordId: string, quality: number) => {
    // quality: 0-5 (0 = complete blackout, 5 = perfect response)
    const word = words.value.find(w => w.id === wordId)
    if (!word) return

    word.lastReviewed = new Date()

    if (quality >= 3) {
      // Correct answer
      word.correctCount++
      word.repetitions++

      // SM-2 Algorithm
      if (word.repetitions === 1) {
        word.interval = 1
      } else if (word.repetitions === 2) {
        word.interval = 6
      } else {
        word.interval = Math.round(word.interval * word.easeFactor)
      }

      // Adjust ease factor
      word.easeFactor = Math.max(1.3, word.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

    } else {
      // Incorrect answer
      word.incorrectCount++
      word.repetitions = 0
      word.interval = 1
      word.easeFactor = Math.max(1.3, word.easeFactor - 0.2)
    }

    // Calculate next review date
    word.nextReview = new Date(Date.now() + word.interval * 24 * 60 * 60 * 1000)

    // Save data if user is logged in
    if (authStore.user) {
      await saveSpacedRepetitionData(authStore.user.id)
    }
  }

  const addWord = async (word: string, difficulty: number = 0.5) => {
    const newWord: WordItem = {
      id: Date.now().toString(),
      word,
      difficulty,
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
      nextReview: new Date(),
      lastReviewed: null,
      correctCount: 0,
      incorrectCount: 0
    }
    words.value.push(newWord)

    // Save data if user is logged in
    if (authStore.user) {
      await saveSpacedRepetitionData(authStore.user.id)
    }
  }

  const getStats = () => {
    const total = words.value.length
    const mastered = words.value.filter(w => w.repetitions >= 5).length
    const learning = words.value.filter(w => w.repetitions > 0 && w.repetitions < 5).length
    const newW = words.value.filter(w => w.repetitions === 0).length

    return {
      total,
      mastered,
      learning,
      new: newW,
      dueToday: dueWords.value.length
    }
  }

  const resetSpacedRepetition = () => {
    // Reset all words to initial state
    words.value.forEach(word => {
      word.repetitions = 0
      word.interval = 1
      word.easeFactor = 2.5
      word.nextReview = new Date()
      word.lastReviewed = null
      word.correctCount = 0
      word.incorrectCount = 0
    })
  }

  const loadSpacedRepetitionData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/spaced-repetition/${userId}`)
      if (response.ok) {
        const data = await response.json()
        words.value = data.map((word: any) => ({
          id: word.word_id,
          word: word.word,
          difficulty: word.difficulty,
          repetitions: word.repetitions,
          interval: word.interval_days,
          easeFactor: word.ease_factor,
          nextReview: word.next_review_date ? new Date(word.next_review_date) : new Date(),
          lastReviewed: word.last_reviewed_date ? new Date(word.last_reviewed_date) : null,
          correctCount: word.correct_count,
          incorrectCount: word.incorrect_count
        }))
      }
    } catch (error) {
      console.error('Failed to load spaced repetition data:', error)
    }
  }

  const saveSpacedRepetitionData = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/api/spaced-repetition/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(words.value.map(word => ({
          word_id: word.id,
          word: word.word,
          difficulty: word.difficulty,
          repetitions: word.repetitions,
          interval: word.interval,
          ease_factor: word.easeFactor,
          next_review: word.nextReview,
          last_reviewed: word.lastReviewed,
          correct_count: word.correctCount,
          incorrect_count: word.incorrectCount
        })))
      })
    } catch (error) {
      console.error('Failed to save spaced repetition data:', error)
    }
  }

  return {
    words,
    dueWords,
    newWords,
    reviewWords,
    getNextWord,
    processAnswer,
    addWord,
    getStats,
    resetSpacedRepetition,
    loadSpacedRepetitionData,
    saveSpacedRepetitionData
  }
})