import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User, UserRole } from './auth'

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([
    {
      id: 1,
      email: 'admin@school.edu',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: 2,
      email: 'teacher@school.edu',
      name: 'Teacher User',
      role: 'teacher'
    },
    {
      id: 3,
      email: 'student@school.edu',
      name: 'Student User',
      role: 'student'
    },
    {
      id: 4,
      email: 'student2@school.edu',
      name: 'Student Two',
      role: 'student'
    }
  ])

  const getUsers = () => users.value

  const getUserById = (id: number) => users.value.find(user => user.id === id)

  const addUser = (userData: Omit<User, 'id'>) => {
    const newId = Math.max(...users.value.map(u => u.id)) + 1
    const newUser: User = { ...userData, id: newId }
    users.value.push(newUser)
    return newUser
  }

  const updateUser = (id: number, updates: Partial<Pick<User, 'email' | 'name' | 'role'>>) => {
    const userIndex = users.value.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      const currentUser = users.value[userIndex]!
      users.value[userIndex] = {
        id: currentUser.id,
        email: updates.email ?? currentUser.email,
        name: updates.name ?? currentUser.name,
        role: updates.role ?? currentUser.role
      }
      return users.value[userIndex]
    }
    return null
  }

  const deleteUser = (id: number) => {
    const userIndex = users.value.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      users.value.splice(userIndex, 1)
      return true
    }
    return false
  }

  const getUsersByRole = (role: UserRole) => users.value.filter(user => user.role === role)

  return {
    users,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    getUsersByRole
  }
})