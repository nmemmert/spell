import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Wordlist {
  id: number
  name: string
  description: string
  words: string[]
  assignedStudents: number[] // Array of student IDs
  createdBy: number // Teacher/Admin ID who created it
  createdAt: Date
}

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : ''

export const useWordlistStore = defineStore('wordlist', () => {
  const wordlists = ref<Wordlist[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Load wordlists from API
  const loadWordlists = async () => {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetch(`${API_BASE}/api/wordlists`)
      if (!response.ok) throw new Error('Failed to fetch wordlists')
      const data = await response.json()
      wordlists.value = data.map((w: any) => ({
        ...w,
        createdAt: new Date(w.createdAt)
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to load wordlists:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getWordlists = () => {
    if (wordlists.value.length === 0 && !isLoading.value) {
      loadWordlists()
    }
    return wordlists.value
  }

  const getWordlistById = async (id: number): Promise<Wordlist | undefined> => {
    try {
      const response = await fetch(`${API_BASE}/api/wordlists/${id}`)
      if (!response.ok) {
        if (response.status === 404) return undefined
        throw new Error('Failed to fetch wordlist')
      }
      const data = await response.json()
      return {
        ...data,
        createdAt: new Date(data.createdAt)
      }
    } catch (err) {
      console.error('Failed to fetch wordlist:', err)
      return undefined
    }
  }

  const getWordlistsForStudent = (studentId: number) => {
    return getWordlists().filter(wordlist =>
      wordlist.assignedStudents.includes(studentId)
    )
  }

  const getWordlistsByTeacher = (teacherId: number) => {
    return getWordlists().filter(wordlist => wordlist.createdBy === teacherId)
  }

  const addWordlist = async (wordlistData: Omit<Wordlist, 'id' | 'createdAt'>): Promise<Wordlist | null> => {
    try {
      const now = new Date()
      const response = await fetch(`${API_BASE}/api/wordlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...wordlistData,
          createdAt: now.toISOString()
        })
      })
      if (!response.ok) throw new Error('Failed to create wordlist')
      const data = await response.json()
      const wordlist: Wordlist = {
        ...data,
        createdAt: now
      }
      wordlists.value.push(wordlist)
      return wordlist
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to create wordlist:', err)
      return null
    }
  }

  const updateWordlist = async (id: number, updates: Partial<Pick<Wordlist, 'name' | 'description' | 'words' | 'assignedStudents'>>): Promise<Wordlist | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/wordlists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!response.ok) throw new Error('Failed to update wordlist')

      // Reload wordlists to reflect changes
      await loadWordlists()

      // Return the updated wordlist
      return wordlists.value.find(w => w.id === id) || null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to update wordlist:', err)
      return null
    }
  }

  const deleteWordlist = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/wordlists/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete wordlist')

      // Remove from local array
      wordlists.value = wordlists.value.filter(w => w.id !== id)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('Failed to delete wordlist:', err)
      return false
    }
  }

  const assignWordlistToStudent = async (wordlistId: number, studentId: number): Promise<boolean> => {
    const wordlist = wordlists.value.find(w => w.id === wordlistId)
    if (wordlist && !wordlist.assignedStudents.includes(studentId)) {
      const newAssignedStudents = [...wordlist.assignedStudents, studentId]
      return (await updateWordlist(wordlistId, { assignedStudents: newAssignedStudents })) !== null
    }
    return false
  }

  const unassignWordlistFromStudent = async (wordlistId: number, studentId: number): Promise<boolean> => {
    const wordlist = wordlists.value.find(w => w.id === wordlistId)
    if (wordlist) {
      const newAssignedStudents = wordlist.assignedStudents.filter(id => id !== studentId)
      return (await updateWordlist(wordlistId, { assignedStudents: newAssignedStudents })) !== null
    }
    return false
  }

  return {
    wordlists: computed(() => getWordlists()),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    getWordlists,
    getWordlistById,
    getWordlistsForStudent,
    getWordlistsByTeacher,
    addWordlist,
    updateWordlist,
    deleteWordlist,
    assignWordlistToStudent,
    unassignWordlistFromStudent,
    loadWordlists
  }
})