<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Wordlists Management</h2>

      <!-- Create/Edit Form -->
      <div class="mb-6">
        <button @click="showForm = !showForm" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          {{ showForm ? 'Cancel' : 'Create New Wordlist' }}
        </button>
      </div>

      <div v-if="showForm" class="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ editingWordlist ? 'Edit Wordlist' : 'Create New Wordlist' }}</h3>
        <form @submit.prevent="saveWordlist" class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="formData.name" type="text" id="name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required>
          </div>
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="formData.description" id="description" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          <div>
            <label for="words" class="block text-sm font-medium text-gray-700">Words (one per line)</label>
            <textarea v-model="formData.wordsText" id="words" rows="5" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="apple&#10;banana&#10;cherry"></textarea>
          </div>
          <div v-if="authStore.isTeacher || authStore.isAdmin">
            <label class="block text-sm font-medium text-gray-700 mb-2">Assign to Students</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
              <div v-for="student in students" :key="student.id" class="flex items-center">
                <input
                  :id="`student-${student.id}`"
                  v-model="formData.assignedStudents"
                  :value="student.id"
                  type="checkbox"
                  class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                >
                <label :for="`student-${student.id}`" class="ml-2 block text-sm text-gray-900">
                  {{ student.name }} ({{ student.email }})
                </label>
              </div>
            </div>
          </div>
          <div class="flex space-x-3">
            <button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              {{ editingWordlist ? 'Update' : 'Create' }} Wordlist
            </button>
            <button v-if="editingWordlist" @click="cancelEdit" type="button" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Wordlists Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="wordlist in displayWordlists" :key="wordlist.id" class="bg-white overflow-hidden shadow rounded-lg border">
          <div class="p-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900">{{ wordlist.name }}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ wordlist.words.length }} words
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500">{{ wordlist.description }}</p>

            <!-- Student Assignment Info -->
            <div v-if="authStore.isTeacher || authStore.isAdmin" class="mt-2">
              <p class="text-xs text-gray-500">
                Assigned to: {{ wordlist.assignedStudents.length }} student{{ wordlist.assignedStudents.length !== 1 ? 's' : '' }}
              </p>
              <div v-if="wordlist.assignedStudents.length > 0" class="mt-1 flex flex-wrap gap-1">
                <span v-for="studentId in wordlist.assignedStudents.slice(0, 3)" :key="studentId" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  {{ students.find(s => s.id === studentId)?.name || 'Unknown' }}
                </span>
                <span v-if="wordlist.assignedStudents.length > 3" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{{ wordlist.assignedStudents.length - 3 }} more
                </span>
              </div>
            </div>

            <div class="mt-4 flex space-x-2">
              <button
                v-if="canPracticeWordlist(wordlist)"
                @click="$router.push(`/game?wordlist=${wordlist.id}&mode=practice`)"
                class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Practice
              </button>
              <button
                v-if="canPracticeWordlist(wordlist)"
                @click="$router.push(`/game?wordlist=${wordlist.id}&mode=test`)"
                class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                Test
              </button>
              <button
                v-if="authStore.isTeacher || authStore.isAdmin"
                @click="editWordlist(wordlist)"
                class="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                v-if="authStore.isTeacher || authStore.isAdmin"
                @click="deleteWordlist(wordlist.id)"
                class="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="displayWordlists.length === 0" class="text-center py-12">
        <div class="text-gray-500">
          <p class="text-lg">No wordlists available</p>
          <p v-if="authStore.isStudent" class="text-sm mt-2">Ask your teacher to assign wordlists to you.</p>
          <p v-else class="text-sm mt-2">Create your first wordlist to get started.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWordlistStore, type Wordlist } from '../stores/wordlist'
import { useUsersStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
// Use router to avoid unused variable warning
router
const wordlistStore = useWordlistStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const showForm = ref(false)
const editingWordlist = ref<Wordlist | null>(null)
const formData = ref({
  name: '',
  description: '',
  wordsText: '',
  assignedStudents: [] as number[]
})

// Computed properties
const displayWordlists = computed(() => {
  if (authStore.isStudent) {
    // Students see only assigned wordlists
    return wordlistStore.getWordlistsForStudent(authStore.user?.id || 0)
  } else if (authStore.isTeacher || authStore.isAdmin) {
    // Teachers and admins see all wordlists
    return wordlistStore.getWordlists()
  }
  return []
})

const students = computed(() => usersStore.getUsersByRole('student'))

const canPracticeWordlist = (wordlist: Wordlist) => {
  if (authStore.isStudent) {
    return wordlist.assignedStudents.includes(authStore.user?.id || 0)
  }
  return authStore.isTeacher || authStore.isAdmin
}



const saveWordlist = () => {
  const words = formData.value.wordsText.split('\n').map(w => w.trim()).filter(w => w)

  if (editingWordlist.value) {
    // Update existing wordlist
    wordlistStore.updateWordlist(editingWordlist.value.id, {
      name: formData.value.name,
      description: formData.value.description,
      words,
      assignedStudents: formData.value.assignedStudents
    })
  } else {
    // Create new wordlist
    wordlistStore.addWordlist({
      name: formData.value.name,
      description: formData.value.description,
      words,
      assignedStudents: formData.value.assignedStudents,
      createdBy: authStore.user?.id || 0
    })
  }

  resetForm()
}

const editWordlist = (wordlist: Wordlist) => {
  editingWordlist.value = wordlist
  formData.value = {
    name: wordlist.name,
    description: wordlist.description,
    wordsText: wordlist.words.join('\n'),
    assignedStudents: [...wordlist.assignedStudents]
  }
  showForm.value = true
}

const deleteWordlist = (id: number) => {
  if (confirm('Are you sure you want to delete this wordlist? This action cannot be undone.')) {
    wordlistStore.deleteWordlist(id)
  }
}

const cancelEdit = () => {
  editingWordlist.value = null
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    wordsText: '',
    assignedStudents: []
  }
  editingWordlist.value = null
  showForm.value = false
}

onMounted(() => {
  // Ensure users are loaded
  usersStore.getUsers()
})
</script>

<style scoped>
</style>