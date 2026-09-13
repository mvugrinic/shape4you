import { auth, db } from '../firebase.js'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

export function getCurrentFirebaseUser() {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe()
      resolve(user)
    })
  })
}

export function createDefaultUser(firebaseUser, name = '') {
  return {
    uid: firebaseUser.uid,
    name: name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Korisnik',
    email: firebaseUser.email,
    profileCompleted: false,
    profile: null,
    points: 0,
    streak: 0,
    completedChallenges: [],
    completedWorkouts: [],
    workoutHistory: [],
    lastChallengeDate: null,
    weightHistory: null,
    targetWeight: null,
  }
}

export async function getUserData(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid))

  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data()
}

export async function createUserData(firebaseUser, name = '') {
  const userData = createDefaultUser(firebaseUser, name)

  await setDoc(doc(db, 'users', firebaseUser.uid), userData)

  return userData
}

export async function saveUserData(userData) {
  await setDoc(doc(db, 'users', userData.uid), userData, { merge: true })
}

export async function updateUserData(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, 'users'))

  return snapshot.docs.map(docItem => docItem.data())
}
