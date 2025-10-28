<template>
  <div v-if="authStore.isAuthenticated" class="text-center py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
      Welcome back, {{ authStore.user?.name }}!
    </h1>
    <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
      Ready to continue your learning journey?
    </p>
    <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
      <div class="rounded-md shadow">
        <router-link to="/dashboard" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
          Go to Dashboard
        </router-link>
      </div>
      <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
        <router-link to="/game" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
          Start Practicing
        </router-link>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
      Welcome to Spelling Hub
    </h1>
    <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
      A modern spelling practice application with advanced features.
    </p>
    <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
      <div class="rounded-md shadow">
        <router-link to="/login" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
          Login
        </router-link>
      </div>
      <div class="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
        <router-link to="/register" class="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
          Register
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
</style>