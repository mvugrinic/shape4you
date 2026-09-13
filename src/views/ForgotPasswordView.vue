<template>
  <div class="zaboravljena-lozinka">
    <div class="section">
      <div class="container">
        <div class="logo"></div>
      </div>

      <div class="heading">
        <div class="text">Reset lozinke</div>
      </div>

      <div class="text-wrapper">
        <p class="div">
          Upišite email adresu i Firebase će vam poslati
          <br />
          link za promjenu lozinke.
        </p>
      </div>

      <form class="form" @submit.prevent="sendResetEmail">
        <div class="container-2">
          <div class="label">
            <label class="text-wrapper-2" for="email">
              Email adresa
            </label>
          </div>

          <div class="background-border">
            <div class="input">
              <input
                id="email"
                v-model.trim="email"
                class="container-3"
                placeholder="vas.email@primjer.hr"
                type="email"
                autocomplete="email"
                required
              />
            </div>
          </div>
        </div>

        <p v-if="error" class="reset-error">
          {{ error }}
        </p>

        <p v-if="success" class="reset-success">
          {{ success }}
        </p>

        <button
          class="button-v-if"
          type="submit"
          :disabled="loading"
        >
          <span class="text-2">
            {{ loading ? 'Slanje...' : 'Pošalji link za reset' }}
          </span>
        </button>
      </form>

      <div class="link-natrag-na-wrapper">
        <RouterLink class="link-natrag-na" to="/login">
          Natrag na prijavu
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { sendPasswordResetEmail } from 'firebase/auth'

import { auth } from '../firebase'

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function sendResetEmail() {
  error.value = ''
  success.value = ''

  if (!email.value) {
    error.value = 'Molimo unesite email adresu.'
    return
  }

  try {
    loading.value = true

    await sendPasswordResetEmail(auth, email.value)

    success.value =
      'Email za resetiranje lozinke je poslan. Provjerite inbox (spam).'
  } catch (firebaseError) {
    if (firebaseError.code === 'auth/invalid-email') {
      error.value = 'Email adresa nije ispravna.'
      return
    }

    error.value =
      'Nije moguće poslati reset email. Provjerite adresu.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.zaboravljena-lozinka {
  align-items: center;
  background: linear-gradient(
    128deg,
    rgba(11, 15, 26, 1) 0%,
    rgba(17, 24, 39, 1) 100%
  );
  display: flex;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
}

.zaboravljena-lozinka .section {
  align-items: flex-start;
  background-color: #151b2d;
  border: 1px solid;
  border-color: #ffffff14;
  border-radius: 28px;
  box-shadow: 0px 20px 60px #00000059;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 531.55px;
  padding: 40.12px 40.11px 56.09px;
  position: relative;
  width: 430px;
}

.zaboravljena-lozinka .container {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .logo {
  width: 160px;
  height: 79px;
  background-image: url("/LogoWhite.png");
  background-position: 50% 50%;
  background-size: contain;
  background-repeat: no-repeat;
  position: relative;
}

.zaboravljena-lozinka .heading {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 7.99px 0px 1.11px;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .text {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 34px;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.zaboravljena-lozinka .text-wrapper {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .div {
  color: #9ca3af;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  text-align: center;
  width: fit-content;
}

.zaboravljena-lozinka .form {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 20px;
  padding: 17.99px 0px 0px;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .container-2 {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 7.98px;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .label {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .text-wrapper-2 {
  align-items: center;
  align-self: stretch;
  color: #e5e7eb;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
}

.zaboravljena-lozinka .background-border {
  align-items: center;
  align-self: stretch;
  background-color: #0f172a;
  border: 1px solid;
  border-color: #263246;
  border-radius: 14px;
  display: flex;
  height: 57.99px;
  justify-content: center;
  padding: 0.11px 18.11px;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .background-border:focus-within {
  border-color: #7c5cff;
  box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.18);
}

.zaboravljena-lozinka .input {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-grow: 1;
  padding: 1px 2px;
  position: relative;
}

.zaboravljena-lozinka .container-3 {
  align-self: stretch;
  background: none;
  border: none;
  color: #e5e7eb;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  padding: 0;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .container-3::placeholder {
  color: #6b7280;
  opacity: 1;
}

.zaboravljena-lozinka .container-3:focus {
  outline: none;
}

.zaboravljena-lozinka .button-v-if {
  align-items: center;
  background: linear-gradient(
    169deg,
    rgba(124, 92, 255, 1) 0%,
    rgba(91, 124, 250, 1) 100%
  );
  border: none;
  border-radius: 16px;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  height: 57.99px;
  justify-content: center;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .button-v-if:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.zaboravljena-lozinka .text-2 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.zaboravljena-lozinka .link-natrag-na-wrapper {
  align-items: center;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  padding: 11.99px 0px 0px;
  position: relative;
  width: 100%;
}

.zaboravljena-lozinka .link-natrag-na {
  align-items: center;
  color: #a78bfa;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  width: fit-content;
}

.zaboravljena-lozinka .reset-error {
  width: 100%;
  margin: -5px 0 -5px;
  color: #f87171;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.zaboravljena-lozinka .reset-success {
  width: 100%;
  margin: -5px 0 -5px;
  color: #4ade80;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.zaboravljena-lozinka .container-3:-webkit-autofill,
.zaboravljena-lozinka .container-3:-webkit-autofill:hover,
.zaboravljena-lozinka .container-3:-webkit-autofill:focus,
.zaboravljena-lozinka .container-3:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
  -webkit-text-fill-color: #e5e7eb !important;
  caret-color: #e5e7eb;
}

@media (max-width: 500px) {
  .zaboravljena-lozinka {
    padding: 20px;
  }

  .zaboravljena-lozinka .section {
    width: 100%;
    max-width: 430px;
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>