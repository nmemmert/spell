import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Wordlist {
  id: number
  name: string
  description: string
  words: string[]
  assignedStudents: number[] // Array of student IDs
  createdBy: number // Teacher/Admin ID who created it
  createdAt: Date
}

export const useWordlistStore = defineStore('wordlist', () => {
  const wordlists = ref<Wordlist[]>([
    {
      id: 1,
      name: 'Basic Words',
      description: 'Common everyday words for beginners',
      words: ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honey', 'ice', 'jam'],
      assignedStudents: [3], // Student User ID
      createdBy: 2, // Teacher User ID
      createdAt: new Date('2025-10-01')
    },
    {
      id: 2,
      name: 'Advanced Vocabulary',
      description: 'Challenging words for advanced learners',
      words: ['ubiquitous', 'serendipity', 'ephemeral', 'quintessential', 'labyrinthine', 'perspicacious', 'pulchritude', 'ebullient', 'mellifluous', 'quiescent'],
      assignedStudents: [],
      createdBy: 2,
      createdAt: new Date('2025-10-15')
    },
    {
      id: 3,
      name: 'Week 1: Colors & Shapes',
      description: 'Basic colors and shapes vocabulary',
      words: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'circle', 'square', 'triangle', 'rectangle'],
      assignedStudents: [3, 4], // Assign to multiple students
      createdBy: 2,
      createdAt: new Date('2025-10-20')
    },
    {
      id: 4,
      name: 'Week 2: Animals',
      description: 'Common animal names',
      words: ['dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'sheep', 'chicken', 'duck'],
      assignedStudents: [3, 4],
      createdBy: 2,
      createdAt: new Date('2025-10-21')
    },
    {
      id: 5,
      name: 'Week 3: Family',
      description: 'Family member vocabulary',
      words: ['mother', 'father', 'brother', 'sister', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'baby'],
      assignedStudents: [3, 4],
      createdBy: 2,
      createdAt: new Date('2025-10-22')
    },
    {
      id: 6,
      name: 'Week 4: Food',
      description: 'Common food items',
      words: ['bread', 'milk', 'cheese', 'butter', 'egg', 'rice', 'pasta', 'soup', 'salad', 'fruit'],
      assignedStudents: [3, 4],
      createdBy: 2,
      createdAt: new Date('2025-10-23')
    },
    {
      id: 7,
      name: 'Week 5: Numbers',
      description: 'Numbers and counting',
      words: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
      assignedStudents: [3, 4],
      createdBy: 2,
      createdAt: new Date('2025-10-24')
    }
  ])

  const getWordlists = () => wordlists.value

  const getWordlistById = (id: number) => {
    return wordlists.value.find(wordlist => wordlist.id === id)
  }

  const getWordlistsForStudent = (studentId: number) => {
    return wordlists.value.filter(wordlist =>
      wordlist.assignedStudents.includes(studentId)
    )
  }

  const getWordlistsByTeacher = (teacherId: number) => {
    return wordlists.value.filter(wordlist => wordlist.createdBy === teacherId)
  }

  const addWordlist = (wordlistData: Omit<Wordlist, 'id' | 'createdAt'>) => {
    const newWordlist: Wordlist = {
      ...wordlistData,
      id: Math.max(...wordlists.value.map(w => w.id), 0) + 1,
      createdAt: new Date()
    }
    wordlists.value.push(newWordlist)
    return newWordlist
  }

  const updateWordlist = (id: number, updates: Partial<Pick<Wordlist, 'name' | 'description' | 'words' | 'assignedStudents'>>) => {
    const wordlistIndex = wordlists.value.findIndex(w => w.id === id)
    if (wordlistIndex !== -1) {
      const currentWordlist = wordlists.value[wordlistIndex]!
      wordlists.value[wordlistIndex] = {
        id: currentWordlist.id,
        name: updates.name ?? currentWordlist.name,
        description: updates.description ?? currentWordlist.description,
        words: updates.words ?? currentWordlist.words,
        assignedStudents: updates.assignedStudents ?? currentWordlist.assignedStudents,
        createdBy: currentWordlist.createdBy,
        createdAt: currentWordlist.createdAt
      }
      return wordlists.value[wordlistIndex]
    }
    return null
  }

  const deleteWordlist = (id: number) => {
    const index = wordlists.value.findIndex(w => w.id === id)
    if (index !== -1) {
      wordlists.value.splice(index, 1)
      return true
    }
    return false
  }

  const assignWordlistToStudent = (wordlistId: number, studentId: number) => {
    const wordlist = wordlists.value.find(w => w.id === wordlistId)
    if (wordlist && !wordlist.assignedStudents.includes(studentId)) {
      wordlist.assignedStudents.push(studentId)
      return true
    }
    return false
  }

  const unassignWordlistFromStudent = (wordlistId: number, studentId: number) => {
    const wordlist = wordlists.value.find(w => w.id === wordlistId)
    if (wordlist) {
      const index = wordlist.assignedStudents.indexOf(studentId)
      if (index !== -1) {
        wordlist.assignedStudents.splice(index, 1)
        return true
      }
    }
    return false
  }

  return {
    wordlists,
    getWordlists,
    getWordlistById,
    getWordlistsForStudent,
    getWordlistsByTeacher,
    addWordlist,
    updateWordlist,
    deleteWordlist,
    assignWordlistToStudent,
    unassignWordlistFromStudent
  }
})