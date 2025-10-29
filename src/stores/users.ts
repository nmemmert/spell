import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from './auth'

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

interface CreateUserData {
  email: string
  name: string
  password: string
  role: UserRole
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Load users from API
  const loadUsers = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetch(`${API_BASE}/api/users`)
      if (!response.ok) throw new Error('Failed to fetch users')
      users.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to load users:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getUsers = () => {
    if (users.value.length === 0 && !isLoading.value) {
      loadUsers()
    }
    return users.value
  }

  const getUserById = async (id: number): Promise<User | undefined> => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`)
      if (!response.ok) {
        if (response.status === 404) return undefined
        throw new Error('Failed to fetch user')
      }
      return await response.json()
    } catch (err) {
      console.error('Failed to fetch user:', err)
      return undefined
    }
  }

  const addUser = async (userData: CreateUserData): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      if (!response.ok) throw new Error('Failed to create user')
      const newUser = await response.json()
      users.value.push(newUser)
      return newUser
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to create user:', err)
      return null
    }
  }

  const updateUser = async (id: number, updates: Partial<Pick<User, 'email' | 'name' | 'role'>>): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update user')

      // Reload users to reflect changes
      await loadUsers()

      // Return the updated user
      return users.value.find(u => u.id === id) || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to update user:', err)
      return null
    }
  }

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete user')

      // Remove from local array
      users.value = users.value.filter(u => u.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to delete user:', err)
      return false
    }
  }

  const getUsersByRole = (role: UserRole) => {
    return getUsers().filter(user => user.role === role)
  }

  return {
    users: computed(() => getUsers()),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    loadUsers
  }
})