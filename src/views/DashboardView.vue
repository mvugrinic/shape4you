<template>
  <div class="dashboard">
    <div class="main">
      <aside class="sidebar">
        <div class="sidebar-top">
          <div class="logo-box">
            <img src="/LogoWhite.png" alt="Shape 4 You" />
          </div>

          <nav class="nav">
            <button
              class="nav-button"
              :class="{ active: activePage === 'dashboard' }"
              type="button"
              @click="activePage = 'dashboard'"
            >
              <span>🏠</span>
              <strong>Dashboard</strong>
            </button>

            <button
              class="nav-button"
              :class="{ active: activePage === 'progress' }"
              type="button"
              @click="activePage = 'progress'"
            >
              <span>📈</span>
              <strong>Progress</strong>
            </button>

            <button
              class="nav-button"
              type="button"
              @click="router.push('/leaderboard')"
            >
              <span>🏆</span>
              <strong>Leaderboard</strong>
            </button>
          </nav>
        </div>

        <button class="logout-button" type="button" @click="logout">
          Logout
        </button>
      </aside>

      <section v-if="user" class="content">
        <div class="top-row">
          <div>
            <h1>Dobrodošao, {{ user.name }} 👋</h1>
            <p>Ovo je tvoj personalizirani workout dashboard.</p>
          </div>

          <div class="mini-stats">
            <div>
              🔥
              <strong>{{ user.streak }}</strong>
            </div>

            <div>
              🏆
              <strong>{{ user.points }}</strong>
            </div>
          </div>
        </div>

        <template v-if="activePage === 'dashboard'">
          <div class="section-title">
            <h3>Statistika</h3>

            <button
              class="small-button"
              type="button"
              @click="toggleStatsEdit"
            >
              {{ isEditingStats ? 'Cancel' : 'Edit' }}
            </button>
          </div>

          <div class="stats-grid">
            <article
              class="stat-card bmi-card"
              :class="getBmiClass(user.profile.bmi)"
            >
              <span class="label">BMI</span>

              <h2>{{ user.profile.bmi }}</h2>

              <strong class="bmi-state">
                {{ getBmiCategory(user.profile.bmi) }}
              </strong>

              <div class="bmi-bar">
                <span class="bmi-dot"></span>
              </div>
            </article>

            <article class="stat-card">
              <span class="label">Težina</span>

              <h2>
                {{ user.profile.weight }}
                {{ user.profile.weightUnit }}
              </h2>
            </article>

            <article class="stat-card">
              <span class="label">Visina</span>

              <h2>{{ formatHeight(user.profile) }}</h2>
            </article>
          </div>

          <div v-if="isEditingStats" class="edit-card stats-editor">
            <div class="field">
              <label>Težina</label>

              <div class="field-row">
                <input
                  v-model.number="editableWeight"
                  type="number"
                  step="0.1"
                />

                <select v-model="editableWeightUnit">
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label>Visina</label>

              <template v-if="editableHeightUnit === 'cm'">
                <div class="field-row">
                  <input
                    v-model.number="editableHeightCm"
                    type="number"
                    step="0.1"
                  />

                  <select v-model="editableHeightUnit">
                    <option value="cm">cm</option>
                    <option value="ft-in">ft / in</option>
                  </select>
                </div>
              </template>

              <template v-else>
                <div class="height-row">
                  <input
                    v-model.number="editableHeightFeet"
                    type="number"
                    placeholder="ft"
                  />

                  <input
                    v-model.number="editableHeightInches"
                    type="number"
                    placeholder="in"
                  />
                </div>

                <select v-model="editableHeightUnit">
                  <option value="cm">cm</option>
                  <option value="ft-in">ft / in</option>
                </select>
              </template>
            </div>

            <p v-if="statsError" class="error">
              {{ statsError }}
            </p>

            <button
              class="primary-button save-stats"
              type="button"
              @click="saveStats"
            >
              Save stats
            </button>
          </div>

          <div class="dashboard-body">
            <div class="left-column">
              <GoalsCard
                :selected-goals="user.profile.selectedGoals"
                :goals="goals"
                @save-goals="saveGoals"
              />

              <WorkoutTabs
                :workouts="user.profile.generatedWorkouts"
                :selected-days="user.profile.selectedDays"
                :days="days"
                :is-completed-today="isWorkoutCompletedToday()"
                @start-workout="startWorkout"
                @save-days="saveDays"
              />
            </div>

            <RightSidebar
              :user="user"
              :spotify-connected="spotifyConnected"
              :daily-challenge="dailyChallenge"
              :challenge-completed-today="challengeCompletedToday"
              :time-until-next-challenge="timeUntilNextChallenge"
              @connect-spotify="connectSpotify"
              @complete-challenge="completeChallenge"
            />
          </div>
        </template>

        <ProgressTracker
          v-if="activePage === 'progress'"
          :user="user"
          @save-user="updateUserData"
        />

        <WorkoutEditor
          v-if="activeWorkout"
          :workout="activeWorkout"
          :exercise-library="exerciseLibrary"
          :exercise-categories="exerciseCategories"
          :can-complete="canCompleteActiveWorkout()"
          @close="closeWorkout"
          @complete="completeWorkout"
          @save="updateUserData"
        />
      </section>

      <section v-else class="content loading-state">
        <p>Učitavanje...</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'

import GoalsCard from '../components/GoalsCard.vue'
import ProgressTracker from '../components/ProgressTracker.vue'
import RightSidebar from '../components/RightSidebar.vue'
import WorkoutEditor from '../components/WorkoutEditor.vue'
import WorkoutTabs from '../components/WorkoutTabs.vue'

import { auth } from '../firebase.js'
import {
  getCurrentFirebaseUser,
  getUserData,
  saveUserData,
} from '../services/userService.js'

import {
  exerciseLibrary,
  exerciseCategories,
} from '../data/exercises.js'

import {
  workoutLibrary,
  fallbackWorkout,
} from '../data/workouts.js'

const router = useRouter()

const user = ref(null)
const firebaseUser = ref(null)
const activePage = ref('dashboard')
const activeWorkout = ref(null)
const spotifyConnected = ref(false)

const dailyChallenge = ref('')
const challengeCompletedToday = ref(false)
const timeUntilNextChallenge = ref('')
let timerInterval = null

const isEditingStats = ref(false)
const statsError = ref('')
const editableWeight = ref(null)
const editableWeightUnit = ref('kg')
const editableHeightUnit = ref('cm')
const editableHeightCm = ref(null)
const editableHeightFeet = ref(null)
const editableHeightInches = ref(null)

const days = [
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
  'Nedjelja',
]

const goals = [
  'Trbuh',
  'Prsa',
  'Leđa',
  'Ramena',
  'Biceps',
  'Triceps',
  'Noge',
  'Gluteus',
  'Listovi',
  'Podlaktice',
  'Kardio',
  'Rastezanje i mobilnost',
]

const challenges = [
  'Napravi 20 sklekova',
  'Prošetaj 30 minuta',
  'Napravi plank 60 sekundi',
  'Odradi 50 jumping jackova',
  'Napravi 30 čučnjeva',
]

onMounted(async () => {
  await loadUser()

  if (!user.value) return

  prepareUserDefaults()
  prepareWorkoutData()
  prepareDailyChallenge()
  updateUserData()
})

onUnmounted(() => {
  clearInterval(timerInterval)
})

async function loadUser() {
  firebaseUser.value = await getCurrentFirebaseUser()

  if (!firebaseUser.value) {
    router.push('/login')
    return
  }

  const savedUser = await getUserData(firebaseUser.value.uid)

  if (!savedUser) {
    router.push('/login')
    return
  }

  if (!savedUser.profileCompleted || !savedUser.profile) {
    router.push('/onboarding')
    return
  }

  user.value = savedUser
}

function prepareUserDefaults() {
  user.value.points = Number(user.value.points || 0)
  user.value.streak = Number(user.value.streak || 0)
  user.value.lastChallengeDate ||= null
  user.value.completedChallenges ||= []
  user.value.completedWorkouts ||= []
  user.value.workoutHistory ||= []
}

function prepareWorkoutData() {
  const workouts = user.value.profile.generatedWorkouts

  if (!workouts || workouts.length === 0) {
    user.value.profile.generatedWorkouts = generateWorkouts(
      user.value.profile.selectedDays || [],
      user.value.profile.selectedGoals || []
    )
    return
  }

  user.value.profile.generatedWorkouts = workouts.map(normalizeWorkout)
}

async function updateUserData() {
  await saveUserData(user.value)
}

function updateUserProfile(profile) {
  user.value = {
    ...user.value,
    profile,
  }

  updateUserData()
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getTodayString() {
  return getLocalDateString()
}

function formatHeight(profile) {
  return profile.heightUnit === 'ft-in'
    ? profile.height
    : `${profile.height} cm`
}

function parseFtIn(heightText) {
  const match = String(heightText).match(/(\d+)\s*ft\s*(\d+)?/)

  return {
    feet: Number(match?.[1] || 5),
    inches: Number(match?.[2] || 0),
  }
}

function calculateBmi(weightKg, heightM) {
  return (weightKg / (heightM * heightM)).toFixed(1)
}

function calculateBmiFromStats(weight, weightUnit, heightUnit) {
  const weightKg = weightUnit === 'lbs'
    ? weight * 0.45359237
    : weight

  const heightM = heightUnit === 'cm'
    ? editableHeightCm.value / 100
    : (Number(editableHeightFeet.value) * 12 + Number(editableHeightInches.value)) * 0.0254

  return calculateBmi(weightKg, heightM)
}

function getBmiCategory(bmi) {
  const value = Number(bmi)

  if (value < 18.5) return 'Underweight'
  if (value < 25) return 'Normal'
  if (value < 30) return 'Overweight'

  return 'Obese'
}

function getBmiClass(bmi) {
  const value = Number(bmi)

  if (value < 18.5) return 'bmi-underweight'
  if (value < 25) return 'bmi-normal'
  if (value < 30) return 'bmi-overweight'

  return 'bmi-obese'
}

function toggleStatsEdit() {
  isEditingStats.value = !isEditingStats.value
  statsError.value = ''

  if (!isEditingStats.value) return

  const profile = user.value.profile

  editableWeight.value = Number(profile.weight)
  editableWeightUnit.value = profile.weightUnit
  editableHeightUnit.value = profile.heightUnit || 'cm'

  if (editableHeightUnit.value === 'cm') {
    editableHeightCm.value = Number(profile.height)
    return
  }

  const { feet, inches } = parseFtIn(profile.height)

  editableHeightFeet.value = feet
  editableHeightInches.value = inches
}

function saveStats() {
  statsError.value = ''

  if (!editableWeight.value) {
    statsError.value = 'Unesi težinu.'
    return
  }

  if (editableHeightUnit.value === 'cm' && !editableHeightCm.value) {
    statsError.value = 'Unesi visinu.'
    return
  }

  if (
    editableHeightUnit.value === 'ft-in' &&
    (!editableHeightFeet.value || editableHeightInches.value === null)
  ) {
    statsError.value = 'Unesi visinu u ft i in.'
    return
  }

  updateUserProfile({
    ...user.value.profile,
    weight: editableWeight.value,
    weightUnit: editableWeightUnit.value,
    height: editableHeightUnit.value === 'cm'
      ? editableHeightCm.value
      : `${editableHeightFeet.value} ft ${editableHeightInches.value} in`,
    heightUnit: editableHeightUnit.value,
    bmi: calculateBmiFromStats(
      editableWeight.value,
      editableWeightUnit.value,
      editableHeightUnit.value
    ),
  })

  isEditingStats.value = false
}

watch(editableWeightUnit, (newUnit, oldUnit) => {
  if (!isEditingStats.value || !editableWeight.value) return

  if (oldUnit === 'kg' && newUnit === 'lbs') {
    editableWeight.value = Number((editableWeight.value * 2.20462).toFixed(1))
  }

  if (oldUnit === 'lbs' && newUnit === 'kg') {
    editableWeight.value = Number((editableWeight.value * 0.45359237).toFixed(1))
  }
})

watch(editableHeightUnit, (newUnit, oldUnit) => {
  if (!isEditingStats.value) return

  if (oldUnit === 'cm' && newUnit === 'ft-in') {
    const totalInches = Math.round(editableHeightCm.value / 2.54)

    editableHeightFeet.value = Math.floor(totalInches / 12)
    editableHeightInches.value = totalInches % 12
  }

  if (oldUnit === 'ft-in' && newUnit === 'cm') {
    const totalInches =
      Number(editableHeightFeet.value) * 12 + Number(editableHeightInches.value)

    editableHeightCm.value = Number((totalInches * 2.54).toFixed(1))
  }
})

function saveGoals(newGoals) {
  updateUserProfile({
    ...user.value.profile,
    selectedGoals: newGoals,
    generatedWorkouts: generateWorkouts(
      user.value.profile.selectedDays,
      newGoals
    ),
  })
}

function saveDays(newDays) {
  updateUserProfile({
    ...user.value.profile,
    selectedDays: newDays,
    generatedWorkouts: generateWorkouts(
      newDays,
      user.value.profile.selectedGoals
    ),
  })
}

function findExerciseTemplate(name) {
  for (const category of exerciseCategories) {
    const exercise = exerciseLibrary[category].find(item => item.name === name)

    if (exercise) {
      return {
        ...exercise,
        category,
      }
    }
  }

  return null
}

function normalizeExercise(exercise) {
  const template = findExerciseTemplate(exercise.name)

  return {
    name: exercise.name,
    sets: exercise.sets || template?.sets || 3,
    reps: exercise.reps || template?.reps || '10',
    category: exercise.category || template?.category || 'Custom',
  }
}

function normalizeWorkout(workout) {
  return {
    ...workout,
    exercises: (workout.exercises || []).map(normalizeExercise),
  }
}

function getDifferentExercises(exercises, amount = 4) {
  return [...exercises]
    .sort(() => Math.random() - 0.5)
    .slice(0, amount)
    .map(normalizeExercise)
}

function generateWorkouts(selectedDays, selectedGoals) {
  const workoutOptions = selectedGoals
    .map(goal => workoutLibrary[goal])
    .filter(Boolean)

  const finalWorkoutOptions = workoutOptions.length > 0
    ? workoutOptions
    : [fallbackWorkout]

  return selectedDays.map((day, index) => {
    const workout = finalWorkoutOptions[index % finalWorkoutOptions.length]

    return {
      day,
      workoutType: workout.workoutType,
      exercises: getDifferentExercises(workout.exercises),
      completed: false,
    }
  })
}

function getTodayWorkoutDay() {
  return [
    'Nedjelja',
    'Ponedjeljak',
    'Utorak',
    'Srijeda',
    'Četvrtak',
    'Petak',
    'Subota',
  ][new Date().getDay()]
}

function isTodayWorkout(workout) {
  return workout.day === getTodayWorkoutDay()
}

function canCompleteActiveWorkout() {
  return activeWorkout.value && isTodayWorkout(activeWorkout.value)
}

function getWorkoutKey() {
  return getTodayString()
}

function isWorkoutCompletedToday() {
  return user.value.completedWorkouts?.includes(getWorkoutKey()) || false
}

function startWorkout(workout) {
  if (isTodayWorkout(workout) && isWorkoutCompletedToday()) return

  activeWorkout.value = workout
}

function closeWorkout() {
  activeWorkout.value = null
}

function completeWorkout() {
  if (!activeWorkout.value || !isTodayWorkout(activeWorkout.value)) return

  const workoutKey = getWorkoutKey()

  if (!user.value.completedWorkouts.includes(workoutKey)) {
    user.value.completedWorkouts.push(workoutKey)

    user.value.workoutHistory.unshift({
      date: workoutKey,
      workoutDay: activeWorkout.value.day,
      workoutType: activeWorkout.value.workoutType,
      exerciseCount: activeWorkout.value.exercises.length,
      points: 20,
    })

    user.value.workoutHistory = user.value.workoutHistory.slice(0, 20)
    user.value.points += 20
    updateUserData()
  }

  activeWorkout.value = null
}

function prepareDailyChallenge() {
  generateDailyChallenge()
  checkCompletedToday()
  startChallengeTimer()
}

function generateDailyChallenge() {
  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((today - startOfYear) / 86400000)

  dailyChallenge.value = challenges[dayOfYear % challenges.length]
}

function checkCompletedToday() {
  challengeCompletedToday.value =
    user.value.completedChallenges.includes(getTodayString())
}

function completeChallenge() {
  const today = getTodayString()

  if (user.value.completedChallenges.includes(today)) return

  user.value.completedChallenges.push(today)
  user.value.points += 10
  updateStreak(today)

  challengeCompletedToday.value = true
  updateUserData()
}

function updateStreak(today) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (user.value.lastChallengeDate === getLocalDateString(yesterday)) {
    user.value.streak += 1
  } else {
    user.value.streak = 1
  }

  user.value.lastChallengeDate = today
}

function startChallengeTimer() {
  updateChallengeTimer()
  timerInterval = setInterval(updateChallengeTimer, 1000)
}

function updateChallengeTimer() {
  const now = new Date()
  const midnight = new Date()

  midnight.setHours(24, 0, 0, 0)

  const difference = midnight - now

  if (difference <= 0) {
    generateDailyChallenge()
    checkCompletedToday()
    updateChallengeTimer()
    return
  }

  const hours = Math.floor(difference / 3600000)
  const minutes = Math.floor((difference / 60000) % 60)
  const seconds = Math.floor((difference / 1000) % 60)

  timeUntilNextChallenge.value = `${hours}h ${minutes}m ${seconds}s`
}

function connectSpotify() {
  spotifyConnected.value = true
}

async function logout() {
  await signOut(auth)
  router.push('/login')
}
</script>

<style scoped>
* { box-sizing: border-box; }

.dashboard {
  width: 100%;
  min-height: 100vh;
  font-family: Inter, Arial, sans-serif;
  color: #fff;
  background: #0b0f1a;
}

.main {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  background:
    radial-gradient(122.18% 124.1% at 18% 8%, rgba(124, 58, 237, 0.22) 0%, rgba(124, 58, 237, 0) 30%),
    radial-gradient(117.93% 119.78% at 80% 12%, rgba(91, 124, 250, 0.14) 0%, rgba(91, 124, 250, 0) 28%),
    linear-gradient(134.55deg, #050914 0%, #0a1020 55%, #070b14 100%);
}

.sidebar {
  width: 250px;
  min-height: 100vh;
  flex: 0 0 250px;
  padding: 26px 14px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(6, 11, 22, 0.9);
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(9px);
}

.logo-box {
  width: 140px;
  height: 70px;
  margin: 0 0 34px 6px;
}

.logo-box img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.nav-button {
  width: 100%;
  height: 56px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 0;
  border-radius: 12px;
  color: #aeb7c8;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  text-align: left;
}

.nav-button.active {
  color: #fff;
  background: linear-gradient(103.81deg, rgba(124, 58, 237, 0.96), rgba(91, 33, 182, 0.88));
  box-shadow: 0 18px 45px rgba(124, 58, 237, 0.28);
}

.logout-button,
.small-button {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.62);
  color: #e5e7eb;
  font-weight: 800;
  cursor: pointer;
}

.logout-button {
  width: 100%;
  height: 52px;
}

.content {
  min-width: 0;
  flex: 1;
  padding: 28px 32px 38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.top-row,
.section-title,
.stats-grid,
.dashboard-body,
.edit-card {
  width: min(1126px, 100%);
  max-width: 1126px;
  margin-left: auto;
  margin-right: auto;
}

.top-row {
  min-height: 64px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.top-row h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: -0.7px;
}

.top-row p {
  margin: 8px 0 0;
  color: #9ca3af;
  font-size: 16px;
}

.mini-stats {
  min-height: 54px;
  padding: 9px;
  display: flex;
  gap: 8px;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.48);
}

.mini-stats > div {
  min-width: 52px;
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #cbd5e1;
}

.section-title,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  min-height: 48px;
  padding-top: 10px;
}

.section-title h3,
.card-header h3 {
  margin: 0;
  font-size: 18.7px;
}

.small-button {
  min-height: 38px;
  padding: 0 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.stat-card,
.goal-card,
.side-card,
.edit-card,
.progress-placeholder {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(20, 28, 48, 0.92), rgba(10, 16, 30, 0.86));
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.22), inset 0 1px 0 1px rgba(255, 255, 255, 0.04);
}

.stat-card {
  min-height: 164px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.stat-card .label {
  color: #aeb7c8;
  font-size: 15px;
}

.stat-card h2 {
  margin: 0;
  font-size: 32px;
  line-height: 39px;
  letter-spacing: -0.5px;
}

.bmi-card { gap: 18px; }

.bmi-state {
  color: #facc15;
  font-size: 14px;
  font-weight: 900;
}

.bmi-bar {
  position: relative;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #38bdf8 0%, #22c55e 35%, #facc15 65%, #ef4444 100%);
}

.bmi-dot {
  position: absolute;
  top: -3px;
  width: 14px;
  height: 14px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12);
}

.dashboard-body {
  display: grid;
  grid-template-columns: minmax(0, 764px) 340px;
  justify-content: center;
  gap: 22px;
  align-items: start;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
}

.left-column { gap: 18px; }
.right-column { gap: 16px; }

.goal-card {
  min-height: 146px;
  padding: 24px;
}

.goal-list {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.goal-chip {
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(124, 58, 237, 0.26);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.18);
  color: #d8b4fe;
  font-size: 16px;
  font-weight: 800;
}

.goal-chip.editable { cursor: pointer; }
.goal-chip.selected {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.35);
  color: #fff;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.day-card {
  min-height: 99px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 11px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  background: rgba(7, 12, 24, 0.62);
  color: #9ca3af;
  cursor: pointer;
  text-align: center;
}

.day-card strong {
  color: #c084fc;
  font-size: 16px;
}

.day-card span { font-size: 13px; }

.day-card.active {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.18);
  box-shadow: inset 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.edit-days {
  color: #fff;
  font-weight: 900;
}

.side-card {
  width: 340px;
  padding: 24px;
}

.spotify-card { min-height: 211px; }

.small-label,
.number-card span {
  color: #aeb7c8;
}

.spotify-card h2,
.number-card h2 {
  margin: 18px 0 8px;
  font-size: 28px;
}

.spotify-card p,
.challenge-card p {
  color: #aeb7c8;
  font-size: 16px;
}

.spotify-button {
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid rgba(168, 85, 247, 0.4);
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.48);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.number-card { min-height: 132px; }

.challenge-card h3,
.history-card h3 {
  margin: 0;
  font-size: 18.7px;
}

.primary-button {
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(98.25deg, #7c3aed, #6d5dfc);
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.25);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
}

.primary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.full { width: 100%; }

.history-card { min-height: 132px; }

.history-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  min-height: 49px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(7, 12, 24, 0.56);
}

.history-item div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item span {
  color: #9ca3af;
  font-size: 12px;
}

.history-item b {
  color: #22c55e;
  white-space: nowrap;
}

.empty-history {
  margin-top: 12px;
  min-height: 49px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  background: rgba(7, 12, 24, 0.56);
  color: #9ca3af;
  font-size: 12px;
}

.edit-card {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 14px;
}

.field {
  min-width: 220px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 800;
}

.field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #263246;
  border-radius: 12px;
  outline: 0;
  background: #0f172a;
  color: #fff;
}

.save-stats { height: 46px; }

.days-editor {
  display: block;
}

.days-editor .goal-list {
  margin-bottom: 18px;
}

.progress-placeholder {
  width: 100%;
  max-width: 1126px;
  padding: 30px;
}

.progress-placeholder h2 { margin-top: 0; }
.progress-placeholder p { color: #9ca3af; }

@media (max-width: 1180px) {
  .dashboard-body {
    grid-template-columns: 1fr;
  }

  .right-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .side-card { width: 100%; }
}

@media (max-width: 900px) {
  .main { display: block; }

  .sidebar {
    width: 100%;
    min-height: auto;
    padding: 16px;
  }

  .sidebar-top {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .logo-box {
    margin: 0;
    flex: 0 0 120px;
  }

  .nav {
    flex: 1;
    flex-direction: row;
  }

  .logout-button { margin-top: 15px; }
  .content { padding: 22px 16px; }

  .stats-grid,
  .right-column {
    grid-template-columns: 1fr;
  }

  .days-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .top-row,
  .sidebar-top {
    flex-direction: column;
  }

  .nav {
    width: 100%;
    flex-direction: column;
  }

  .top-row h1 { font-size: 28px; }
  .days-grid { grid-template-columns: 1fr; }
}

.field-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px;
  gap: 10px;
}

.field select,
.stats-editor select {
  width: 100%;
  height: 46px;
  padding: 0 12px;
  border: 1px solid #263246;
  border-radius: 12px;
  outline: 0;
  background: #0f172a;
  color: #fff;
}

.height-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.error {
  width: 100%;
  margin: 0;
  color: #f87171;
  font-size: 13px;
  font-weight: 700;
}

.loading-state {
  min-height: 100vh;
  display: grid;
  place-items: center;
  color: #9ca3af;
}

.bmi-underweight .bmi-state {
  color: #38bdf8;
}

.bmi-normal .bmi-state {
  color: #22c55e;
}

.bmi-overweight .bmi-state {
  color: #facc15;
}

.bmi-obese .bmi-state {
  color: #ef4444;
}

.bmi-underweight .bmi-dot {
  left: 14%;
}

.bmi-normal .bmi-dot {
  left: 43%;
}

.bmi-overweight .bmi-dot {
  left: 68%;
}

.bmi-obese .bmi-dot {
  left: 88%;
}


.left-column {
  width: 764px;
  max-width: 100%;
}

.right-column {
  width: 340px;
  max-width: 100%;
}

.goal-card {
  width: 100%;
}

.days-grid {
  width: 100%;
}

.top-row {
  align-self: center;
}

.section-title {
  align-self: center;
}

.stats-grid {
  align-self: center;
}

.dashboard-body {
  align-self: center;
}

@media (min-width: 1440px) {
  .content {
    padding-left: 48px;
    padding-right: 48px;
  }
}

</style>