import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export const useAnalyticsStore = defineStore('analytics', () => {
  
  // Analytics data - start with empty data
  const totalSessions = ref(0)
  const averageAccuracy = ref(0)
  const averageSessionTime = ref(0)
  const masteredWords = ref(0)

  const progressData = ref({
    labels: [],
    datasets: [
      {
        label: 'Accuracy %',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Words Learned',
        data: [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  })

  const difficultyData = ref({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  })

  const sessionData = ref({
    labels: [],
    datasets: [
      {
        label: 'Words Practiced',
        data: [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Correct Answers',
        data: [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  })

  const streakData = ref({
    labels: [],
    datasets: [
      {
        label: 'Daily Streak',
        data: [],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  })

  const loadAnalyticsData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/analytics/${userId}`)
      if (response.ok) {
        const data = await response.json()
        totalSessions.value = data.total_sessions || 45
        averageAccuracy.value = data.average_accuracy || 78
        averageSessionTime.value = data.average_session_time || 12
        masteredWords.value = data.mastered_words || 234
        
        if (data.progress_data) progressData.value = data.progress_data
        if (data.difficulty_data) difficultyData.value = data.difficulty_data
        if (data.session_data) sessionData.value = data.session_data
        if (data.streak_data) streakData.value = data.streak_data
      }
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    }
  }

  const saveAnalyticsData = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/api/analytics/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_sessions: totalSessions.value,
          average_accuracy: averageAccuracy.value,
          average_session_time: averageSessionTime.value,
          mastered_words: masteredWords.value,
          progress_data: progressData.value,
          difficulty_data: difficultyData.value,
          session_data: sessionData.value,
          streak_data: streakData.value
        })
      })
    } catch (error) {
      console.error('Failed to save analytics data:', error)
    }
  }

  const resetAnalyticsData = () => {
    totalSessions.value = 0
    averageAccuracy.value = 0
    averageSessionTime.value = 0
    masteredWords.value = 0

    progressData.value = {
      labels: [],
      datasets: [
        {
          label: 'Accuracy %',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Words Learned',
          data: [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    }

    difficultyData.value = {
      labels: [],
      datasets: [
        {
          data: [],
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
      labels: [],
      datasets: [
        {
          label: 'Words Practiced',
          data: [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Correct Answers',
          data: [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
      ],
    }

    streakData.value = {
      labels: [],
      datasets: [
        {
          label: 'Daily Streak',
          data: [],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
        },
      ],
    }
  }

  return {
    totalSessions,
    averageAccuracy,
    averageSessionTime,
    masteredWords,
    progressData,
    difficultyData,
    sessionData,
    streakData,
    loadAnalyticsData,
    saveAnalyticsData,
    resetAnalyticsData
  }
})