<template>
  <div class="onboarding-view">
    <section class="onboarding-card">
      <div class="logo"></div>

      <h1>Personaliziraj plan</h1>
      <p class="subtitle">
        Odgovori na par pitanja za svoj workout dashboard.
      </p>

      <form @submit.prevent="saveProfile">
        <div class="form-section age-section">
          <label for="ageGroup">Dobna skupina</label>

          <select id="ageGroup" v-model="ageGroup">
            <option disabled value="">Odaberi dobnu skupinu</option>
            <option>15-25</option>
            <option>26-40</option>
            <option>41-60</option>
            <option>60+</option>
          </select>
        </div>

        <div class="two-columns">
          <div class="form-section">
            <label for="weight">Težina</label>

            <input
              id="weight"
              v-model.number="weight"
              type="number"
              step="0.1"
              placeholder="Težina"
            />

            <select v-model="weightUnit">
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>

          <div class="form-section">
            <label>Visina</label>

            <template v-if="heightUnit === 'cm'">
              <input
                v-model.number="height"
                type="number"
                step="0.1"
                placeholder="Visina"
              />
            </template>

            <template v-else>
              <div class="height-row">
                <input
                  v-model.number="heightFeet"
                  type="number"
                  min="0"
                  placeholder="ft"
                />

                <input
                  v-model.number="heightInches"
                  type="number"
                  min="0"
                  max="11"
                  placeholder="in"
                />
              </div>
            </template>

            <select v-model="heightUnit">
              <option value="cm">cm</option>
              <option value="ft-in">ft / in</option>
            </select>
          </div>
        </div>

        <div class="form-section">
          <label>Dani treninga</label>

          <div class="chip-grid">
            <button
              v-for="day in days"
              :key="day"
              type="button"
              class="chip"
              :class="{ active: selectedDays.includes(day) }"
              @click="toggleDay(day)"
            >
              {{ day }}
            </button>
          </div>
        </div>

        <div class="form-section">
          <label>Ciljevi</label>

          <div class="chip-grid">
            <button
              v-for="goal in goals"
              :key="goal"
              type="button"
              class="chip"
              :class="{ active: selectedGoals.includes(goal) }"
              @click="toggleGoal(goal)"
            >
              {{ goal }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button type="submit" class="finish-button">
          Završi postavljanje
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentFirebaseUser, getUserData, saveUserData } from '../services/userService'

const router = useRouter()

const firebaseUser = ref(null)
const userData = ref(null)

const ageGroup = ref('')
const weight = ref(null)
const weightUnit = ref('kg')
const height = ref(null)
const heightFeet = ref(null)
const heightInches = ref(null)
const heightUnit = ref('cm')
const selectedDays = ref([])
const selectedGoals = ref([])
const error = ref('')

const days = ['Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota', 'Nedjelja']

const goals = [
  'Kardio',
  'Gornji dio tijela',
  'Kalistenika',
  'Rast mišića',
  'Mršavljenje',
]

onMounted(async () => {
  firebaseUser.value = await getCurrentFirebaseUser()

  if (!firebaseUser.value) {
    router.push('/login')
    return
  }

  userData.value = await getUserData(firebaseUser.value.uid)

  if (userData.value?.profileCompleted) {
    router.push('/dashboard')
  }
})

function toggleDay(day) {
  if (selectedDays.value.includes(day)) {
    selectedDays.value = selectedDays.value.filter(d => d !== day)
  } else {
    selectedDays.value.push(day)
  }

  selectedDays.value = days.filter(day => selectedDays.value.includes(day))
}

function toggleGoal(goal) {
  if (selectedGoals.value.includes(goal)) {
    selectedGoals.value = selectedGoals.value.filter(g => g !== goal)
  } else {
    selectedGoals.value.push(goal)
  }
}

function calculateBmi(weightValue, weightUnitValue, heightValue, heightUnitValue) {
  let weightKg = weightValue
  let heightM = 0

  if (weightUnitValue === 'lbs') {
    weightKg = weightValue * 0.45359237
  }

  if (heightUnitValue === 'cm') {
    heightM = heightValue / 100
  }

  if (heightUnitValue === 'ft-in') {
    const totalInches = (heightFeet.value * 12) + heightInches.value
    heightM = totalInches * 0.0254
  }

  const bmi = weightKg / (heightM * heightM)

  return bmi.toFixed(1)
}

const workoutLibrary = {
  'Gornji dio tijela': {
    workoutType: 'Trening za gornji dio tijela',
    exercises: [
      { name: 'Sklekovi', sets: 3, reps: '8-12' },
      { name: 'Pike push-up', sets: 3, reps: '6-10' },
      { name: 'Triceps dips na stolici', sets: 3, reps: '8-12' },
      { name: 'Plank shoulder taps', sets: 3, reps: '20 dodira' },
    ],
  },
  Kardio: {
    workoutType: 'Kardio trening',
    exercises: [
      { name: 'Jumping jacks', sets: 4, reps: '30 sekundi' },
      { name: 'High knees', sets: 4, reps: '30 sekundi' },
      { name: 'Mountain climbers', sets: 3, reps: '30 sekundi' },
      { name: 'Brzi hod ili lagano trčanje', sets: 1, reps: '15-20 minuta' },
    ],
  },
  Kalistenika: {
    workoutType: 'Kalistenički trening',
    exercises: [
      { name: 'Bodyweight squats', sets: 3, reps: '12-15' },
      { name: 'Sklekovi', sets: 3, reps: '8-12' },
      { name: 'Iskorak unazad', sets: 3, reps: '10 po nozi' },
      { name: 'Plank', sets: 3, reps: '45 sekundi' },
    ],
  },
  'Rast mišića': {
    workoutType: 'Trening za rast mišića',
    exercises: [
      { name: 'Sklekovi sporim tempom', sets: 4, reps: '8-12' },
      { name: 'Čučnjevi', sets: 4, reps: '10-15' },
      { name: 'Glute bridge', sets: 3, reps: '12-15' },
      { name: 'Superman hold', sets: 3, reps: '30 sekundi' },
    ],
  },
  Mršavljenje: {
    workoutType: 'Trening za mršavljenje',
    exercises: [
      { name: 'Jumping jacks', sets: 3, reps: '40 sekundi' },
      { name: 'Mountain climbers', sets: 3, reps: '30 sekundi' },
      { name: 'Bodyweight squats', sets: 3, reps: '15' },
      { name: 'Plank', sets: 3, reps: '40 sekundi' },
    ],
  },
}

const fallbackWorkout = {
  workoutType: 'Trening cijelog tijela',
  exercises: [
    { name: 'Sklekovi', sets: 3, reps: '8-12' },
    { name: 'Čučnjevi', sets: 3, reps: '12-15' },
    { name: 'Mountain climbers', sets: 3, reps: '30 sekundi' },
    { name: 'Plank', sets: 3, reps: '45 sekundi' },
  ],
}

function generateWorkouts(days, goals) {
  const selectedWorkoutOptions = goals
    .map(goal => workoutLibrary[goal])
    .filter(Boolean)

  const workoutOptions =
    selectedWorkoutOptions.length > 0 ? selectedWorkoutOptions : [fallbackWorkout]

  return days.map((day, index) => {
    const selectedWorkout = workoutOptions[index % workoutOptions.length]

    return {
      day,
      workoutType: selectedWorkout.workoutType,
      exercises: selectedWorkout.exercises,
      completed: false,
    }
  })
}

async function saveProfile() {
  error.value = ''

  if (
    !ageGroup.value ||
    !weight.value ||
    (heightUnit.value === 'cm' && !height.value) ||
    (heightUnit.value === 'ft-in' && (!heightFeet.value || heightInches.value === null)) ||
    selectedDays.value.length === 0 ||
    selectedGoals.value.length === 0
  ) {
    error.value = 'Please complete all questions.'
    return
  }

  if (!firebaseUser.value || !userData.value) {
    error.value = 'Korisnik nije prijavljen.'
    router.push('/login')
    return
  }

  const bmi = calculateBmi(
    weight.value,
    weightUnit.value,
    height.value,
    heightUnit.value
  )

  const profile = {
    ageGroup: ageGroup.value,
    weight: weight.value,
    weightUnit: weightUnit.value,
    height:
      heightUnit.value === 'cm'
        ? height.value
        : `${heightFeet.value} ft ${heightInches.value} in`,
    heightUnit: heightUnit.value,
    selectedDays: selectedDays.value,
    selectedGoals: selectedGoals.value,
    bmi,
    generatedWorkouts: generateWorkouts(selectedDays.value, selectedGoals.value),
  }

  await saveUserData({
    ...userData.value,
    profileCompleted: true,
    profile,
  })

  router.push('/dashboard')
}

</script>

<style scoped>
* {
  box-sizing: border-box;
}

.onboarding-view {
  width: 100%;
  min-height: 100vh;
  padding: 32px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    127.56deg,
    #0b0f1a 1.46%,
    #111827 94.67%
  );
  font-family: Inter, Arial, sans-serif;
}

.onboarding-card {
  width: 617px;
  min-height: 760px;
  padding: 14px 31px 39px;
  position: relative;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 28px;
  box-shadow: 0 10px 4px rgba(0, 0, 0, 0.2);
}

.logo {
  width: 206px;
  height: 102px;
  margin: -10px auto 0;
  background-image: url("/LogoWhite.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

h1 {
  margin: -3px 0 0;
  text-align: center;
  color: #ffffff;
  font-size: 42px;
  line-height: 51px;
  font-weight: 400;
}

.subtitle {
  margin: 0 0 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 16px;
  line-height: 19px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #ffffff;
  font-size: 14px;
  line-height: 17px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  height: 41px;
  padding: 0 14px;
  border: none;
  border-radius: 14px;
  outline: none;
  background: #1e293b;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
}

input::placeholder,
select:invalid {
  color: #64748b;
}

input:focus,
select:focus {
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.55);
}

.two-columns {
  display: grid;
  grid-template-columns: 247px 247px;
  justify-content: space-between;
  gap: 58px;
}

.height-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.chip {
  min-height: 32px;
  padding: 0 14px;
  border: 0;
  border-radius: 14px;
  background: #1e293b;
  color: #64748b;
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.15s ease;
}

.chip:hover {
  color: #cbd5e1;
}

.chip.active {
  background: #7c3aed;
  color: #ffffff;
}

.finish-button {
  width: 100%;
  height: 45px;
  margin-top: 1px;
  border: 0;
  border-radius: 14px;
  background: #7c3aed;
  color: #ffffff;
  font-family: Inter, Arial, sans-serif;
  font-size: 14px;
  line-height: 17px;
  font-weight: 600;
  cursor: pointer;
}

.finish-button:hover {
  filter: brightness(1.08);
}

.error {
  margin: -8px 0 0;
  color: #f87171;
  font-size: 13px;
  font-weight: 600;
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #1e293b inset !important;
  -webkit-text-fill-color: #ffffff !important;
  caret-color: #ffffff;
}

@media (max-width: 680px) {
  .onboarding-view {
    align-items: flex-start;
    padding: 20px 14px;
  }

  .onboarding-card {
    width: 100%;
    min-height: auto;
    padding: 18px 20px 28px;
  }

  .logo {
    width: 180px;
    height: 90px;
  }

  h1 {
    font-size: 34px;
    line-height: 41px;
  }

  .two-columns {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>