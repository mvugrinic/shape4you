<template>
  <div class="workout-modal-overlay">
    <div class="workout-modal" :class="{ expanded: isAddingExercise || editingExerciseIndex !== null }">
      <div class="modal-header">
        <div>
          <h2>Workout Editor</h2>
          <p>{{ workout.day }} - {{ workout.workoutType }}</p>
        </div>

        <button class="close-button" @click="$emit('close')">×</button>
      </div>

      <div class="workout-editor-layout">
        <div class="workout-editor-left">
          <div class="modal-section-title">
            VJEŽBE U TRENINGU ({{ workout.exercises.length }})
          </div>

          <div class="exercise-list">
            <div
              class="exercise-item editable-exercise-item"
              v-for="(exercise, index) in workout.exercises"
              :key="exercise.name + '-' + index"
              :class="{ selected: editingExerciseIndex === index }"
              @click="startEditExercise(index)"
            >
              <div class="exercise-order">{{ index + 1 }}</div>

              <div class="exercise-info">
                <div>
                  <h4>{{ exercise.name }}</h4>
                  <p>{{ exercise.sets }} serije × {{ exercise.reps }}</p>
                </div>
              </div>

              <div class="exercise-actions" @click.stop>
                <button
                  type="button"
                  class="mini-action-button"
                  :disabled="index === 0"
                  @click="moveExercise(index, -1)"
                >
                  ↑
                </button>

                <button
                  type="button"
                  class="mini-action-button"
                  :disabled="index === workout.exercises.length - 1"
                  @click="moveExercise(index, 1)"
                >
                  ↓
                </button>

                <button
                  type="button"
                  class="mini-action-button edit"
                  @click="startEditExercise(index)"
                >
                  ✎
                </button>

                <button
                  type="button"
                  class="mini-action-button danger"
                  @click="deleteExercise(index)"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>

          <button
            class="add-exercise-open-button"
            type="button"
            @click="toggleAddExerciseForm"
          >
            {{ isAddingExercise ? '− Sakrij dodavanje' : '+ Dodaj vježbu' }}
          </button>
        </div>

        <div class="workout-editor-right">
          <div class="exercise-detail-card">
            <p class="modal-section-title">DETALJI VJEŽBE</p>

            <h2>{{ selectedExerciseName || 'Odaberi vježbu' }}</h2>

            <span class="exercise-category-pill">
              {{ selectedExerciseCategory }}
            </span>

            <div class="exercise-detail-grid">
              <div>
                <span>Serije</span>
                <strong>{{ selectedExerciseSets }}</strong>
              </div>

              <div>
                <span>Ponavljanja</span>
                <strong>{{ selectedExerciseReps }}</strong>
              </div>

              <div>
                <span>Kategorija</span>
                <strong>{{ selectedExerciseCategory }}</strong>
              </div>

              <div>
                <span>Oprema</span>
                <strong>Bez opreme</strong>
              </div>
            </div>
          </div>

          <div
            v-if="isAddingExercise || editingExerciseIndex !== null"
            class="exercise-editor-card"
          >
            <h3>{{ editingExerciseIndex === null ? '+ Dodaj vježbu' : 'Uredi vježbu' }}</h3>

            <div class="exercise-editor-grid">
              <div class="edit-section">
                <label>Kategorija</label>

                <select v-model="selectedExerciseCategory" @change="resetSelectedExercise">
                  <option
                    v-for="category in exerciseCategories"
                    :key="category"
                    :value="category"
                  >
                    {{ category }}
                  </option>
                </select>
              </div>

              <div class="edit-section">
                <label>Vježba</label>

                <select v-model="selectedExerciseName" @change="fillExerciseDefaults">
                  <option
                    v-for="exercise in getExercisesByCategory(selectedExerciseCategory)"
                    :key="exercise.name"
                    :value="exercise.name"
                  >
                    {{ exercise.name }}
                  </option>
                </select>
              </div>

              <div class="edit-section">
                <label>Serije</label>
                <input v-model.number="selectedExerciseSets" type="number" min="1" />
              </div>

              <div class="edit-section">
                <label>Ponavljanja / vrijeme</label>
                <input v-model="selectedExerciseReps" type="text" />
              </div>
            </div>

            <p v-if="exerciseEditorError" class="error">{{ exerciseEditorError }}</p>

            <div class="exercise-editor-actions">
              <button
                class="save-button"
                type="button"
                @click="editingExerciseIndex === null ? addExerciseToWorkout() : saveEditedExercise()"
              >
                {{ editingExerciseIndex === null ? 'Dodaj vježbu' : 'Spremi promjene' }}
              </button>

              <button
                v-if="editingExerciseIndex !== null"
                class="secondary-button"
                type="button"
                @click="cancelEditExercise"
              >
                Odustani
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="secondary-button big-secondary" type="button" @click="$emit('close')">
          Odustani
        </button>

        <button
          class="save-button complete-button"
          :class="{ locked: !canComplete }"
          :disabled="!canComplete"
          @click="$emit('complete')"
        >
          {{
            canComplete
              ? 'Završi trening'
              : 'Preview mode - trening nije za danas'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  workout: {
    type: Object,
    required: true,
  },
  exerciseLibrary: {
    type: Object,
    required: true,
  },
  exerciseCategories: {
    type: Array,
    required: true,
  },
  canComplete: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'complete', 'save'])

const isAddingExercise = ref(false)
const exerciseEditorError = ref('')
const selectedExerciseCategory = ref('Trbuh')
const selectedExerciseName = ref('Crunches')
const selectedExerciseSets = ref(3)
const selectedExerciseReps = ref('10-15')
const editingExerciseIndex = ref(null)

watch(
  () => props.workout,
  () => {
    cancelEditExercise()
    selectFirstExercise()
  },
  { immediate: true }
)

function selectFirstExercise() {
  const firstExercise = props.workout?.exercises?.[0]

  if (firstExercise) {
    const exercise = normalizeExercise(firstExercise)

    selectedExerciseCategory.value = exercise.category
    selectedExerciseName.value = exercise.name
    selectedExerciseSets.value = exercise.sets
    selectedExerciseReps.value = exercise.reps
  } else {
    resetSelectedExercise()
  }
}

function saveWorkout() {
  emit('save')
}

function findExerciseTemplate(name) {
  for (const category of props.exerciseCategories) {
    const exercise = props.exerciseLibrary[category].find(item => item.name === name)

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

function getExercisesByCategory(category) {
  return props.exerciseLibrary[category] || []
}

function getSelectedExerciseTemplate() {
  return getExercisesByCategory(selectedExerciseCategory.value)
    .find(exercise => exercise.name === selectedExerciseName.value)
}

function resetSelectedExercise() {
  const firstExercise = getExercisesByCategory(selectedExerciseCategory.value)[0]

  selectedExerciseName.value = firstExercise?.name || ''
  selectedExerciseSets.value = firstExercise?.sets || 3
  selectedExerciseReps.value = firstExercise?.reps || '10'
}

function fillExerciseDefaults() {
  const exercise = getSelectedExerciseTemplate()

  if (!exercise) return

  selectedExerciseSets.value = exercise.sets
  selectedExerciseReps.value = exercise.reps
}

function createExerciseFromEditor() {
  return normalizeExercise({
    name: selectedExerciseName.value,
    category: selectedExerciseCategory.value,
    sets: selectedExerciseSets.value,
    reps: selectedExerciseReps.value,
  })
}

function validateExerciseEditor() {
  exerciseEditorError.value = ''

  if (!props.workout) {
    exerciseEditorError.value = 'Nema aktivnog treninga.'
    return false
  }

  if (!selectedExerciseName.value) {
    exerciseEditorError.value = 'Odaberi vježbu.'
    return false
  }

  if (!selectedExerciseSets.value || Number(selectedExerciseSets.value) <= 0) {
    exerciseEditorError.value = 'Unesi broj serija.'
    return false
  }

  if (!selectedExerciseReps.value) {
    exerciseEditorError.value = 'Unesi ponavljanja ili vrijeme.'
    return false
  }

  return true
}

function toggleAddExerciseForm() {
  if (editingExerciseIndex.value !== null) {
    cancelEditExercise()
    return
  }

  isAddingExercise.value = !isAddingExercise.value

  if (isAddingExercise.value) {
    exerciseEditorError.value = ''
    resetSelectedExercise()
  }
}

function closeAddExerciseForm() {
  isAddingExercise.value = false
  exerciseEditorError.value = ''
}

function addExerciseToWorkout() {
  if (!validateExerciseEditor()) return

  props.workout.exercises.push(createExerciseFromEditor())
  saveWorkout()
  closeAddExerciseForm()
}

function startEditExercise(index) {
  const exercise = normalizeExercise(props.workout.exercises[index])

  editingExerciseIndex.value = index
  selectedExerciseCategory.value = exercise.category
  selectedExerciseName.value = exercise.name
  selectedExerciseSets.value = exercise.sets
  selectedExerciseReps.value = exercise.reps
  isAddingExercise.value = true
  exerciseEditorError.value = ''
}

function saveEditedExercise() {
  if (editingExerciseIndex.value === null || !validateExerciseEditor()) return

  props.workout.exercises.splice(
    editingExerciseIndex.value,
    1,
    createExerciseFromEditor()
  )

  cancelEditExercise()
  saveWorkout()
}

function cancelEditExercise() {
  editingExerciseIndex.value = null
  isAddingExercise.value = false
  exerciseEditorError.value = ''
  resetSelectedExercise()
}

function deleteExercise(index) {
  if (props.workout.exercises.length <= 1) {
    exerciseEditorError.value = 'Trening mora imati barem jednu vježbu.'
    return
  }

  props.workout.exercises.splice(index, 1)
  saveWorkout()
}

function moveExercise(index, direction) {
  const newIndex = index + direction
  const exercises = props.workout?.exercises

  if (!exercises || newIndex < 0 || newIndex >= exercises.length) return

  const [exercise] = exercises.splice(index, 1)
  exercises.splice(newIndex, 0, exercise)

  saveWorkout()
}
</script>

<style scoped>.workout-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}
.workout-modal {
  width: min(1120px, 96vw);
  height: min(607.68px, 92vh);
  max-height: 828px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(7, 12, 24, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  color: white;
  box-shadow: 0 35px 120px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}
.modal-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
}
.modal-header p {
  margin: 0;
  color: #cbd5e1;
  font-size: 16px;
}
.close-button {
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: white;
  font-size: 30px;
  cursor: pointer;
}
.workout-editor-layout {
  padding: 18px 22px;
  display: grid;
  grid-template-columns: 613.82px minmax(0, 441.95px);
  gap: 18px;
  flex: 1;
  overflow: auto;
}
.workout-editor-left,
.workout-editor-right {
  min-width: 0;
}
.modal-section-title {
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
  margin: 4px 0 12px;
  text-transform: uppercase;
}
.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.exercise-item {
  background: rgba(7, 12, 24, 0.58);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 12px;
}
.editable-exercise-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  cursor: pointer;
}
.editable-exercise-item.selected {
  border-color: rgba(124, 92, 255, 0.44);
  background: rgba(124, 58, 237, 0.12);
}
.exercise-order {
  font-size: 18px;
  color: white;
  font-weight: 900;
  text-align: center;
}
.exercise-info {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}
.exercise-item h4 {
  margin: 0 0 4px;
  color: white;
}
.exercise-item p {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
}
.exercise-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.mini-action-button,
.secondary-button {
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.88);
  color: white;
  font-weight: 900;
  cursor: pointer;
}
.mini-action-button.edit {
  background: rgba(124, 58, 237, 0.28);
  border-color: rgba(124, 58, 237, 0.4);
}
.mini-action-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.mini-action-button.danger {
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.35);
}
.add-exercise-open-button {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  border: 1px solid rgba(168, 85, 247, 0.55);
  border-radius: 12px;
  color: #c084fc;
  background: rgba(124, 58, 237, 0.08);
  font-weight: 900;
  cursor: pointer;
}
.exercise-detail-card,
.exercise-editor-card {
  background: rgba(7, 12, 24, 0.58);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 16px;
  padding: 18px;
}
.exercise-detail-card {
  min-height: 278px;
}

.exercise-detail-card h2 {
  margin: 0 0 10px;
  font-size: 28px;
}
.exercise-category-pill {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 0 12px;
  border-radius: 999px;
  color: #d8b4fe;
  background: rgba(124, 58, 237, 0.22);
  border: 1px solid rgba(124, 58, 237, 0.24);
  font-size: 13px;
  font-weight: 800;
}
.exercise-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.exercise-detail-grid div {
  min-height: 62px;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 12px;
}
.exercise-detail-grid span {
  display: block;
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 4px;
}
.exercise-detail-grid strong {
  color: white;
}
.exercise-editor-card {
  margin-top: 14px;
}
.exercise-editor-card h3 {
  color: #c084fc;
  margin: 0 0 16px;
}
.exercise-editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.edit-section label {
  color: white;
  font-weight: 800;
  display: block;
  margin-bottom: 10px;
}
.edit-section input,
.edit-section select {
  height: 46px;
  width: 100%;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  padding: 0 14px;
  color: white;
  outline: none;
}
.edit-section input:focus,
.edit-section select:focus {
  border-color: #7c5cff;
  box-shadow: 0 0 0 4px rgba(124, 92, 255, 0.08);
}
.exercise-editor-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
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
.save-button.locked {
  opacity: 0.55;
  cursor: not-allowed;
  background: #334155;
  box-shadow: none;
  transform: none;
}
.modal-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  min-height: 85px;
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 14px;
}
.modal-footer .save-button,
.modal-footer .secondary-button {
  margin-top: 0;
}
.modal-footer .big-secondary,
.modal-footer .complete-button {
  height: 52px;
  width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.error {
  color: #f87171;
  font-size: 14px;
  margin: 14px 0 0;
}


@media (max-width: 980px) {.workout-editor-layout {
  grid-template-columns: 1fr;
}
.workout-modal,
.workout-modal.expanded {
  height: auto;
  max-height: 92vh;
  overflow: auto;
}

}


@media (max-width: 700px) {.exercise-editor-grid,
.exercise-detail-grid {
  grid-template-columns: 1fr;
}
.editable-exercise-item {
  grid-template-columns: 1fr;
  align-items: flex-start;
}
.exercise-actions {
  justify-content: flex-start;
}
.modal-footer {
  flex-direction: column;
}
.modal-footer .big-secondary,
.modal-footer .complete-button {
  width: 100%;
}

}

</style>