<template>
  <div class="bible-typing">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h1 class="text-2xl font-bold">AWANA T&T Bible Typing</h1>
          <p class="text-blue-100 mt-1">Memorize AWANA Truth & Training verses through typing practice</p>
        </div>

        <div class="p-6">
          <!-- Verse Selection -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Select a Verse</label>
            <select
              v-model="selectedVerseId"
              @change="selectVerse"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Choose a verse...</option>
              <option v-for="verse in bibleVerses" :key="verse.id" :value="verse.id">
                {{ verse.reference }}
              </option>
            </select>
          </div>

          <!-- Typing Mode Selection -->
          <div class="mb-6">
            <div class="flex space-x-4">
              <button
                @click="typingMode = 'full'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  typingMode === 'full'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                Full Verse
              </button>
              <button
                @click="typingMode = 'progressive'"
                :class="[
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  typingMode === 'progressive'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                Progressive Reveal
              </button>
            </div>
          </div>

          <!-- Typing Area -->
          <div v-if="currentVerse" class="mb-6">
            <div class="mb-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ currentVerse.reference }}</h3>
              <div class="text-sm text-gray-600 mb-4">{{ currentVerse.translation }}</div>
            </div>

            <!-- Display Text -->
            <div class="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div class="text-lg leading-relaxed font-serif">
                <span
                  v-for="(char, index) in displayText"
                  :key="index"
                  :class="getCharClass(index)"
                >
                  {{ char }}
                </span>
              </div>
            </div>

            <!-- Input Area -->
            <div class="mb-4">
              <textarea
                v-model="userInput"
                @input="checkInput"
                :disabled="!isActive"
                ref="inputRef"
                class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg font-mono"
                :placeholder="isActive ? 'Start typing the verse...' : 'Select a verse and click Start'"
                rows="3"
              ></textarea>
            </div>

            <!-- Controls -->
            <div class="flex space-x-4 mb-4">
              <button
                @click="startTyping"
                :disabled="!currentVerse || isActive"
                class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isActive ? 'In Progress' : 'Start Typing' }}
              </button>
              <button
                @click="resetTyping"
                class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Reset
              </button>
            </div>

            <!-- Progress and Stats -->
            <div v-if="isActive" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <div class="text-sm text-blue-600 font-medium">Accuracy</div>
                <div class="text-2xl font-bold text-blue-800">{{ accuracy }}%</div>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <div class="text-sm text-green-600 font-medium">WPM</div>
                <div class="text-2xl font-bold text-green-800">{{ wpm }}</div>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <div class="text-sm text-purple-600 font-medium">Progress</div>
                <div class="text-2xl font-bold text-purple-800">{{ Math.round((userInput.length / currentVerse.text.length) * 100) }}%</div>
              </div>
            </div>

            <!-- Completion Message -->
            <div v-if="isCompleted" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <div class="text-green-600 text-xl mr-3">✓</div>
                <div>
                  <h4 class="text-green-800 font-medium">Verse Completed!</h4>
                  <p class="text-green-700 text-sm">
                    Accuracy: {{ accuracy }}% | WPM: {{ wpm }} |
                    Earned {{ earnedPoints }} points!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="text-blue-800 font-medium mb-2">AWANA T&T Practice Tips:</h4>
            <ul class="text-blue-700 text-sm space-y-1">
              <li>• <strong>Full Verse:</strong> Type the entire verse from memory</li>
              <li>• <strong>Progressive Reveal:</strong> Text appears word by word as you type correctly</li>
              <li>• Practice regularly to master all 35 T&T verses</li>
              <li>• Focus on accuracy and speed to earn more points</li>
              <li>• Perfect accuracy earns the "Scripture Master" badge!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useGamificationStore } from '../stores/gamification'

interface BibleVerse {
  id: string
  reference: string
  text: string
  translation: string
}

const gamificationStore = useGamificationStore()

// Bible verses data
// AWANA T&T (Truth & Training) Bible Verses - ESV Translation
const bibleVerses = ref<BibleVerse[]>([
  {
    id: 'john-3-16',
    reference: 'John 3:16 (T&T 1)',
    text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    translation: 'ESV'
  },
  {
    id: 'psalm-23-1',
    reference: 'Psalm 23:1 (T&T 2)',
    text: 'The Lord is my shepherd; I shall not want.',
    translation: 'ESV'
  },
  {
    id: 'philippians-4-13',
    reference: 'Philippians 4:13 (T&T 3)',
    text: 'I can do all things through him who strengthens me.',
    translation: 'ESV'
  },
  {
    id: 'jeremiah-29-11',
    reference: 'Jeremiah 29:11 (T&T 4)',
    text: 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    translation: 'ESV'
  },
  {
    id: 'psalm-56-3',
    reference: 'Psalm 56:3 (T&T 5)',
    text: 'When I am afraid, I put my trust in you.',
    translation: 'ESV'
  },
  {
    id: 'isaiah-26-3',
    reference: 'Isaiah 26:3 (T&T 6)',
    text: 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.',
    translation: 'ESV'
  },
  {
    id: 'proverbs-3-5-6',
    reference: 'Proverbs 3:5-6 (T&T 7)',
    text: 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    translation: 'ESV'
  },
  {
    id: 'psalm-46-1',
    reference: 'Psalm 46:1 (T&T 8)',
    text: 'God is our refuge and strength, a very present help in trouble.',
    translation: 'ESV'
  },
  {
    id: 'psalm-100-4',
    reference: 'Psalm 100:4 (T&T 9)',
    text: 'Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!',
    translation: 'ESV'
  },
  {
    id: 'ephesians-4-29',
    reference: 'Ephesians 4:29 (T&T 10)',
    text: 'Let no corrupting talk come out of your mouths, but only such as is good for building up, as fits the occasion, that it may give grace to those who hear.',
    translation: 'ESV'
  },
  {
    id: 'matthew-5-13-14',
    reference: 'Matthew 5:13-14 (T&T 11)',
    text: 'You are the salt of the earth, but if salt has lost its taste, how shall its saltiness be restored? It is no longer good for anything except to be thrown out and trampled under people\'s feet. You are the light of the world.',
    translation: 'ESV'
  },
  {
    id: 'matthew-5-16',
    reference: 'Matthew 5:16 (T&T 12)',
    text: 'In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.',
    translation: 'ESV'
  },
  {
    id: 'matthew-6-33',
    reference: 'Matthew 6:33 (T&T 13)',
    text: 'But seek first the kingdom of God and his righteousness, and all these things will be added to you.',
    translation: 'ESV'
  },
  {
    id: 'matthew-7-24',
    reference: 'Matthew 7:24 (T&T 14)',
    text: 'Everyone then who hears these words of mine and does them will be like a wise man who built his house on the rock.',
    translation: 'ESV'
  },
  {
    id: 'john-14-6',
    reference: 'John 14:6 (T&T 15)',
    text: 'Jesus said to him, "I am the way, and the truth, and the life. No one comes to the Father except through me."',
    translation: 'ESV'
  },
  {
    id: 'john-15-5',
    reference: 'John 15:5 (T&T 16)',
    text: 'I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing.',
    translation: 'ESV'
  },
  {
    id: 'acts-4-12',
    reference: 'Acts 4:12 (T&T 17)',
    text: 'And there is salvation in no one else, for there is no other name under heaven given among men by which we must be saved.',
    translation: 'ESV'
  },
  {
    id: 'romans-3-23',
    reference: 'Romans 3:23 (T&T 18)',
    text: 'for all have sinned and fall short of the glory of God,',
    translation: 'ESV'
  },
  {
    id: 'romans-6-23',
    reference: 'Romans 6:23 (T&T 19)',
    text: 'For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord.',
    translation: 'ESV'
  },
  {
    id: 'romans-8-28',
    reference: 'Romans 8:28 (T&T 20)',
    text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    translation: 'ESV'
  },
  {
    id: 'romans-10-9',
    reference: 'Romans 10:9 (T&T 21)',
    text: 'because, if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved.',
    translation: 'ESV'
  },
  {
    id: '1-corinthians-10-31',
    reference: '1 Corinthians 10:31 (T&T 22)',
    text: 'So, whether you eat or drink, or whatever you do, do all to the glory of God.',
    translation: 'ESV'
  },
  {
    id: '2-corinthians-5-17',
    reference: '2 Corinthians 5:17 (T&T 23)',
    text: 'Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.',
    translation: 'ESV'
  },
  {
    id: 'galatians-5-22-23',
    reference: 'Galatians 5:22-23 (T&T 24)',
    text: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.',
    translation: 'ESV'
  },
  {
    id: 'ephesians-2-8-9',
    reference: 'Ephesians 2:8-9 (T&T 25)',
    text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God, not a result of works, so that no one may boast.',
    translation: 'ESV'
  },
  {
    id: 'ephesians-6-1',
    reference: 'Ephesians 6:1 (T&T 26)',
    text: 'Children, obey your parents in the Lord, for this is right.',
    translation: 'ESV'
  },
  {
    id: 'philippians-2-3-4',
    reference: 'Philippians 2:3-4 (T&T 27)',
    text: 'Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves. Let each of you look not only to his own interests, but also to the interests of others.',
    translation: 'ESV'
  },
  {
    id: 'colossians-3-20',
    reference: 'Colossians 3:20 (T&T 28)',
    text: 'Children, obey your parents in everything, for this pleases the Lord.',
    translation: 'ESV'
  },
  {
    id: '1-timothy-4-12',
    reference: '1 Timothy 4:12 (T&T 29)',
    text: 'Let no one despise you for your youth, but set the believers an example in speech, in conduct, in love, in faith, in purity.',
    translation: 'ESV'
  },
  {
    id: '2-timothy-3-16-17',
    reference: '2 Timothy 3:16-17 (T&T 30)',
    text: 'All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness, that the man of God may be complete, equipped for every good work.',
    translation: 'ESV'
  },
  {
    id: 'hebrews-12-1',
    reference: 'Hebrews 12:1 (T&T 31)',
    text: 'Therefore, since we are surrounded by so great a cloud of witnesses, let us also lay aside every weight, and sin which clings so closely, and let us run with endurance the race that is set before us,',
    translation: 'ESV'
  },
  {
    id: 'james-1-22',
    reference: 'James 1:22 (T&T 32)',
    text: 'But be doers of the word, and not hearers only, deceiving yourselves.',
    translation: 'ESV'
  },
  {
    id: '1-peter-5-7',
    reference: '1 Peter 5:7 (T&T 33)',
    text: 'casting all your anxieties on him, because he cares for you.',
    translation: 'ESV'
  },
  {
    id: '1-john-1-9',
    reference: '1 John 1:9 (T&T 34)',
    text: 'If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.',
    translation: 'ESV'
  },
  {
    id: 'revelation-4-11',
    reference: 'Revelation 4:11 (T&T 35)',
    text: 'Worthy are you, our Lord and God, to receive glory and honor and power, for you created all things, and by your will they existed and were created.',
    translation: 'ESV'
  },
  {
    id: 'tt-agents-grace',
    reference: 'T&T Agents of Grace (Theme Verse)',
    text: 'We are agents of grace, called to serve and love, bringing hope and healing in Jesus name.',
    translation: 'AWANA T&T'
  }
])

const selectedVerseId = ref('')
const currentVerse = ref<BibleVerse | null>(null)
const typingMode = ref<'full' | 'progressive'>('progressive')
const userInput = ref('')
const isActive = ref(false)
const isCompleted = ref(false)
const startTime = ref<number | null>(null)
const inputRef = ref<HTMLTextAreaElement>()

// Computed properties
const displayText = computed(() => {
  if (!currentVerse.value) return ''

  if (typingMode.value === 'full') {
    return currentVerse.value.text
  } else {
    // Progressive reveal mode
    const correctChars = userInput.value.length
    return currentVerse.value.text.substring(0, correctChars + 1)
  }
})

const accuracy = computed(() => {
  if (userInput.value.length === 0) return 100

  let correct = 0
  for (let i = 0; i < userInput.value.length; i++) {
    if (userInput.value[i] === currentVerse.value?.text[i]) {
      correct++
    }
  }

  return Math.round((correct / userInput.value.length) * 100)
})

const wpm = computed(() => {
  if (!startTime.value || userInput.value.length === 0) return 0

  const timeElapsed = (Date.now() - startTime.value) / 1000 / 60 // minutes
  const wordsTyped = userInput.value.split(' ').length
  return Math.round(wordsTyped / timeElapsed)
})

const earnedPoints = computed(() => {
  if (!isCompleted.value) return 0

  const basePoints = 10
  const accuracyBonus = Math.floor(accuracy.value / 10) * 2
  const speedBonus = Math.floor(wpm.value / 10) * 1

  return basePoints + accuracyBonus + speedBonus
})

// Methods
const selectVerse = () => {
  const verse = bibleVerses.value.find(v => v.id === selectedVerseId.value)
  currentVerse.value = verse || null
  resetTyping()
}

const startTyping = () => {
  if (!currentVerse.value) return

  isActive.value = true
  isCompleted.value = false
  userInput.value = ''
  startTime.value = Date.now()

  nextTick(() => {
    inputRef.value?.focus()
  })
}

const resetTyping = () => {
  isActive.value = false
  isCompleted.value = false
  userInput.value = ''
  startTime.value = null
}

const checkInput = () => {
  if (!currentVerse.value || !isActive.value) return

  const targetText = currentVerse.value.text

  // Check if completed
  if (userInput.value === targetText) {
    isActive.value = false
    isCompleted.value = true

    // Award points
    gamificationStore.addPoints(earnedPoints.value)

    // Award achievements
    gamificationStore.earnBadge('first-session')
    if (accuracy.value === 100) {
      gamificationStore.earnBadge('perfect-verse')
    }
  }
}

const getCharClass = (index: number) => {
  if (index >= userInput.value.length) {
    return 'text-gray-400'
  }

  if (userInput.value[index] === currentVerse.value?.text[index]) {
    return 'text-green-600 bg-green-100'
  } else {
    return 'text-red-600 bg-red-100'
  }
}

onMounted(() => {
  // Pre-select the first T&T verse
  selectedVerseId.value = 'john-3-16'
  selectVerse()
})
</script>

<style scoped>
.bible-typing {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.font-serif {
  font-family: 'Times New Roman', serif;
}
</style>