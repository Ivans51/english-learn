<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAuth, updateProfile, updateEmail, updatePassword, type User } from 'firebase/auth'
import { useRouter } from 'vue-router'
import MainHeader from '@/components/MainHeader.vue'
import sweetAlertService from '@/services/sweetAlertService'

const router = useRouter()
const auth = getAuth()

const user = ref<User | null>(null)
const displayName = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

onMounted(() => {
  user.value = auth.currentUser
  if (user.value) {
    displayName.value = user.value.displayName || ''
    email.value = user.value.email || ''
  } else {
    router.push('/login')
  }
})

const updateProfileInfo = async () => {
  if (!user.value) return

  isLoading.value = true
  try {
    // Update display name
    if (displayName.value !== user.value.displayName) {
      await updateProfile(user.value, {
        displayName: displayName.value
      })
    }

    // Update email if changed
    if (email.value !== user.value.email) {
      await updateEmail(user.value, email.value)
    }

    await sweetAlertService.success('Profile Updated', 'Your profile has been updated successfully!')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
    await sweetAlertService.error('Update Failed', errorMessage)
  } finally {
    isLoading.value = false
  }
}

const updateUserPassword = async () => {
  if (!user.value) return

  if (newPassword.value !== confirmPassword.value) {
    await sweetAlertService.error('Password Mismatch', 'New password and confirmation do not match.')
    return
  }

  if (newPassword.value.length < 6) {
    await sweetAlertService.error('Weak Password', 'Password must be at least 6 characters long.')
    return
  }

  isLoading.value = true
  try {
    await updatePassword(user.value, newPassword.value)

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    await sweetAlertService.success('Password Updated', 'Your password has been updated successfully!')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update password. You may need to re-login.'
    await sweetAlertService.error('Update Failed', errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-primary-50 dark:bg-primary-900 transition-colors">
    <MainHeader />

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white dark:bg-primary-950 rounded-lg shadow-md p-6 transition-colors">
        <h1 class="text-3xl font-bold text-primary-900 dark:text-primary-50 mb-6">
          Profile Settings
        </h1>

        <!-- Profile Information Section -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4">
            Profile Information
          </h2>

          <form @submit.prevent="updateProfileInfo" class="space-y-4">
            <div>
              <label for="displayName" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Display Name
              </label>
              <input
                id="displayName"
                v-model="displayName"
                type="text"
                class="w-full px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 transition-colors"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                class="w-full px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="bg-primary-900 dark:bg-primary-50 text-primary-50 dark:text-primary-950 px-6 py-2 rounded-md font-medium hover:bg-primary-800 dark:hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </div>

        <!-- Password Change Section -->
        <div class="border-t border-primary-200 dark:border-primary-800 pt-8">
          <h2 class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4">
            Change Password
          </h2>

          <form @submit.prevent="updateUserPassword" class="space-y-4">
            <div>
              <label for="newPassword" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                class="w-full px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 transition-colors"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                class="w-full px-4 py-2 border border-primary-300 dark:border-primary-700 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-primary-900 text-primary-900 dark:text-primary-50 transition-colors"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading || !newPassword || !confirmPassword"
              class="bg-secondary-900 dark:bg-secondary-800 text-primary-50 px-6 py-2 rounded-md font-medium hover:bg-secondary-800 dark:hover:bg-secondary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Updating...' : 'Change Password' }}
            </button>
          </form>
        </div>

        <!-- Account Information -->
        <div class="border-t border-primary-200 dark:border-primary-800 pt-8 mt-8">
          <h2 class="text-xl font-semibold text-primary-900 dark:text-primary-50 mb-4">
            Account Information
          </h2>
          <div class="space-y-2 text-sm text-primary-700 dark:text-primary-300">
            <p><strong>User ID:</strong> {{ user?.uid }}</p>
            <p><strong>Email Verified:</strong> {{ user?.emailVerified ? 'Yes' : 'No' }}</p>
            <p><strong>Account Created:</strong> {{ user?.metadata.creationTime }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
