<template>
  <div class="admin-panel">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

      <!-- User Management Section -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md mb-8">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">User Management</h3>
            <button
              @click="showAddUserModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add User
            </button>
          </div>
        </div>
        <ul class="divide-y divide-gray-200">
          <li v-for="user in users" :key="user.id" class="px-4 py-4 sm:px-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">{{ user.name.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getRoleBadgeClass(user.role)">
                  {{ user.role }}
                </span>
                <div class="flex space-x-2">
                  <button
                    @click="editUser(user)"
                    class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="showResetModal(user)"
                    class="text-orange-600 hover:text-orange-900 text-sm font-medium"
                  >
                    Reset Data
                  </button>
                  <button
                    @click="deleteUser(user.id)"
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- System Statistics -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span class="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ users.length }}</dd>
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
                  <span class="text-white text-sm font-medium">👨‍🏫</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Teachers</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ getUsersByRole('teacher').length }}</dd>
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
                  <span class="text-white text-sm font-medium">👨‍🎓</span>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Students</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ getUsersByRole('student').length }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddUserModal || editingUser" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" @click="closeModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingUser ? 'Edit User' : 'Add New User' }}
          </h3>
          <form @submit.prevent="saveUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="userForm.name"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="userForm.email"
                type="email"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Password</label>
              <input
                v-model="userForm.password"
                type="password"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p class="mt-1 text-sm text-gray-500">Password must be at least 6 characters long</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select
                v-model="userForm.role"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                {{ editingUser ? 'Update' : 'Add' }} User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Reset User Data Modal -->
    <div v-if="showResetDataModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" @click="closeResetModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Reset Data for {{ selectedUser?.name }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            Select which data to reset for this user. This action cannot be undone.
          </p>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                id="reset-achievements"
                v-model="resetOptions.achievements"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="reset-achievements" class="ml-2 block text-sm text-gray-900">
                Reset Achievements & Badges
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="reset-gamification"
                v-model="resetOptions.gamification"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="reset-gamification" class="ml-2 block text-sm text-gray-900">
                Reset Gamification (Points, Level, Experience)
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="reset-analytics"
                v-model="resetOptions.analytics"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="reset-analytics" class="ml-2 block text-sm text-gray-900">
                Reset Analytics & Progress Data
              </label>
            </div>
            <div class="flex items-center">
              <input
                id="reset-spaced-repetition"
                v-model="resetOptions.spacedRepetition"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="reset-spaced-repetition" class="ml-2 block text-sm text-gray-900">
                Reset Spaced Repetition Progress
              </label>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeResetModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="confirmReset"
              :disabled="!hasSelectedResetOptions"
              class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Selected Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '../stores/users'
import { useGamificationStore } from '../stores/gamification'
import { useSpacedRepetitionStore } from '../stores/spacedRepetition'
import type { User, UserRole } from '../stores/auth'

const usersStore = useUsersStore()
const gamificationStore = useGamificationStore()
const spacedRepetitionStore = useSpacedRepetitionStore()
const users = computed(() => usersStore.getUsers())
const getUsersByRole = (role: UserRole) => usersStore.getUsersByRole(role)

const showAddUserModal = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'student' as UserRole
})

const showResetDataModal = ref(false)
const selectedUser = ref<User | null>(null)
const resetOptions = ref({
  achievements: false,
  gamification: false,
  analytics: false,
  spacedRepetition: false
})

const hasSelectedResetOptions = computed(() => {
  return resetOptions.value.achievements ||
         resetOptions.value.gamification ||
         resetOptions.value.analytics ||
         resetOptions.value.spacedRepetition
})

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'bg-red-100 text-red-800'
    case 'teacher':
      return 'bg-blue-100 text-blue-800'
    case 'student':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  userForm.value = {
    name: user.name,
    email: user.email,
    password: '', // Password not shown for security
    role: user.role
  }
}

const deleteUser = (userId: number) => {
  if (confirm('Are you sure you want to delete this user?')) {
    usersStore.deleteUser(userId)
  }
}

const saveUser = () => {
  if (editingUser.value) {
    usersStore.updateUser(editingUser.value.id, userForm.value)
    editingUser.value = null
  } else {
    usersStore.addUser(userForm.value)
    showAddUserModal.value = false
  }
  userForm.value = { name: '', email: '', password: '', role: 'student' }
}

const closeModal = () => {
  showAddUserModal.value = false
  editingUser.value = null
  userForm.value = { name: '', email: '', password: '', role: 'student' }
}

const showResetModal = (user: User) => {
  selectedUser.value = user
  showResetDataModal.value = true
  resetOptions.value = {
    achievements: false,
    gamification: false,
    analytics: false,
    spacedRepetition: false
  }
}

const closeResetModal = () => {
  showResetDataModal.value = false
  selectedUser.value = null
  resetOptions.value = {
    achievements: false,
    gamification: false,
    analytics: false,
    spacedRepetition: false
  }
}

const confirmReset = () => {
  if (!selectedUser.value || !hasSelectedResetOptions.value) return

  const confirmMessage = `Are you sure you want to reset the selected data for ${selectedUser.value.name}? This action cannot be undone.`
  if (!confirm(confirmMessage)) return

  // Reset achievements and badges
  if (resetOptions.value.achievements) {
    gamificationStore.resetAchievements()
  }

  // Reset gamification data
  if (resetOptions.value.gamification) {
    gamificationStore.resetGamification()
  }

  // Reset analytics data (currently stored in localStorage/sessionStorage)
  if (resetOptions.value.analytics) {
    resetAnalyticsData()
  }

  // Reset spaced repetition data
  if (resetOptions.value.spacedRepetition) {
    spacedRepetitionStore.resetSpacedRepetition()
  }

  closeResetModal()
  alert(`Data reset completed for ${selectedUser.value.name}`)
}

const resetAnalyticsData = () => {
  // Clear analytics data from localStorage
  localStorage.removeItem('analytics_sessions')
  localStorage.removeItem('analytics_accuracy')
  localStorage.removeItem('analytics_session_time')
  localStorage.removeItem('analytics_mastered_words')
  localStorage.removeItem('analytics_progress_data')
  localStorage.removeItem('analytics_difficulty_data')
  localStorage.removeItem('analytics_session_data')
  localStorage.removeItem('analytics_streak_data')
}
</script>

<style scoped>
.admin-panel {
  padding: 2rem;
}
</style>