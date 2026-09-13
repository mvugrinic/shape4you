<template>
  <aside class="right-dashboard-panel">
    <div class="stat-card spotify-card">
      <p class="stat-label">🎧 Spotify</p>

      <div v-if="!spotifyConnected" class="spotify-connect">
        <h2>Music</h2>
        <p>Spoji Spotify za workout playlistu.</p>

        <button class="spotify-button" @click="$emit('connect-spotify')">
          Connect Spotify
        </button>
      </div>

      <div v-else class="spotify-player">
        <iframe
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP"
          width="100%"
          height="152"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      </div>
    </div>

    <div class="side-card">
      <p class="stat-label">🔥 Streak</p>
      <h2>{{ user.streak }}</h2>
    </div>

    <div class="side-card">
      <p class="stat-label">🏆 Points</p>
      <h2>{{ user.points }}</h2>
    </div>

    <div class="side-card daily-side-card">
      <h3>🎯 Daily Challenge</h3>
      <p>{{ dailyChallenge }}</p>

      <div v-if="challengeCompletedToday" class="challenge-done side-done">
        <p>✅ Današnji challenge je završen</p>
        <span>Novi challenge za: {{ timeUntilNextChallenge }}</span>
      </div>

      <button
        v-else
        class="save-button full-width"
        @click="$emit('complete-challenge')"
      >
        Complete Challenge
      </button>
    </div>

    <div class="side-card">
      <h3>Workout History</h3>

      <div
        v-if="workoutHistory.length === 0"
        class="empty-history compact-empty"
      >
        Još nema odrađenih treninga.
      </div>

      <div v-else class="history-list">
        <div
          class="history-item"
          v-for="historyItem in workoutHistory"
          :key="historyItem.date + '-' + historyItem.workoutDay + '-' + historyItem.workoutType"
        >
          <div>
            <h4>{{ historyItem.workoutDay }} - {{ historyItem.workoutType }}</h4>
            <p>{{ historyItem.date }} • {{ historyItem.exerciseCount }} vježbe</p>
          </div>

          <strong>+{{ historyItem.points }} pts</strong>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  spotifyConnected: {
    type: Boolean,
    required: true,
  },
  dailyChallenge: {
    type: String,
    required: true,
  },
  challengeCompletedToday: {
    type: Boolean,
    required: true,
  },
  timeUntilNextChallenge: {
    type: String,
    required: true,
  },
})

defineEmits(['connect-spotify', 'complete-challenge'])

const workoutHistory = computed(() => {
  return (props.user.workoutHistory || []).slice(0, 6)
})
</script>

<style scoped>.right-dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 22px;
}
.stat-card,
.side-card {
  position: relative;
  background:
    linear-gradient(180deg, rgba(20, 28, 48, 0.92), rgba(10, 16, 30, 0.86));
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 80px rgba(0, 0, 0, 0.22);
}
.stat-card {
  min-height: 164px;
  padding: 24px;
  overflow: hidden;
}
.side-card {
  min-height: 132px;
  padding: 24px;
}
.stat-label {
  color: #aeb7c8;
  margin: 0 0 24px;
  font-size: 15px;
}
.stat-card h2,
.side-card h2 {
  color: white;
  font-size: 32px;
  margin: 0;
  letter-spacing: -0.5px;
}
.side-card h3 {
  color: white;
  margin: 0;
}
.daily-side-card {
  min-height: 190px;
}
.daily-side-card h3 {
  margin-bottom: 10px;
}
.daily-side-card p {
  color: #cbd5e1;
  margin: 0 0 12px;
}
.side-done p {
  margin-bottom: 4px;
}
.challenge-done span {
  color: #9ca3af;
  font-size: 13px;
}
.spotify-card {
  overflow: hidden;
}
.spotify-connect h2 {
  color: white;
  font-size: 28px;
  margin: 10px 0 8px;
}
.spotify-connect p {
  color: #aeb7c8;
  margin: 0 0 14px;
}
.spotify-button,
.save-button {
  min-height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #6d5dfc);
  color: white;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(124, 58, 237, 0.25);
}
.spotify-button {
  background: rgba(124, 58, 237, 0.48);
  border: 1px solid rgba(168, 85, 247, 0.4);
  box-shadow: none;
  border-radius: 999px;
}
.spotify-player iframe {
  border-radius: 14px;
  height: 142px;
}
.save-button {
  margin-top: 16px;
}
.full-width {
  width: 100%;
}
.empty-history {
  min-height: 110px;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 14px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px;
}
.compact-empty {
  min-height: 86px;
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history-item {
  background: rgba(7, 12, 24, 0.56);
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}
.history-item h4 {
  color: white;
  margin: 0 0 4px;
}
.history-item p {
  color: #9ca3af;
  margin: 0;
  font-size: 13px;
}
.history-item strong {
  color: #22c55e;
  white-space: nowrap;
}


@media (max-width: 1250px) {.right-dashboard-panel {
  position: static;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

}


@media (max-width: 700px) {.right-dashboard-panel {
  grid-template-columns: 1fr;
}

}

</style>