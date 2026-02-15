<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  getAuth,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth'
import { ref as dbRef, set, get } from 'firebase/database'
import { useRouter } from 'vue-router'
import { db } from '@/firebase'
import MainHeader from '@/components/MainHeader.vue'
import sweetAlertService from '@/services/sweetAlertService'
import { BaseButton, BaseInput } from '@/components/ui'

const router = useRouter()
const auth = getAuth()

const user = ref<User | null>(null)
const displayName = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const level = ref<'easy' | 'medium' | 'hard'>('medium')

onMounted(() => {
  user.value = auth.currentUser
  if (user.value) {
    displayName.value = user.value.displayName || ''
    email.value = user.value.email || ''
    loadUserLevel()
  } else {
    router.push('/login')
  }
})

const loadUserLevel = async () => {
  if (!user.value) return
  try {
    const settingsRef = dbRef(db, `settings/${user.value.uid}`)
    const snapshot = await get(settingsRef)
    if (snapshot.exists()) {
      const data = snapshot.val()
      if (data.level) {
        level.value = data.level as 'easy' | 'medium' | 'hard'
      }
    }
  } catch (error) {
    console.error('Error loading user level:', error)
  }
}

const saveUserLevel = async () => {
  if (!user.value) return

  isLoading.value = true
  try {
    const settingsRef = dbRef(db, `settings/${user.value.uid}`)
    await set(settingsRef, { level: level.value })
    await sweetAlertService.success(
      'Level Updated',
      `Your preferred level has been set to ${level.value}!`,
    )
  } catch (error) {
    console.error('Error saving user level:', error)
    await sweetAlertService.error(
      'Save Failed',
      'Failed to save level preference.',
    )
  } finally {
    isLoading.value = false
  }
}

const updateProfileInfo = async () => {
  if (!user.value) return

  isLoading.value = true
  try {
    // Update display name
    if (displayName.value !== user.value.displayName) {
      await updateProfile(user.value, {
        displayName: displayName.value,
      })
    }

    // Update email if changed
    if (email.value !== user.value.email) {
      await updateEmail(user.value, email.value)
    }

    await sweetAlertService.success(
      'Profile Updated',
      'Your profile has been updated successfully!',
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update profile. Please try again.'
    await sweetAlertService.error('Update Failed', errorMessage)
  } finally {
    isLoading.value = false
  }
}

const updateUserPassword = async () => {
  if (!user.value) return

  if (newPassword.value !== confirmPassword.value) {
    await sweetAlertService.error(
      'Password Mismatch',
      'New password and confirmation do not match.',
    )
    return
  }

  if (newPassword.value.length < 6) {
    await sweetAlertService.error(
      'Weak Password',
      'Password must be at least 6 characters long.',
    )
    return
  }

  isLoading.value = true
  try {
    await updatePassword(user.value, newPassword.value)

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    await sweetAlertService.success(
      'Password Updated',
      'Your password has been updated successfully!',
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update password. You may need to re-login.'
    await sweetAlertService.error('Update Failed', errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors">
    <MainHeader />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        class="bg-white dark:bg-black rounded-lg shadow-md p-6 transition-colors"
      >
        <h1
          class="text-3xl font-bold text-primary-900 dark:text-primary-50 mb-6"
        >
          Profile Settings
        </h1>

        <!-- Profile Information Section -->
        <div class="mb-8">
          <h2
            class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4"
          >
            Profile Information
          </h2>

          <form @submit.prevent="updateProfileInfo" class="space-y-4">
            <div>
              <BaseInput
                id="displayName"
                v-model="displayName"
                type="text"
                label="Display Name"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <BaseInput
                id="email"
                v-model="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
              />
            </div>

            <BaseButton variant="primary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </BaseButton>
          </form>
        </div>

        <!-- Level Preference Section -->
        <div class="mb-8">
          <h2
            class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4"
          >
            Practice Level Preference
          </h2>

          <form @submit.prevent="saveUserLevel" class="space-y-4">
            <div>
              <label
                class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
              >
                Select your preferred difficulty level for practice activities
              </label>
              <div
                class="flex items-center gap-1 px-3 py-2 border border-gray-200 dark:border-primary-700 rounded-md bg-gray-100 dark:bg-primary-800 w-fit"
              >
                <label
                  v-for="l in ['easy', 'medium', 'hard']"
                  :key="l"
                  class="cursor-pointer"
                >
                  <input
                    type="radio"
                    :value="l"
                    v-model="level"
                    class="sr-only peer"
                  />
                  <span
                    class="px-3 py-1.5 text-sm rounded transition-colors peer-checked:bg-secondary-500 peer-checked:text-white text-gray-600 dark:text-primary-400 hover:text-gray-900 dark:hover:text-primary-200"
                  >
                    {{ l.charAt(0).toUpperCase() + l.slice(1) }}
                  </span>
                </label>
              </div>
            </div>

            <BaseButton variant="secondary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Saving...' : 'Save Level' }}
            </BaseButton>
          </form>
        </div>

        <!-- Password Change Section -->
        <div class="border-t border-primary-200 dark:border-primary-800 pt-8">
          <h2
            class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4"
          >
            Change Password
          </h2>

          <form @submit.prevent="updateUserPassword" class="space-y-4">
            <div>
              <BaseInput
                id="newPassword"
                v-model="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <BaseInput
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
              />
            </div>

            <BaseButton
              variant="secondary"
              type="submit"
              :disabled="isLoading || !newPassword || !confirmPassword"
            >
              {{ isLoading ? 'Updating...' : 'Change Password' }}
            </BaseButton>
          </form>
        </div>

        <!-- Account Information -->
        <div
          class="border-t border-primary-200 dark:border-primary-800 pt-8 mt-8"
        >
          <div class="space-y-2 text-sm text-primary-700 dark:text-primary-300">
            <p>
              <strong>Account Created:</strong>
              {{ user?.metadata.creationTime }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
