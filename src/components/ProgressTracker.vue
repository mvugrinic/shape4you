<template>
  <div class="progress-page">
    <div class="dashboard-card progress-card progress-page-card">
      <div class="card-header">
        <div>
          <h3>Progress Tracker 📈</h3>
          <p class="card-subtitle">
            Prati težinu, BMI i odrađene treninge.
          </p>
        </div>

        <div class="toggle-buttons">
          <button
            type="button"
            :class="{ active: progressChartPeriod === 'week' }"
            @click="progressChartPeriod = 'week'"
          >
            Tjedan
          </button>

          <button
            type="button"
            :class="{ active: progressChartPeriod === 'month' }"
            @click="progressChartPeriod = 'month'"
          >
            Mjesec
          </button>
        </div>
      </div>

      <div class="weight-update-card">
        <div>
          <p class="progress-label">Trenutna težina</p>
          <h2>{{ getLatestWeight() }} kg</h2>
          <span>BMI: {{ user.profile.bmi }}</span>
        </div>

        <div class="weight-input-box">
          <input
            v-model.number="progressWeight"
            type="number"
            step="0.1"
            placeholder="Nova težina"
          />

          <button class="save-button small-save" @click="saveProgressWeight">
            Spremi
          </button>
        </div>
      </div>

      <div class="goal-weight-card">
        <div>
          <p class="progress-label">Ciljna težina</p>
          <h2>{{ getGoalWeight() ? getGoalWeight() + ' kg' : 'Nije postavljeno' }}</h2>
        </div>

        <div class="weight-input-box">
          <input
            v-model.number="targetWeight"
            type="number"
            step="0.1"
            placeholder="Cilj kg"
          />

          <button class="save-button small-save" @click="saveTargetWeight">
            Spremi cilj
          </button>
        </div>
      </div>

      <p v-if="progressWeightError" class="error">
        {{ progressWeightError }}
      </p>

      <p v-if="targetWeightError" class="error">
        {{ targetWeightError }}
      </p>

      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h4>Graf težine - {{ getProgressPeriodLabel() }}</h4>
            <p>Promjena težine za odabrani period.</p>
          </div>

          <strong>{{ getWeightChange(progressChartPeriod) }}</strong>
        </div>

        <div
          v-if="getWeightChartEntries(progressChartPeriod).length < 2"
          class="empty-chart"
        >
          Unesi barem dvije težine za prikaz grafa.
        </div>

        <svg v-else class="weight-chart" viewBox="0 0 320 160">
          <line
            v-if="getWeightGoalLine(progressChartPeriod)"
            x1="20"
            x2="300"
            :y1="getWeightGoalLine(progressChartPeriod).y"
            :y2="getWeightGoalLine(progressChartPeriod).y"
            class="goal-line"
          />

          <text
            v-if="getWeightGoalLine(progressChartPeriod)"
            x="300"
            :y="getWeightGoalLine(progressChartPeriod).y - 6"
            text-anchor="end"
            class="goal-line-label"
          >
            Cilj {{ getGoalWeight() }}kg
          </text>

          <polyline
            :points="getWeightChartPolyline(progressChartPeriod)"
            fill="none"
            stroke="url(#weightGradient)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <circle
            v-for="point in getWeightChartPointObjects(progressChartPeriod)"
            :key="point.key"
            :cx="point.x"
            :cy="point.y"
            r="5"
            class="chart-dot"
          />

          <text
            v-for="point in getWeightChartPointObjects(progressChartPeriod)"
            :key="point.key + '-label'"
            :x="point.x"
            :y="point.y - 10"
            text-anchor="middle"
            class="chart-label"
          >
            {{ point.weight }}kg
          </text>

          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#7c5cff" />
              <stop offset="100%" stop-color="#5b7cfa" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h4>Graf odrađenih treninga - {{ getProgressPeriodLabel() }}</h4>
            <p>Koliko treninga je odrađeno u odabranom periodu.</p>
          </div>

          <strong>{{ getCompletedWorkoutsForPeriod(progressChartPeriod) }}</strong>
        </div>

        <div
          v-if="getCompletedWorkoutsForPeriod(progressChartPeriod) === 0"
          class="empty-chart"
        >
          Još nema odrađenih treninga za ovaj period.
        </div>

        <svg v-else class="workout-chart" viewBox="0 0 320 170">
          <line
            x1="20"
            y1="125"
            x2="300"
            y2="125"
            class="chart-axis"
          />

          <g
            v-for="bar in getWorkoutChartBars(progressChartPeriod)"
            :key="bar.label"
          >
            <rect
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              rx="6"
              class="workout-bar"
            />

            <text
              :x="bar.x + bar.width / 2"
              :y="bar.y - 8"
              text-anchor="middle"
              class="chart-label"
            >
              {{ bar.count }}
            </text>

            <text
              :x="bar.x + bar.width / 2"
              y="148"
              text-anchor="middle"
              class="chart-label"
            >
              {{ bar.label }}
            </text>
          </g>
        </svg>
      </div>

      <div class="progress-stats-grid">
        <div>
          <p>Početna težina</p>
          <h4>{{ getStartWeight() }} kg</h4>
        </div>

        <div>
          <p>Ciljna težina</p>
          <h4>{{ getGoalWeight() ? getGoalWeight() + ' kg' : '-' }}</h4>
        </div>

        <div>
          <p>Preostalo</p>
          <h4>{{ getWeightToGoalText().replace(' do cilja', '') }}</h4>
        </div>

        <div>
          <p>Napredak</p>
          <h4>{{ getGoalProgress() }}%</h4>
        </div>

        <div>
          <p>Ukupna promjena</p>
          <h4>{{ getTotalWeightChange() }}</h4>
        </div>

        <div>
          <p>Najniža težina</p>
          <h4>{{ getLowestWeight() }} kg</h4>
        </div>

        <div>
          <p>BMI</p>
          <h4>{{ user.profile.bmi }}</h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['save-user'])

const progressWeight = ref(null)
const targetWeight = ref(null)
const progressWeightError = ref('')
const targetWeightError = ref('')
const progressChartPeriod = ref('week')

onMounted(() => {
  prepareWeightHistory()
})

function saveUser() {
  emit('save-user')
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

function getStartOfWeek() {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? -6 : 1 - day

  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  return monday
}

function getEndOfWeek() {
  const sunday = new Date(getStartOfWeek())

  sunday.setDate(sunday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return sunday
}

function isDateInCurrentWeek(dateString) {
  const date = new Date(dateString)

  return date >= getStartOfWeek() && date <= getEndOfWeek()
}

function isDateInCurrentMonth(dateString) {
  const date = new Date(dateString)
  const today = new Date()

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

function parseFtIn(heightText) {
  const match = String(heightText).match(/(\d+)\s*ft\s*(\d+)?/)

  return {
    feet: Number(match?.[1] || 5),
    inches: Number(match?.[2] || 0),
  }
}

function getWeightInKg(weight, unit) {
  const value = Number(weight)

  return unit === 'lbs'
    ? Number((value * 0.45359237).toFixed(1))
    : Number(value.toFixed(1))
}

function getProfileHeightInMeters(profile) {
  if (profile.heightUnit === 'ft-in') {
    const { feet, inches } = parseFtIn(profile.height)

    return (feet * 12 + inches) * 0.0254
  }

  return Number(profile.height) / 100
}

function calculateBmi(weightKg, heightM) {
  return (weightKg / (heightM * heightM)).toFixed(1)
}

function calculateBmiFromWeight(weightKg) {
  const heightM = getProfileHeightInMeters(props.user.profile)

  return heightM
    ? calculateBmi(weightKg, heightM)
    : props.user.profile.bmi
}

function prepareWeightHistory() {
  if (!props.user.weightHistory) {
    const startingWeight = getWeightInKg(
      props.user.profile.weight,
      props.user.profile.weightUnit
    )

    props.user.weightHistory = [
      {
        date: getTodayString(),
        weight: startingWeight,
        bmi: calculateBmiFromWeight(startingWeight),
      },
    ]
  }

  props.user.targetWeight ??= null
  progressWeight.value = getLatestWeight()
  targetWeight.value = props.user.targetWeight

  saveUser()
}

function saveProgressWeight() {
  progressWeightError.value = ''

  if (!progressWeight.value || progressWeight.value <= 0) {
    progressWeightError.value = 'Unesi ispravnu težinu.'
    return
  }

  const weight = Number(Number(progressWeight.value).toFixed(1))
  const bmi = calculateBmiFromWeight(weight)

  props.user.weightHistory ||= []
  props.user.weightHistory.push({
    date: getTodayString(),
    weight,
    bmi,
  })

  props.user.profile.weight = weight
  props.user.profile.weightUnit = 'kg'
  props.user.profile.bmi = bmi
  progressWeight.value = weight

  saveUser()
}

function saveTargetWeight() {
  targetWeightError.value = ''

  if (!targetWeight.value || targetWeight.value <= 0) {
    targetWeightError.value = 'Unesi ispravnu ciljnu težinu.'
    return
  }

  props.user.targetWeight = Number(Number(targetWeight.value).toFixed(1))
  targetWeight.value = props.user.targetWeight

  saveUser()
}

function getWeightHistory() {
  return props.user.weightHistory || []
}

function getLatestWeight() {
  const history = getWeightHistory()

  return history.length
    ? history[history.length - 1].weight
    : getWeightInKg(props.user.profile.weight, props.user.profile.weightUnit)
}

function getStartWeight() {
  return getWeightHistory()[0]?.weight || getLatestWeight()
}

function getLowestWeight() {
  const weights = getWeightHistory().map(entry => Number(entry.weight))

  return weights.length
    ? Math.min(...weights).toFixed(1)
    : getLatestWeight()
}

function getGoalWeight() {
  return props.user.targetWeight
    ? Number(props.user.targetWeight).toFixed(1)
    : null
}

function getWeightToGoalText() {
  const goal = Number(getGoalWeight())

  if (!goal) return 'Postavi ciljnu težinu.'

  const difference = Number(getLatestWeight()) - goal

  if (Math.abs(difference) < 0.05) return 'Cilj je dosegnut 🎯'
  if (difference > 0) return `${difference.toFixed(1)} kg do cilja`

  return `${Math.abs(difference).toFixed(1)} kg ispod cilja`
}

function getGoalProgress() {
  const goal = Number(getGoalWeight())

  if (!goal) return 0

  const start = Number(getStartWeight())
  const current = Number(getLatestWeight())
  const totalNeeded = Math.abs(start - goal)

  if (totalNeeded === 0) return 100

  return Math.min(
    Math.round((Math.abs(start - current) / totalNeeded) * 100),
    100
  )
}

function formatWeightChange(change) {
  if (change === 0) return '0 kg'

  return change > 0
    ? `+${change.toFixed(1)} kg`
    : `${change.toFixed(1)} kg`
}

function getTotalWeightChange() {
  return formatWeightChange(Number(getLatestWeight()) - Number(getStartWeight()))
}

function getWeightChartEntries(period) {
  const history = getWeightHistory()

  if (period === 'week') return history.filter(entry => isDateInCurrentWeek(entry.date))
  if (period === 'month') return history.filter(entry => isDateInCurrentMonth(entry.date))

  return history
}

function getWeightChange(period) {
  const entries = getWeightChartEntries(period)

  if (entries.length < 2) return '0 kg'

  return formatWeightChange(
    Number(entries[entries.length - 1].weight) - Number(entries[0].weight)
  )
}

function getWeightChartPointObjects(period) {
  const entries = getWeightChartEntries(period)

  if (entries.length === 0) return []

  const weights = entries.map(entry => Number(entry.weight))
  const goal = Number(getGoalWeight())

  if (goal) weights.push(goal)

  const minWeight = Math.min(...weights)
  const range = Math.max(...weights) - minWeight || 1

  return entries.map((entry, index) => {
    const x = entries.length === 1
      ? 160
      : 20 + (index / (entries.length - 1)) * 280

    const y = 135 - ((Number(entry.weight) - minWeight) / range) * 110

    return {
      key: `${entry.date}-${index}-${entry.weight}`,
      x,
      y,
      weight: entry.weight,
    }
  })
}

function getWeightChartPolyline(period) {
  return getWeightChartPointObjects(period)
    .map(point => `${point.x},${point.y}`)
    .join(' ')
}

function getWeightGoalLine(period) {
  const goal = Number(getGoalWeight())
  const entries = getWeightChartEntries(period)

  if (!goal || entries.length < 2) return null

  const weights = [...entries.map(entry => Number(entry.weight)), goal]
  const minWeight = Math.min(...weights)
  const range = Math.max(...weights) - minWeight || 1

  return {
    y: 135 - ((goal - minWeight) / range) * 110,
  }
}

function getProgressPeriodLabel() {
  return progressChartPeriod.value === 'week'
    ? 'tjedan'
    : 'mjesec'
}

function getCompletedWorkoutsForPeriod(period) {
  const workouts = props.user.completedWorkouts || []

  return workouts.filter(date =>
    period === 'week'
      ? isDateInCurrentWeek(date)
      : isDateInCurrentMonth(date)
  ).length
}

function getWorkoutChartEntries(period) {
  return period === 'week'
    ? getWeeklyWorkoutChartEntries()
    : getMonthlyWorkoutChartEntries()
}

function getWeeklyWorkoutChartEntries() {
  const labels = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']
  const startOfWeek = getStartOfWeek()

  return labels.map((label, index) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + index)

    const dateString = getLocalDateString(date)
    const count = (props.user.completedWorkouts || [])
      .filter(workoutDate => workoutDate === dateString)
      .length

    return {
      label,
      count,
    }
  })
}

function getMonthlyWorkoutChartEntries() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return [
    { label: '1. tj', start: 1, end: 7 },
    { label: '2. tj', start: 8, end: 14 },
    { label: '3. tj', start: 15, end: 21 },
    { label: '4. tj', start: 22, end: 28 },
    { label: '5. tj', start: 29, end: daysInMonth },
  ]
    .filter((_, index) => index < 4 || daysInMonth >= 29)
    .map(week => ({
      label: week.label,
      count: (props.user.completedWorkouts || []).filter(dateString => {
        const date = new Date(dateString)

        return (
          date.getFullYear() === year &&
          date.getMonth() === month &&
          date.getDate() >= week.start &&
          date.getDate() <= week.end
        )
      }).length,
    }))
}

function getWorkoutChartBars(period) {
  const entries = getWorkoutChartEntries(period)
  const maxCount = Math.max(...entries.map(entry => entry.count), 1)
  const gap = 8
  const barWidth = (272 - gap * (entries.length - 1)) / entries.length

  return entries.map((entry, index) => {
    const height = entry.count === 0 ? 4 : (entry.count / maxCount) * 90

    return {
      label: entry.label,
      count: entry.count,
      x: 24 + index * (barWidth + gap),
      y: 125 - height,
      width: barWidth,
      height,
    }
  })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.progress-page {
  width: 100%;
  max-width: 1126px;
  margin: 0 auto;
}

.progress-page-card {
  width: 100%;
  min-height: 1245px;
}

.dashboard-card {
  position: relative;
  padding: 24px;
  background:
    linear-gradient(
      180deg,
      rgba(20, 28, 48, 0.92) 0%,
      rgba(10, 16, 30, 0.86) 100%
    );
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 1px rgba(255, 255, 255, 0.04);
}

.card-header {
  min-height: 46px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.card-header h3 {
  margin: 0;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 18.7px;
  line-height: 23px;
  font-weight: 700;
}

.card-subtitle {
  margin: 6px 0 0;
  color: #9ca3af;
  font-family: Inter, Arial, sans-serif;
  font-size: 13px;
  line-height: 16px;
}

.toggle-buttons {
  width: 164px;
  height: 44px;
  padding: 4px;
  display: flex;
  gap: 4px;
  background: rgba(15, 23, 42, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
}

.toggle-buttons button {
  flex: 1;
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #9ca3af;
  font-family: "Arial Black", Arial, sans-serif;
  font-size: 13.3px;
  font-weight: 900;
  cursor: pointer;
}

.toggle-buttons button.active {
  background: linear-gradient(114.79deg, #7c3aed 0%, #6d5dfc 100%);
  color: #ffffff;
}

.weight-update-card,
.goal-weight-card,
.chart-card,
.progress-stats-grid > div {
  background: rgba(7, 12, 24, 0.56);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
}

.weight-update-card {
  min-height: 186px;
  padding: 22px 18px 18px;
  display: grid;
  gap: 16px;
  margin-bottom: 16px;
}

.goal-weight-card {
  min-height: 102px;
  margin-top: 0;
  padding: 18px;
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 16px;
  align-items: center;
}

.weight-update-card h2,
.goal-weight-card h2 {
  margin: 4px 0;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 30px;
  line-height: 36px;
  font-weight: 700;
}

.weight-update-card span {
  color: #cbd5e1;
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 19px;
  font-weight: 800;
}

.progress-label,
.goal-weight-card p {
  margin: 0;
  color: #e5e7eb;
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 19px;
  white-space: nowrap;
}

.weight-input-box {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.weight-input-box input {
  height: 46px;
  padding: 0 14px;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  outline: none;
  color: #ffffff;
  font-family: Arial, sans-serif;
  font-size: 13.3px;
}

.weight-input-box input:focus {
  border-color: #7c5cff;
  box-shadow: 0 0 0 4px rgba(124, 92, 255, 0.08);
}

.save-button {
  min-height: 42px;
  margin-top: 16px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #6d5dfc);
  color: #ffffff;
  font-family: "Arial Black", Arial, sans-serif;
  font-size: 13.3px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.25);
}

.small-save {
  margin-top: 0;
}

.chart-card {
  padding: 18px;
  margin-top: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.chart-header h4 {
  margin: 0 0 6px;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 19px;
  font-weight: 700;
}

.chart-header p {
  margin: 0;
  color: #9ca3af;
  font-family: Inter, Arial, sans-serif;
  font-size: 13px;
  line-height: 16px;
}

.chart-header strong {
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 19px;
  white-space: nowrap;
}

.weight-chart,
.workout-chart {
  width: 100%;
  border-radius: 14px;
  overflow: visible;
  background:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 100% 40px, 64px 100%;
}

.weight-chart {
  height: 180px;
}

.workout-chart {
  height: 190px;
}

.chart-dot {
  fill: #ffffff;
  stroke: #7c5cff;
  stroke-width: 3;
}

.workout-bar {
  fill: #7c3aed;
}

.chart-axis {
  stroke: #334155;
  stroke-width: 2;
}

.chart-label {
  fill: #e5e7eb;
  font-size: 11px;
  font-weight: 900;
}

.empty-chart {
  min-height: 110px;
  padding: 18px;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
}

.progress-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.progress-stats-grid > div {
  min-height: 85px;
  padding: 16px;
}

.progress-stats-grid p {
  margin: 0 0 8px;
  color: #9ca3af;
  font-family: Inter, Arial, sans-serif;
  font-size: 13px;
  line-height: 16px;
}

.progress-stats-grid h4 {
  margin: 0;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 22px;
  line-height: 27px;
  font-weight: 700;
}

.goal-line {
  stroke: #facc15;
  stroke-width: 2;
  stroke-dasharray: 6 6;
}

.goal-line-label {
  fill: #facc15;
  font-size: 11px;
  font-weight: 900;
}

.error {
  margin: 14px 0 0;
  color: #f87171;
  font-size: 14px;
}

@media (max-width: 900px) {
  .progress-page {
    max-width: 100%;
  }

  .goal-weight-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .dashboard-card {
    padding: 16px;
  }

  .card-header {
    align-items: stretch;
    flex-direction: column;
  }

  .toggle-buttons {
    width: 100%;
  }

  .progress-stats-grid {
    grid-template-columns: 1fr;
  }

  .weight-input-box {
    grid-template-columns: 1fr;
  }

  .save-button {
    width: 100%;
  }
}
</style>