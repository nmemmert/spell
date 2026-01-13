<template>
  <div v-if="canView" class="user-data-view">
    <h2>All User Achievements and Analytics</h2>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <div v-for="user in users" :key="user.id" class="user-card">
        <h3>{{ user.name }} ({{ user.email }}) - {{ user.role }}</h3>
        <div>
          <h4>Achievements</h4>
          <ul>
            <li v-for="ach in user.achievements" :key="ach.id">
              {{ ach.achievement_id }}: {{ ach.completed ? 'Completed' : 'In Progress' }} (Progress: {{ ach.progress }}/{{ ach.target }})
            </li>
          </ul>
        </div>
        <div>
          <h4>Analytics</h4>
          <p>Total Sessions: {{ user.analytics?.total_sessions || 0 }}</p>
          <p>Average Accuracy: {{ user.analytics?.average_accuracy || 0 }}%</p>
          <p>Average Session Time: {{ user.analytics?.average_session_time || 0 }} min</p>
          <p>Mastered Words: {{ user.analytics?.mastered_words || 0 }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Access denied. Admin or teacher role required.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Achievement {
  id: number
  user_id: number
  achievement_id: string
  earned: boolean
  earned_date: string | null
  progress: number
  target: number
  completed: boolean
  name: string
  email: string
  role: string
}

interface Analytics {
  id: number
  user_id: number
  total_sessions: number
  average_accuracy: number
  average_session_time: number
  mastered_words: number
  progress_data: any
  difficulty_data: any
  session_data: any
  streak_data: any
  name: string
  email: string
  role: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  achievements: Achievement[]
  analytics: Analytics | null
}

const authStore = useAuthStore()
const loading = ref(true)
const achievementsData = ref<Achievement[]>([])
const analyticsData = ref<Analytics[]>([])

const canView = computed(() => authStore.user?.role === 'admin' || authStore.user?.role === 'teacher')

const users = computed(() => {
  const userMap = new Map<number, User>()
  achievementsData.value.forEach(ach => {
    if (!userMap.has(ach.user_id)) {
      userMap.set(ach.user_id, {
        id: ach.user_id,
        name: ach.name,
        email: ach.email,
        role: ach.role,
        achievements: [],
        analytics: null
      })
    }
    userMap.get(ach.user_id)!.achievements.push(ach)
  })
  analyticsData.value.forEach(an => {
    if (userMap.has(an.user_id)) {
      userMap.get(an.user_id)!.analytics = an
    } else {
      // If no achievements, still add user
      userMap.set(an.user_id, {
        id: an.user_id,
        name: an.name,
        email: an.email,
        role: an.role,
        achievements: [],
        analytics: an
      })
    }
  })
  return Array.from(userMap.values())
})

const fetchData = async () => {
  try {
    const [achRes, anaRes] = await Promise.all([
      fetch('/api/achievements/all'),
      fetch('/api/analytics/all')
    ])
    achievementsData.value = await achRes.json()
    analyticsData.value = await anaRes.json()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (canView.value) {
    fetchData()
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.user-data-view { padding: 20px; }
.user-card { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
</style>