<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="register">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Full Name</label>
            <input id="name" v-model="name" name="name" type="text" autocomplete="name" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Full Name">
            <span v-if="nameError" class="text-red-500 text-sm">{{ nameError }}</span>
          </div>
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input id="email" v-model="email" name="email" type="email" autocomplete="email" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address">
            <span v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</span>
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="new-password" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password">
            <span v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</span>
          </div>
          <div>
            <label for="role" class="sr-only">Role</label>
            <select id="role" v-model="role" name="role" required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <span v-if="roleError" class="text-red-500 text-sm">{{ roleError }}</span>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="!isFormValid" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            Register
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
            Already have an account? Login
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, type UserRole } from '../stores/auth'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('student')
const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const roleError = ref('')

const isFormValid = computed(() => {
  return name.value && email.value && password.value && role.value && !nameError.value && !emailError.value && !passwordError.value && !roleError.value
})

const validateName = () => {
  if (!name.value) {
    nameError.value = 'Name is required'
  } else if (name.value.length < 2) {
    nameError.value = 'Name must be at least 2 characters'
  } else {
    nameError.value = ''
  }
}

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

const validateRole = () => {
  if (!role.value) {
    roleError.value = 'Role is required'
  } else {
    roleError.value = ''
  }
}

const register = async () => {
  validateName()
  validateEmail()
  validatePassword()
  validateRole()
  if (isFormValid.value) {
    const authStore = useAuthStore()
    const success = await authStore.register(email.value, name.value, password.value, role.value)
    if (success) {
      router.push('/dashboard')
    } else {
      // Error is handled by the auth store
    }
  }
}
</script>

<style scoped>
</style>