<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
      <p class="text-gray-600 mb-6">Welcome back, {{ authStore.user?.name }}! You are logged in as <span class="font-medium capitalize">{{ authStore.userRole }}</span>.</p>
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-5 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">W</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Words Practiced</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ totalWords }}</dd>
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
                  <span class="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Current Streak</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ streak }} days</dd>
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
                  <span class="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Accuracy</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ accuracy }}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Points</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ points }}</dd>
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
                  <span class="text-white text-sm font-medium">SR</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Words in SR</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ wordsCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex space-x-4 mb-8">
        <router-link v-if="authStore.isAuthenticated" to="/game" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Start Spelling Game
        </router-link>
        <router-link v-if="authStore.isStudent" to="/bible-typing" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
          Bible Typing Practice
        </router-link>
        <router-link v-if="authStore.isAuthenticated" to="/gamification" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          View Achievements
        </router-link>
        <router-link v-if="authStore.isTeacher" to="/wordlists" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Manage Wordlists
        </router-link>
        <router-link v-if="authStore.isTeacher" to="/analytics" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          View Analytics
        </router-link>
        <router-link v-if="authStore.isAdmin" to="/admin" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Admin Panel
        </router-link>
        <button @click="logout" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Logout
        </button>
      </div>
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Recent Sessions</h3>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="session in recentSessions" :key="session.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-gray-900">{{ session.date }}</div>
              <div class="text-sm text-gray-500">{{ session.words }} words, {{ session.accuracy }}% accuracy</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGamificationStore } from '../stores/gamification'
import { useSpacedRepetitionStore } from '../stores/spacedRepetition'

const router = useRouter()
const authStore = useAuthStore()
const gamificationStore = useGamificationStore()
const spacedRepetitionStore = useSpacedRepetitionStore()

// Mock data
const totalWords = ref(1250)
const streak = ref(7)
const accuracy = ref(85)
const recentSessions = ref([
  { id: 1, date: '2025-10-28', words: 20, accuracy: 90 },
  { id: 2, date: '2025-10-27', words: 25, accuracy: 80 },
  { id: 3, date: '2025-10-26', words: 15, accuracy: 95 }
])

// Use stores for additional data
const points = gamificationStore.points
const wordsCount = spacedRepetitionStore.words.length

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}
.stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}
.stat {
  flex: 1;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
.actions {
  margin-bottom: 2rem;
}
button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.recent-sessions ul {
  list-style: none;
  padding: 0;
}
.recent-sessions li {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
}
</style>