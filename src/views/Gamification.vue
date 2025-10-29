<template>
  <div class="gamification">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">Gamification</h2>

    <!-- Level and Points Overview -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xl font-semibold">Level {{ gamificationStore.level }}</h3>
          <p class="text-indigo-100">{{ gamificationStore.points }} Points</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-indigo-100">Experience</div>
          <div class="text-lg font-semibold">{{ gamificationStore.experience }} / {{ gamificationStore.experienceToNext }}</div>
          <div class="w-32 bg-indigo-300 rounded-full h-2 mt-2">
            <div class="bg-white h-2 rounded-full transition-all duration-300" :style="{ width: gamificationStore.levelProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Badges Section -->
    <div class="mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Badges</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="badge in gamificationStore.badges"
          :key="badge.id"
          class="bg-white rounded-lg shadow p-4 text-center"
          :class="{ 'opacity-50': !badge.earned }"
        >
          <div class="text-3xl mb-2">{{ badge.icon }}</div>
          <h4 class="font-medium text-gray-900">{{ badge.name }}</h4>
          <p class="text-sm text-gray-500">{{ badge.description }}</p>
          <div v-if="badge.earned" class="mt-2 text-xs text-green-600 font-medium">
            Earned {{ badge.earnedDate?.toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Achievements Section -->
    <div class="mb-8">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
      <div class="space-y-4">
        <div
          v-for="achievement in gamificationStore.achievements"
          :key="achievement.id"
          class="bg-white rounded-lg shadow p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-gray-900">{{ achievement.name }}</h4>
            <span class="text-sm text-gray-500">{{ achievement.progress }} / {{ achievement.target }}</span>
          </div>
          <p class="text-sm text-gray-600 mb-3">{{ achievement.description }}</p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: (achievement.progress / achievement.target) * 100 + '%' }"
            ></div>
          </div>
          <div v-if="achievement.completed" class="mt-2 text-sm text-green-600 font-medium">
            ✅ Completed!
          </div>
        </div>
      </div>
    </div>

    <!-- Leaderboard -->
    <div class="bg-white shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Leaderboard</h3>
      <div v-if="leaderboard.length === 0" class="text-center py-8">
        <div class="text-gray-500">
          <p class="text-lg">No users on leaderboard yet</p>
          <p class="text-sm mt-2">Start practicing to earn points and appear here!</p>
        </div>
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="(user, index) in leaderboard"
          :key="user.name"
          class="flex items-center justify-between p-3 rounded-lg"
          :class="{
            'bg-yellow-50 border border-yellow-200': index === 0,
            'bg-gray-50 border border-gray-200': index === 1,
            'bg-orange-50 border border-orange-200': index === 2,
            'bg-indigo-50': user.name === 'You'
          }"
        >
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
              {{ index + 1 }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
              <p class="text-sm text-gray-500">Level {{ user.level }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">{{ user.points }} pts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGamificationStore, type LeaderboardUser } from '../stores/gamification'

const gamificationStore = useGamificationStore()
const leaderboard = computed<LeaderboardUser[]>(() => gamificationStore.getLeaderboard())
</script>

<style scoped>
</style>