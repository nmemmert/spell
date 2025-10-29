<template>
  <div class="analytics">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>

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
                <dd class="text-lg font-medium text-gray-900">{{ totalSessions }}</dd>
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
                <dd class="text-lg font-medium text-gray-900">{{ averageAccuracy }}%</dd>
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
                <dd class="text-lg font-medium text-gray-900">{{ averageSessionTime }} min</dd>
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
                <dd class="text-lg font-medium text-gray-900">{{ masteredWords }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  scales: {
    y: {
      beginAtZero: true,
      max: 10,
    },
  },
})

onMounted(() => {
  // Load real analytics data here
  if (authStore.user) {
    analyticsStore.loadAnalyticsData(authStore.user.id)
  }

  // Listen for reset events
  window.addEventListener('analytics-reset', () => {
    analyticsStore.resetAnalyticsData()
  })
})
</script>

<style scoped>
</style>