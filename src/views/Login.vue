<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="login">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address">
            <span v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</span>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password">
            <span v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</span>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="!isFormValid" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            Sign in
          </button>
        </div>

        <div class="text-center">
          <router-link to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
            Don't have an account? Register
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type User } from '../stores/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value && !passwordError.value
})

const validateEmail = () => {
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    emailError.value = 'Email is invalid'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
  } else {
    passwordError.value = ''
  }
}

const login = () => {
  validateEmail()
  validatePassword()
  if (isFormValid.value) {
    const authStore = useAuthStore()

    // Mock users with different roles
    const mockUsers: Record<string, User> = {
      'admin@school.edu': { id: 1, email: 'admin@school.edu', name: 'Admin User', role: 'admin' },
      'teacher@school.edu': { id: 2, email: 'teacher@school.edu', name: 'Teacher User', role: 'teacher' },
      'student@school.edu': { id: 3, email: 'student@school.edu', name: 'Student User', role: 'student' }
    }

    const user = mockUsers[email.value as keyof typeof mockUsers]
    if (user) {
      authStore.login(user, 'mock-token')
      router.push('/dashboard')
    } else {
      emailError.value = 'Invalid credentials'
    }
  }
}
</script>

<style scoped>
</style>