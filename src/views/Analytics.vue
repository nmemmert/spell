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

// Load data from localStorage or use defaults
const totalSessions = ref(parseInt(localStorage.getItem('analytics_sessions') || '45'))
const averageAccuracy = ref(parseInt(localStorage.getItem('analytics_accuracy') || '78'))
const averageSessionTime = ref(parseInt(localStorage.getItem('analytics_session_time') || '12'))
const masteredWords = ref(parseInt(localStorage.getItem('analytics_mastered_words') || '234'))

const progressData = ref(JSON.parse(localStorage.getItem('analytics_progress_data') || JSON.stringify({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Accuracy %',
      data: [65, 70, 75, 80, 78, 82],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
    {
      label: 'Words Learned',
      data: [20, 45, 78, 120, 156, 190],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    },
  ],
})))

const difficultyData = ref(JSON.parse(localStorage.getItem('analytics_difficulty_data') || JSON.stringify({
  labels: ['Easy', 'Medium', 'Hard', 'Very Hard'],
  datasets: [
    {
      data: [45, 30, 20, 5],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderWidth: 1,
    },
  ],
})))

const sessionData = ref(JSON.parse(localStorage.getItem('analytics_session_data') || JSON.stringify({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Words Practiced',
      data: [25, 30, 20, 35, 28, 15, 22],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    },
    {
      label: 'Correct Answers',
      data: [20, 25, 18, 30, 24, 12, 18],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    },
  ],
})))

const streakData = ref(JSON.parse(localStorage.getItem('analytics_streak_data') || JSON.stringify({
  labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
  datasets: [
    {
      label: 'Daily Streak',
      data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 1),
      borderColor: 'rgb(168, 85, 247)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      tension: 0.4,
    },
  ],
})))

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
  loadAnalyticsData()

  // Listen for reset events
  window.addEventListener('analytics-reset', () => {
    resetAnalyticsToDefaults()
  })
})

const loadAnalyticsData = () => {
  // Data is already loaded from localStorage in the ref initializers
}

const resetAnalyticsToDefaults = () => {
  totalSessions.value = 45
  averageAccuracy.value = 78
  averageSessionTime.value = 12
  masteredWords.value = 234

  progressData.value = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Accuracy %',
        data: [65, 70, 75, 80, 78, 82],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Words Learned',
        data: [20, 45, 78, 120, 156, 190],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  }

  difficultyData.value = {
    labels: ['Easy', 'Medium', 'Hard', 'Very Hard'],
    datasets: [
      {
        data: [45, 30, 20, 5],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  }

  sessionData.value = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Words Practiced',
        data: [25, 30, 20, 35, 28, 15, 22],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Correct Answers',
        data: [20, 25, 18, 30, 24, 12, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  }

  streakData.value = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Daily Streak',
        data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 1),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  }
}
</script>

<style scoped>
</style>