<template>
  <div class="dashboard-card goals-card">
    <div class="card-header">
      <h3>Ciljevi</h3>
 
      <button class="small-edit-button" @click="toggleEdit">
        {{ isEditing ? 'Cancel' : 'Edit' }}
      </button>
    </div>
 
    <div v-if="!isEditing" class="goal-grid">
      <div
        class="goal-chip"
        v-for="goal in selectedGoals"
        :key="goal"
      >
        {{ goal }}
      </div>
    </div>
 
    <div v-else>
      <div class="chip-grid">
        <button
          v-for="goal in goals"
          :key="goal"
          type="button"
          class="chip"
          :class="{ active: editableGoals.includes(goal) }"
          @click="toggleGoal(goal)"
        >
          {{ goal }}
        </button>
      </div>
 
      <p v-if="error" class="error">{{ error }}</p>
 
      <button class="save-button" @click="saveGoals">
        Save goals
      </button>
    </div>
  </div>
</template>
 
<script setup>
import { ref } from 'vue'
 
const props = defineProps({
  selectedGoals: {
    type: Array,
    required: true,
  },
  goals: {
    type: Array,
    required: true,
  },
})
 
const emit = defineEmits(['save-goals'])
 
const isEditing = ref(false)
const editableGoals = ref([])
const error = ref('')
 
function toggleEdit() {
  isEditing.value = !isEditing.value
  error.value = ''
 
  if (isEditing.value) {
    editableGoals.value = [...props.selectedGoals]
  }
}
 
function toggleGoal(goal) {
  editableGoals.value = editableGoals.value.includes(goal)
    ? editableGoals.value.filter(item => item !== goal)
    : [...editableGoals.value, goal]
}
 
function saveGoals() {
  error.value = ''
 
  if (editableGoals.value.length === 0) {
    error.value = 'Odaberi barem jedan cilj.'
    return
  }
 
  emit('save-goals', editableGoals.value)
  isEditing.value = false
}
</script>
 
<style scoped>.dashboard-card {
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
.dashboard-card h3 {
  color: white;
  margin: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 20px;
}
.small-edit-button {
  height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.62);
  color: #e5e7eb;
  font-weight: 800;
  cursor: pointer;
}
.goal-grid,
.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.goal-chip,
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
}
.chip {
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
 
</style>