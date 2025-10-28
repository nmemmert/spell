<template>
  <div class="spaced-repetition">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Spaced Repetition</h2>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">📚</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Words</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.total }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">✅</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Mastered</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.mastered }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">📖</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Learning</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.learning }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">⏰</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Due Today</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.dueToday }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Word -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Word</h3>
      <div class="flex gap-4">
        <input
          v-model="newWord"
          type="text"
          placeholder="Enter a word"
          class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          v-model="difficulty"
          class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="0.2">Easy</option>
          <option value="0.5">Medium</option>
          <option value="0.8">Hard</option>
        </select>
        <button
          @click="addWord"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Word
        </button>
      </div>
    </div>

    <!-- Words List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Words in System</h3>
        <div class="space-y-4">
          <div
            v-for="word in spacedRepetitionStore.words"
            :key="word.id"
            class="border rounded-lg p-4"
            :class="{
              'border-green-200 bg-green-50': word.repetitions >= 5,
              'border-yellow-200 bg-yellow-50': word.repetitions > 0 && word.repetitions < 5,
              'border-gray-200': word.repetitions === 0
            }"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-lg font-medium text-gray-900">{{ word.word }}</h4>
                <div class="mt-1 text-sm text-gray-600">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': word.repetitions >= 5,
                          'bg-yellow-100 text-yellow-800': word.repetitions > 0 && word.repetitions < 5,
                          'bg-gray-100 text-gray-800': word.repetitions === 0
                        }">
                    {{ word.repetitions >= 5 ? 'Mastered' : word.repetitions > 0 ? 'Learning' : 'New' }}
                  </span>
                  <span class="ml-2">Repetitions: {{ word.repetitions }}</span>
                  <span class="ml-2">Interval: {{ word.interval }} days</span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">
                  Correct: {{ word.correctCount }} | Incorrect: {{ word.incorrectCount }}
                </div>
                <div class="text-sm text-gray-500">
                  Next review: {{ word.nextReview.toLocaleDateString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSpacedRepetitionStore } from '../stores/spacedRepetition'

const spacedRepetitionStore = useSpacedRepetitionStore()
const stats = computed(() => spacedRepetitionStore.getStats())

const newWord = ref('')
const difficulty = ref('0.5')

const addWord = () => {
  if (newWord.value.trim()) {
    spacedRepetitionStore.addWord(newWord.value.trim(), parseFloat(difficulty.value))
    newWord.value = ''
  }
}
</script>

<style scoped>
</style>