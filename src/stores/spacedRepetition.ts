import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  const processAnswer = (wordId: string, quality: number) => {
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
  }

  const addWord = (word: string, difficulty: number = 0.5) => {
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

  return {
    words,
    dueWords,
    newWords,
    reviewWords,
    getNextWord,
    processAnswer,
    addWord,
    getStats
  }
})