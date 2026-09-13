<template>
  <main class="leaderboard-page">
    <section class="leaderboard-card">
      <div class="top-section">
        <div>
          <h1>🏆 Leaderboard</h1>
          <p>Pogledaj tko ima najviše bodova i najbolji streak.</p>
        </div>

        <button class="back-button dashboard-button" @click="router.push('/dashboard')">
          Dashboard
        </button>
      </div>

      <div v-if="activeLeaderboard === 'points'" class="leaderboard-content">
        <div class="leaderboard-actions">
          <h2>🏆 Points Leaderboard</h2>

          <button class="back-button switch-button" @click="activeLeaderboard = 'streak'">
            Streak Leaderboard
          </button>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(user, index) in pointsLeaderboard"
            :key="user.email"
            class="leaderboard-row"
            :class="{ current: user.email === loggedUserEmail }"
          >
            <div class="rank">#{{ index + 1 }}</div>

            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p>{{ user.email }}</p>
            </div>

            <strong>{{ user.points || 0 }} pts</strong>
          </div>
        </div>
      </div>

      <div v-else class="leaderboard-content">
        <div class="leaderboard-actions">
          <h2>🔥 Streak Leaderboard</h2>

          <div class="button-row">
            <button class="back-button switch-button" @click="activeLeaderboard = 'points'">
              Points Leaderboard
            </button>
          </div>
        </div>

        <div class="leaderboard-list">
          <div
            v-for="(user, index) in streakLeaderboard"
            :key="user.email"
            class="leaderboard-row"
            :class="{ current: user.email === loggedUserEmail }"
          >
            <div class="rank">#{{ index + 1 }}</div>

            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p>{{ user.email }}</p>
            </div>

            <strong>{{ user.streak || 0 }} 🔥</strong>
          </div>
        </div>
      </div>

      <p v-if="pointsLeaderboard.length === 0" class="empty-text">
        Nema korisnika za prikaz.
      </p>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAllUsers, getCurrentFirebaseUser } from '../services/userService'

const router = useRouter()

const users = ref([])
const loggedUserEmail = ref('')
const activeLeaderboard = ref('points')

onMounted(async () => {
  const firebaseUser = await getCurrentFirebaseUser()

  if (!firebaseUser) {
    router.push('/login')
    return
  }

  loggedUserEmail.value = firebaseUser.email

  const savedUsers = await getAllUsers()

  users.value = savedUsers.map(user => {
    return {
      ...user,
      points: Number(user.points || 0),
      streak: Number(user.streak || 0),
    }
  })
})

const pointsLeaderboard = computed(() => {
  return [...users.value].sort((a, b) => {
    return Number(b.points || 0) - Number(a.points || 0)
  })
})

const streakLeaderboard = computed(() => {
  return [...users.value].sort((a, b) => {
    return Number(b.streak || 0) - Number(a.streak || 0)
  })
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.leaderboard-page {
  min-height: 100vh;
  padding: 233px 40px;
  background: linear-gradient(127.56deg, #0b0f1a 1.46%, #111827 94.67%);
  font-family: Arial, sans-serif;
}

.leaderboard-card {
  width: 100%;
  max-width: 1000px;
  min-height: 559px;
  margin: 0 auto;
  padding: 34px;
  display: flex;
  flex-direction: column;
  gap: 30px;
  background: #151b2d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 28px;
}

.top-section {
  min-height: 126px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 40px;
}

.top-section > div:first-child {
  padding: 25px 0 16px;
}

h1 {
  margin: 0 0 16px;
  color: #ffffff;
  font-size: 38px;
  line-height: 44px;
  font-weight: 700;
}

p {
  margin: 0;
  color: #9ca3af;
}

.top-section p {
  font-size: 16px;
  line-height: 18px;
}

.back-button {
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(112.62deg, #7c5cff 0%, #5b7cfa 100%);
  color: #ffffff;
  font-size: 13.3px;
  line-height: 15px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.dashboard-button {
  width: 106px;
}

.switch-button {
  min-width: 161px;
}

.leaderboard-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.leaderboard-actions {
  min-height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.leaderboard-actions h2 {
  margin: 0;
  color: #ffffff;
  font-size: 24px;
  line-height: 28px;
  font-weight: 700;
}

.button-row {
  display: flex;
  gap: 10px;
}

.leaderboard-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.leaderboard-row {
  width: 100%;
  min-height: 128px;
  padding: 20px;
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 90px;
  align-items: center;
  gap: 18px;
  background: #0f172a;
  border: 1px solid #263246;
  border-radius: 20px;
}

.leaderboard-row.current {
  background: rgba(124, 92, 255, 0.15);
  border-color: #7c5cff;
}

.rank {
  color: #ffffff;
  font-family: "Arial Black", Arial, sans-serif;
  font-size: 24px;
  line-height: 34px;
  font-weight: 800;
}

.user-info {
  min-width: 0;
  padding: 18px 0 14px;
}

.user-info h3 {
  margin: 0 0 14px;
  overflow: hidden;
  color: #ffffff;
  font-size: 18.7px;
  line-height: 22px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-info p {
  overflow: hidden;
  color: #9ca3af;
  font-size: 14px;
  line-height: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leaderboard-row strong {
  color: #ffffff;
  font-size: 18px;
  line-height: 21px;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}

.empty-text {
  margin-top: 20px;
  text-align: center;
}

@media (max-width: 1100px) {
  .leaderboard-page {
    padding: 80px 32px;
  }
}

@media (max-width: 800px) {
  .leaderboard-page {
    padding: 30px 16px;
  }

  .leaderboard-card {
    padding: 24px;
  }

  .top-section,
  .leaderboard-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .top-section {
    min-height: auto;
  }

  .leaderboard-row {
    grid-template-columns: 52px minmax(0, 1fr) auto;
    min-height: 108px;
    padding: 16px;
  }
}

@media (max-width: 560px) {
  h1 {
    font-size: 30px;
    line-height: 36px;
  }

  .leaderboard-row {
    grid-template-columns: 1fr;
  }

  .leaderboard-row strong {
    text-align: left;
  }

  .user-info {
    padding: 0;
  }

  .switch-button,
  .dashboard-button {
    width: 100%;
  }

  .button-row {
    width: 100%;
  }
}
</style>