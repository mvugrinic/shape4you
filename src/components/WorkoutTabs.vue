<template>
  <div class="bottom-workout-tabs">
    <div
      class="day-workout-tab"
      v-for="workout in workouts"
      :key="workout.day"
      :class="{
        active: isTodayWorkout(workout),
        completed: isCompletedToday && isTodayWorkout(workout)
      }"
      @click="$emit('start-workout', workout)"
    >
      <strong>{{ getShortDay(workout.day) }}</strong>
      <span>{{ workout.workoutType }}</span>
    </div>

    <button class="day-edit-tab" @click="toggleEdit">
      {{ isEditing ? 'Cancel' : 'Edit days' }}
    </button>
  </div>

  <div v-if="isEditing" class="edit-card days-edit-card">
    <h3>Uredi dane treninga</h3>

    <div class="chip-grid">
      <button
        v-for="day in days"
        :key="day"
        type="button"
        class="chip"
        :class="{ active: editableDays.includes(day) }"
        @click="toggleDay(day)"
      >
        {{ day }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="save-button" @click="saveDays">
      Save days
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  workouts: {
    type: Array,
    required: true,
  },
  selectedDays: {
    type: Array,
    required: true,
  },
  days: {
    type: Array,
    required: true,
  },
  isCompletedToday: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['start-workout', 'save-days'])

const isEditing = ref(false)
const editableDays = ref([])
const error = ref('')

function toggleEdit() {
  isEditing.value = !isEditing.value
  error.value = ''

  if (isEditing.value) {
    editableDays.value = [...props.selectedDays]
  }
}

function toggleDay(day) {
  editableDays.value = editableDays.value.includes(day)
    ? editableDays.value.filter(item => item !== day)
    : [...editableDays.value, day]

  editableDays.value = props.days.filter(day => editableDays.value.includes(day))
}

function saveDays() {
  error.value = ''

  if (editableDays.value.length === 0) {
    error.value = 'Odaberi barem jedan dan.'
    return
  }

  emit('save-days', editableDays.value)
  isEditing.value = false
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

function getShortDay(day) {
  const shortDays = {
    Ponedjeljak: 'PON',
    Utorak: 'UTO',
    Srijeda: 'SRI',
    Četvrtak: 'ČET',
    Petak: 'PET',
    Subota: 'SUB',
    Nedjelja: 'NED',
  }

  return shortDays[day] || day.slice(0, 3).toUpperCase()
}
</script>

<style scoped>.bottom-workout-tabs {
  width: 100%;
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap: 12px;
}
.day-workout-tab,
.day-edit-tab {
  min-height: 86px;
  border-radius: 16px;
  background: rgba(7, 12, 24, 0.62);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: white;
  padding: 16px;
  cursor: pointer;
  text-align: center;
}
.day-workout-tab.active {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.18);
  box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.2);
}
.day-workout-tab.completed {
  opacity: 0.7;
}
.day-workout-tab strong {
  display: block;
  color: #c084fc;
  font-size: 16px;
  margin-bottom: 8px;
}
.day-workout-tab span {
  color: #9ca3af;
  font-size: 13px;
}
.day-edit-tab {
  font-weight: 900;
  min-width: 104px;
}
.edit-card {
  position: relative;
  background:
    linear-gradient(180deg, rgba(20, 28, 48, 0.92), rgba(10, 16, 30, 0.86));
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 80px rgba(0, 0, 0, 0.22);
  padding: 24px;
}
.edit-card h3 {
  color: white;
  margin: 0 0 18px;
}
.days-edit-card {
  margin-top: 18px;
}
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.18);
  border: 1px solid rgba(124, 58, 237, 0.26);
  color: #d8b4fe;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.chip.active {
  background: linear-gradient(135deg, #7c3aed, #6d5dfc);
  color: white;
  border-color: transparent;
}
.save-button {
  min-height: 42px;
  margin-top: 16px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #6d5dfc);
  color: white;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.25);
}
.error {
  color: #f87171;
  font-size: 14px;
  margin: 14px 0 0;
}


@media (max-width: 1250px) {.bottom-workout-tabs {
  grid-template-columns: repeat(4, 1fr);
}

}


@media (max-width: 700px) {.bottom-workout-tabs {
  grid-template-columns: 1fr;
}

}

</style>