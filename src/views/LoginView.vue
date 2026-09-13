<template>
  <div class="login-view">
    <div class="frame">

      <!-- Google -->
      <button
        class="button"
        type="button"
        :disabled="loading"
        @click="loginWithGoogle"
      >
        <div class="google"></div>
        <div class="text">
          {{ loading ? 'Pričekajte...' : 'Prijava s Google' }}
        </div>
      </button>

      <!-- Logo -->
      <div class="container">
        <div class="logo"></div>
      </div>

      <!-- Naslov -->
      <div class="heading">
        <div class="text-wrapper">Dobrodošli natrag</div>
      </div>

      <div class="div-wrapper">
        <p class="div">Prijavite se na svoj račun</p>
      </div>

      <!-- Zaboravljena lozinka -->
      <RouterLink class="link" to="/forgot-password">
        <div class="text-2">Zaboravili ste lozinku?</div>
      </RouterLink>

      <!-- Forma -->
      <form @submit.prevent="login">

        <!-- Email -->
        <div class="container-4">
          <div class="label">
            <label class="text-wrapper-3" for="email">
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
              />
            </div>
          </div>
        </div>

        <!-- Lozinka -->
        <div class="container-2">
          <div class="label">
            <label class="text-wrapper-3" for="password">
              Lozinka
            </label>
          </div>

          <div class="background-border">
            <div class="input">
              <input
                id="password"
                v-model="password"
                class="container-3"
                placeholder="••••••••"
                type="password"
                autocomplete="current-password"
              />
            </div>
          </div>
        </div>

        <!-- Greška -->
        <p v-if="error" class="login-error">
          {{ error }}
        </p>

        <!-- Prijava -->
        <button
          class="button-v-if"
          type="submit"
          :disabled="loading"
        >
          <div class="text-3">
            {{ loading ? 'Prijava...' : 'Prijavi se' }}
          </div>
        </button>

      </form>

      <!-- Registracija -->
      <div class="nemate-ra-un-wrapper">
        <p class="nemate-ra-un">
          <span class="span">Nemate račun? </span>

          <RouterLink
            class="text-wrapper-2"
            to="/register"
          >
            Registrirajte se
          </RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { auth } from '../firebase'
import {
  createUserData,
  getUserData,
} from '../services/userService'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function loginWithGoogle() {
  error.value = ''

  try {
    loading.value = true

    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    let userData = await getUserData(userCredential.user.uid)

    if (!userData) {
      userData = await createUserData(userCredential.user)
    }

    router.push(userData.profileCompleted ? '/dashboard' : '/onboarding')
  } catch {
    error.value = 'Google prijava nije uspjela.'
  } finally {
    loading.value = false
  }
}

async function login() {
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Molimo unesite email i lozinku.'
    return
  }

  try {
    loading.value = true

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    )

    let userData = await getUserData(userCredential.user.uid)

    if (!userData) {
      userData = await createUserData(userCredential.user)
    }

    router.push(userData.profileCompleted ? '/dashboard' : '/onboarding')
  } catch (firebaseError) {
    error.value = 'Račun ne postoji ili je lozinka netočna.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
.login-view {
  align-items: center;

  background: linear-gradient(
    128deg,
    rgba(11, 15, 26, 1) 0%,
    rgba(17, 24, 39, 1) 100%
  );

  display: flex;
  justify-content: center;

  width: 100%;
  min-height: 100vh;

  margin: 0;
}

.login-view .frame {
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

.login-view .button {
  all: unset;
  align-items: center;
  background-color: #7c5cff1f;
  border: 1px solid;
  border-color: #7c5cff59;
  border-radius: 10px;
  box-sizing: border-box;
  cursor: pointer;
  display: inline-flex;
  gap: 7.98px;
  height: 42px;
  left: 31px;
  padding: 0.11px 16.11px;
  position: absolute;
  top: calc(50% + 102px);
}

.login-view .google {
  background-image: url("/googleicon.png");
  background-position: 50% 50%;
  background-size: cover;
  height: 17.99px;
  position: relative;
  width: 17.99px;
}

.login-view .text {
  align-items: center;
  color: #c4b5fd;
  display: flex;
  font-family: "Arial-Bold", Helvetica;
  font-size: 13px;
  font-weight: 700;
  justify-content: center;
  letter-spacing: 0;
  line-height: normal;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.login-view .container {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  left: 41px;
  position: absolute;
  top: 41px;
  width: calc(100% - 72px);
}

.login-view .logo {
  width: 206px;
  height: 102px;

  background-image: url("/LogoWhite.png");
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.login-view .heading {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 41px;
  padding: 7.99px 0px 1.11px;
  position: absolute;
  top: 136px;
  width: calc(100% - 72px);
}

.login-view .text-wrapper {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Arial-Bold", Helvetica;
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

.login-view .div-wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 41px;
  position: absolute;
  top: 199px;
  width: calc(100% - 72px);
}

.login-view .div {
  align-items: center;
  color: #9ca3af;
  display: flex;
  font-family: "Arial-Regular", Helvetica;
  font-size: 16px;
  font-weight: 400;
  justify-content: center;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  text-align: center;
  white-space: nowrap;
  width: fit-content;
}

.login-view .link {
  align-items: flex-start;
  display: inline-flex;
  flex-direction: column;
  left: 207px;
  position: absolute;
  text-decoration: none;
  top: calc(50% + 114px);
}

.login-view .text-2 {
  align-items: center;
  color: #a78bfa;
  display: flex;
  font-family: "Arial-Bold", Helvetica;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
  white-space: nowrap;
  width: fit-content;
}

.login-view .button-v-if {
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
  height: 58px;
  justify-content: center;
  left: 31px;
  padding: 1px 138.75px;
  position: absolute;
  top: 474px;
}

.login-view .text-3 {
  align-items: center;
  color: #ffffff;
  display: flex;
  font-family: "Arial-Bold", Helvetica;
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

.login-view .nemate-ra-un-wrapper {
  align-items: center;
  display: flex;
  flex-direction: column;
  left: 31px;
  padding: 11.99px 0px 0px;
  position: absolute;
  top: 536px;
  width: calc(100% - 72px);
}

.login-view .nemate-ra-un {
  color: transparent;
  font-family: "Arial-Regular", Helvetica;
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

.login-view .span {
  color: #9ca3af;
}

.login-view .text-wrapper-2 {
  color: #a78bfa;
  font-family: "Arial-Bold", Helvetica;
  font-weight: 700;
  text-decoration: none;
}

.login-view .container-2 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 7.98px;
  left: 31px;
  position: absolute;
  top: 312px;
  width: calc(100% - 72px);
}

.login-view .label {
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  position: relative;
  width: 100%;
}

.login-view .text-wrapper-3 {
  align-items: center;
  align-self: stretch;
  color: #e5e7eb;
  display: flex;
  font-family: "Arial-Bold", Helvetica;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: normal;
  margin-top: -1px;
  position: relative;
}

.login-view .background-border {
  align-items: center;
  align-self: stretch;
  background-color: #0f172a;
  border: 1px solid;
  border-color: #263246;
  border-radius: 14px;
  box-sizing: border-box;
  display: flex;
  height: 57.99px;
  justify-content: center;
  padding: 0.11px 18.11px;
  position: relative;
  width: 100%;
}

.login-view .input {
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  flex-grow: 1;
  padding: 1px 2px;
  position: relative;
}

.login-view .container-3 {
  align-self: stretch;
  background: none;
  border: none;
  color: #6b7280;
  font-family: "Arial-Regular", Helvetica;
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

.login-view .container-4 {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 7.99px;
  left: 31px;
  position: absolute;
  top: 223px;
  width: calc(100% - 72px);
}
</style>