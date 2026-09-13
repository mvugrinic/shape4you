<template>
  <div class="registration-view">
    <div class="frame">
      <div class="container">
        <div class="logo"></div>
      </div>

      <div class="heading">
        <div class="text">Kreiraj račun</div>
      </div>

      <div class="text-wrapper">
        Započni svoje fitness putovanje
      </div>

      <form class="form" @submit.prevent="register">
        <div class="div">
          <div class="div-wrapper">
            <label class="text-wrapper-2" for="name">
              Ime
            </label>
          </div>

          <div class="background-border">
            <div class="input">
              <input
                id="name"
                v-model.trim="name"
                class="container-2"
                placeholder="Vaše ime"
                type="text"
                autocomplete="name"
              />
            </div>
          </div>
        </div>

        <div class="div">
          <div class="div-wrapper">
            <label class="text-wrapper-2" for="email">
              Email adresa
            </label>
          </div>

          <div class="background-border">
            <div class="input">
              <input
                id="email"
                v-model.trim="email"
                class="container-2"
                placeholder="vas.email@primjer.hr"
                type="email"
                autocomplete="email"
              />
            </div>
          </div>
        </div>

        <div class="div">
          <div class="div-wrapper">
            <label class="text-wrapper-2" for="password">
              Lozinka
            </label>
          </div>

          <div class="background-border">
            <div class="input">
              <input
                id="password"
                v-model="password"
                class="container-2"
                placeholder="••••••••"
                type="password"
                autocomplete="new-password"
              />
            </div>
          </div>
        </div>

        <p v-if="error" class="register-error">
          {{ error }}
        </p>

        <button
          class="button-v-if"
          type="submit"
          :disabled="loading"
        >
          <div class="text-2">
            {{ loading ? 'Registracija...' : 'Registriraj se' }}
          </div>
        </button>
      </form>

      <div class="container-3">
        <p class="p">
          <span class="span">Već imate račun? </span>

          <RouterLink
            class="text-wrapper-4"
            to="/login"
          >
            Prijavite se
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth'

import { auth } from '../firebase.js'
import { createUserData } from '../services/userService'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function register() {
  error.value = ''

  if (!name.value || !email.value || !password.value) {
    error.value = 'Molimo ispunite sva polja.'
    return
  }

  try {
    loading.value = true

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    await createUserData(userCredential.user, name.value)

    try {
      await sendEmailVerification(userCredential.user)
    } catch {
    }

    router.push('/onboarding')
  } catch (firebaseError) {
    if (firebaseError.code === 'auth/email-already-in-use') {
      error.value = 'Račun s ovom email adresom već postoji.'
      return
    }

    if (firebaseError.code === 'auth/weak-password') {
      error.value = 'Lozinka mora imati barem 6 znakova.'
      return
    }

    if (firebaseError.code === 'auth/invalid-email') {
      error.value = 'Email adresa nije ispravna.'
      return
    }

    error.value = 'Greška pri registraciji. Pokušajte ponovno.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.registration-view {
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

.registration-view .frame {
  background-color: #151b2d;
  border: 1px solid;
  border-color: #243044;
  border-radius: 28px;
  box-shadow: 0px 20px 40px #00000040;
  height: 620px;
  overflow: hidden;
  position: relative;
  width: 420px;
}

.registration-view .container {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  left: 41px;
  position: absolute;
  top: 41px;
  width: calc(100% - 72px);
}

.registration-view .logo {
  width: 160px;
  height: 79px;
  background-image: url("/LogoWhite.png");
  background-position: 50% 50%;
  background-size: contain;
  background-repeat: no-repeat;
  position: relative;
}

.registration-view .heading {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 41px;
  padding: 7.99px 0px 1.11px;
  position: absolute;
  top: 111px;
  width: calc(100% - 72px);
}

.registration-view .text {
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

.registration-view .text-wrapper {
  align-items: center;
  color: #9ca3af;
  display: flex;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  height: 18px;
  justify-content: center;
  left: calc(50% - 107px);
  letter-spacing: 0;
  line-height: normal;
  position: absolute;
  text-align: center;
  top: 172px;
  white-space: nowrap;
}

.registration-view .form {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 383px;
  left: 36px;
  padding: 17.99px 0px 0px;
  position: absolute;
  top: 173px;
  width: calc(100% - 72px);
}

.registration-view .div {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 7.98px;
  position: relative;
  width: 100%;
}

.registration-view .div-wrapper {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.registration-view .text-wrapper-2 {
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

.registration-view .background-border {
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

.registration-view .background-border:focus-within {
  border-color: #7c5cff;
  box-shadow: 0 0 0 3px rgba(124, 92, 255, 0.18);
}

.registration-view .input {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-grow: 1;
  padding: 1px 2px;
  position: relative;
}

.registration-view .container-2 {
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
  outline: none;
  padding: 0;
  position: relative;
  width: 100%;
}

.registration-view .container-2::placeholder {
  color: #6b7280;
  opacity: 1;
}

.registration-view .button-v-if {
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

.registration-view .button-v-if:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.registration-view .text-2 {
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

.registration-view .container-3 {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 36px;
  padding: 11.99px 0px 0px;
  position: absolute;
  top: 564px;
  width: calc(100% - 72px);
}

.registration-view .p {
  color: transparent;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.registration-view .span {
  color: #9ca3af;
}

.registration-view .text-wrapper-4 {
  color: #a78bfa;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 700;
  text-decoration: none;
}

.registration-view .register-error {
  width: 100%;
  margin: -7px 0 -7px;
  color: #f87171;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.registration-view .container-2:-webkit-autofill,
.registration-view .container-2:-webkit-autofill:hover,
.registration-view .container-2:-webkit-autofill:focus,
.registration-view .container-2:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
  -webkit-text-fill-color: #e5e7eb !important;
  caret-color: #e5e7eb;
}

@media (max-width: 500px) {
  .registration-view {
    padding: 20px;
  }

  .registration-view .frame {
    width: 100%;
    max-width: 420px;
  }
}
</style>