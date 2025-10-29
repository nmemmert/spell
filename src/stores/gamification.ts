import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

export const useGamificationStore = defineStore('gamification', () => {
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

  const addPoints = (amount: number) => {
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
  }

  const earnBadge = (badgeId: string) => {
    const badge = badges.value.find(b => b.id === badgeId)
    if (badge && !badge.earned) {
      badge.earned = true
      badge.earnedDate = new Date()
      addPoints(100) // Bonus points for earning badge
    }
  }

  const checkAchievements = () => {
    // This would be called after sessions to update progress
    // For now, just mock updates
  }

  const getLeaderboard = () => {
    // Mock leaderboard data
    return [
      { name: 'You', points: points.value, level: level.value },
      { name: 'Alice', points: 1450, level: 6 },
      { name: 'Bob', points: 980, level: 4 },
      { name: 'Charlie', points: 1120, level: 5 }
    ].sort((a, b) => b.points - a.points)
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
    resetGamification
  }
})