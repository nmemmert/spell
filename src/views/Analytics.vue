<template>
  <div class="analytics">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

    <div v-if="authStore.isTeacher" class="bg-white shadow rounded-lg p-6 mb-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900">Student Analytics</h3>
          <p class="text-sm text-gray-500">View aggregated stats or select a student for detailed charts.</p>
        </div>
        <div class="w-full md:w-64">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
          <select
            v-model="selectedStudentId"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Students</option>
            <option v-for="student in studentAnalytics" :key="student.user_id" :value="student.user_id">
              {{ student.name }} ({{ student.email }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Progress Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span class="text-white text-sm font-medium">📈</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                <dd class="text-lg font-medium text-gray-900">{{ displayTotalSessions }}</dd>
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
                <span class="text-white text-sm font-medium">🎯</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Average Accuracy</dt>
                <dd class="text-lg font-medium text-gray-900">{{ displayAverageAccuracy }}%</dd>
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
                <span class="text-white text-sm font-medium">⏱️</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Avg Session Time</dt>
                <dd class="text-lg font-medium text-gray-900">{{ displayAverageSessionTime }} min</dd>
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
                <span class="text-white text-sm font-medium">📚</span>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Words Mastered</dt>
                <dd class="text-lg font-medium text-gray-900">{{ displayMasteredWords }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="authStore.isTeacher" class="bg-white shadow rounded-lg p-6 mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">All Students Summary</h3>
      <div v-if="studentAnalytics.length > 0" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mastered</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in studentAnalytics" :key="student.user_id">
              <td class="px-4 py-2 text-sm text-gray-900">
                <div class="font-medium">{{ student.name }}</div>
                <div class="text-gray-500">{{ student.email }}</div>
              </td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ student.total_sessions }}</td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ student.average_accuracy }}%</td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ student.average_session_time }} min</td>
              <td class="px-4 py-2 text-sm text-gray-900">{{ student.mastered_words }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="text-sm text-gray-500">No student analytics available yet.</p>
    </div>

    <!-- Charts -->
    <div v-if="!authStore.isTeacher || selectedStudentId !== 'all'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Progress Over Time -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Progress Over Time</h3>
        <Line :data="progressData" :options="chartOptions" />
      </div>

      <!-- Word Difficulty Distribution -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Word Difficulty Distribution</h3>
        <Doughnut :data="difficultyData" :options="doughnutOptions" />
      </div>

      <!-- Session Performance -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Session Performance</h3>
        <Bar :data="sessionData" :options="chartOptions" />
      </div>

      <!-- Learning Streaks -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Learning Streaks</h3>
        <Line :data="streakData" :options="streakOptions" />
      </div>
    </div>
    <div v-else class="bg-white shadow rounded-lg p-6">
      <p class="text-sm text-gray-600">Select a student to view detailed charts.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { useAnalyticsStore } from '../stores/analytics'
import { useAuthStore } from '../stores/auth'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

interface StudentAnalytics {
  user_id: number
  name: string
  email: string
  role: string
  total_sessions: number
  average_accuracy: number
  average_session_time: number
  mastered_words: number
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const analyticsStore = useAnalyticsStore()
const authStore = useAuthStore()

// Use reactive refs from the store
const totalSessions = analyticsStore.totalSessions
const averageAccuracy = analyticsStore.averageAccuracy
const averageSessionTime = analyticsStore.averageSessionTime
const masteredWords = analyticsStore.masteredWords
const progressData = analyticsStore.progressData
const difficultyData = analyticsStore.difficultyData
const sessionData = analyticsStore.sessionData
const streakData = analyticsStore.streakData

const studentAnalytics = ref<StudentAnalytics[]>([])
const selectedStudentId = ref<'all' | number>('all')

const displayTotalSessions = computed(() => {
  if (!authStore.isTeacher || selectedStudentId.value !== 'all') return totalSessions.value
  return studentAnalytics.value.reduce((sum, s) => sum + (s.total_sessions || 0), 0)
})

const displayAverageAccuracy = computed(() => {
  if (!authStore.isTeacher || selectedStudentId.value !== 'all') return averageAccuracy.value
  const withData = studentAnalytics.value.filter(s => (s.total_sessions || 0) > 0)
  if (withData.length === 0) return 0
  const sum = withData.reduce((acc, s) => acc + (s.average_accuracy || 0), 0)
  return Math.round(sum / withData.length)
})

const displayAverageSessionTime = computed(() => {
  if (!authStore.isTeacher || selectedStudentId.value !== 'all') return averageSessionTime.value
  const withData = studentAnalytics.value.filter(s => (s.total_sessions || 0) > 0)
  if (withData.length === 0) return 0
  const sum = withData.reduce((acc, s) => acc + (s.average_session_time || 0), 0)
  return Math.round(sum / withData.length)
})

const displayMasteredWords = computed(() => {
  if (!authStore.isTeacher || selectedStudentId.value !== 'all') return masteredWords.value
  return studentAnalytics.value.reduce((sum, s) => sum + (s.mastered_words || 0), 0)
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
})

const doughnutOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
})

const streakOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
})

const loadStudentAnalytics = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/analytics?role=student`)
    if (response.ok) {
      studentAnalytics.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load student analytics:', error)
  }
}

watch(selectedStudentId, (value) => {
  if (!authStore.isTeacher) return
  if (value === 'all') return
  const studentId = typeof value === 'string' ? parseInt(value, 10) : value
  if (!Number.isNaN(studentId)) {
    analyticsStore.loadAnalyticsData(studentId)
  }
})

const handleAnalyticsReset = () => {
  analyticsStore.resetAnalyticsData()
}

onMounted(() => {
  if (authStore.isTeacher) {
    loadStudentAnalytics()
    if (selectedStudentId.value !== 'all') {
      const studentId = typeof selectedStudentId.value === 'string'
        ? parseInt(selectedStudentId.value, 10)
        : selectedStudentId.value
      if (!Number.isNaN(studentId)) {
        analyticsStore.loadAnalyticsData(studentId)
      }
    }
  } else if (authStore.user) {
    analyticsStore.loadAnalyticsData(authStore.user.id)
  }

  // Listen for reset events
  window.addEventListener('analytics-reset', handleAnalyticsReset)
})

onUnmounted(() => {
  window.removeEventListener('analytics-reset', handleAnalyticsReset)
})
</script>

<style scoped>
</style>