import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: Date
}

export interface Achievement {
  id: string
  name: string
  description: string
  progress: number
  target: number
  completed: boolean
}

export interface LeaderboardUser {
  name: string
  points: number
  level: number
}

export const useGamificationStore = defineStore('gamification', () => {
  const authStore = useAuthStore()
  const points = ref(0)
  const level = ref(1)
  const experience = ref(0)
  const experienceToNext = ref(100)

  const badges = ref<Badge[]>([
    {
      id: 'first-session',
      name: 'First Steps',
      description: 'Complete your first spelling session',
      icon: '🎯',
      earned: false
    },
    {
      id: 'perfect-score',
      name: 'Perfectionist',
      description: 'Get 100% accuracy in a session',
      icon: '⭐',
      earned: false
    },
    {
      id: 'streak-master',
      name: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      earned: false
    },
    {
      id: 'word-collector',
      name: 'Word Collector',
      description: 'Master 100 words',
      icon: '📚',
      earned: false
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Complete 50 words in under 5 minutes',
      icon: '⚡',
      earned: false
    },
    {
      id: 'consistent-learner',
      name: 'Consistent Learner',
      description: 'Practice for 30 consecutive days',
      icon: '📅',
      earned: false
    },
    {
      id: 'perfect-verse',
      name: 'Scripture Master',
      description: 'Type a Bible verse with 100% accuracy',
      icon: '📖',
      earned: false
    }
  ])

  const achievements = ref<Achievement[]>([
    {
      id: 'words-mastered',
      name: 'Word Master',
      description: 'Master 500 words',
      progress: 0,
      target: 500,
      completed: false
    },
    {
      id: 'accuracy-champion',
      name: 'Accuracy Champion',
      description: 'Maintain 90%+ accuracy for 10 sessions',
      progress: 0,
      target: 10,
      completed: false
    },
    {
      id: 'time-warrior',
      name: 'Time Warrior',
      description: 'Spend 50 hours learning',
      progress: 0,
      target: 50,
      completed: false
    }
  ])

  const earnedBadges = computed(() => badges.value.filter(badge => badge.earned))
  const availableBadges = computed(() => badges.value.filter(badge => !badge.earned))

  const levelProgress = computed(() => (experience.value / experienceToNext.value) * 100)

  const addPoints = async (amount: number) => {
    points.value += amount
    experience.value += amount

    // Check for level up
    if (experience.value >= experienceToNext.value) {
      level.value++
      experience.value -= experienceToNext.value
      experienceToNext.value = Math.floor(experienceToNext.value * 1.2)
    }

    // Check achievements
    checkAchievements()

    // Save data if user is logged in
    if (authStore.user) {
      await saveGamificationData(authStore.user.id)
    }
  }

  const earnBadge = async (badgeId: string) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !badge.earned) {
      badge.earned = true
      badge.earnedDate = new Date()
      addPoints(100) // Bonus points for earning badge
      
      // Save achievements data if user is logged in
      if (authStore.user) {
        await saveAchievementsData(authStore.user.id)
      }
    }
  }

  const checkAchievements = () => {
    // This would be called after sessions to update progress
    // For now, just mock updates
  }

  const getLeaderboard = (): LeaderboardUser[] => {
    // Return empty leaderboard - no mock data
    return []
  }

  const resetAchievements = () => {
    // Reset all badges to unearned state
    badges.value.forEach(badge => {
      badge.earned = false
      badge.earnedDate = undefined
    })
    // Reset achievement progress
    achievements.value.forEach(achievement => {
      achievement.progress = 0
      achievement.completed = false
    })
  }

  const resetGamification = () => {
    // Reset points, level, and experience
    points.value = 0
    level.value = 1
    experience.value = 0
    experienceToNext.value = 100
  }

  const resetLeaderboard = () => {
    // Leaderboard is now empty by default - no mock users
  }

  const loadGamificationData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/gamification/${userId}`)
      if (response.ok) {
        const data = await response.json()
        points.value = data.points || 0
        level.value = data.level || 1
        experience.value = data.experience || 0
        experienceToNext.value = data.experience_to_next || 100
      }
    } catch (error) {
      console.error('Failed to load gamification data:', error)
    }
  }

  const saveGamificationData = async (userId: number) => {
    try {
      await fetch(`${API_BASE}/api/gamification/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: points.value,
          level: level.value,
          experience: experience.value,
          experience_to_next: experienceToNext.value
        })
      })
    } catch (error) {
      console.error('Failed to save gamification data:', error)
    }
  }

  const loadAchievementsData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/achievements/${userId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Update badges
        for (const badge of badges.value) {
          const dbBadge = data.find((a: any) => a.achievement_id === badge.id)
          if (dbBadge) {
            badge.earned = dbBadge.earned
            badge.earnedDate = dbBadge.earned_date ? new Date(dbBadge.earned_date) : undefined
          }
        }
        
        // Update achievements
        for (const achievement of achievements.value) {
          const dbAchievement = data.find((a: any) => a.achievement_id === achievement.id)
          if (dbAchievement) {
            achievement.progress = dbAchievement.progress
            achievement.completed = dbAchievement.completed
          }
        }
      }
    } catch (error) {
      console.error('Failed to load achievements data:', error)
    }
  }

  const saveAchievementsData = async (userId: number) => {
    try {
      const achievementsData = [
        ...badges.value.map(badge => ({
          achievement_id: badge.id,
          earned: badge.earned,
          earned_date: badge.earnedDate?.toISOString(),
          progress: 0,
          target: 1,
          completed: badge.earned
        })),
        ...achievements.value.map(achievement => ({
          achievement_id: achievement.id,
          earned: false,
          earned_date: null,
          progress: achievement.progress,
          target: achievement.target,
          completed: achievement.completed
        }))
      ]
      
      await fetch(`${API_BASE}/api/achievements/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievementsData)
      })
    } catch (error) {
      console.error('Failed to save achievements data:', error)
    }
  }

  return {
    points,
    level,
    experience,
    experienceToNext,
    badges,
    achievements,
    earnedBadges,
    availableBadges,
    levelProgress,
    addPoints,
    earnBadge,
    checkAchievements,
    getLeaderboard,
    resetAchievements,
    resetGamification,
    resetLeaderboard,
    loadGamificationData,
    saveGamificationData,
    loadAchievementsData,
    saveAchievementsData
  }
})