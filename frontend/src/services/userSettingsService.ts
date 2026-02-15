import { ref as dbRef, set, get } from 'firebase/database'
import { db } from '@/firebase'
import { getAuth } from 'firebase/auth'

export type UserLevel = 'easy' | 'medium' | 'hard'

class UserSettingsService {
  async getUserLevel(): Promise<UserLevel> {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      return 'medium'
    }

    try {
      const settingsRef = dbRef(db, `settings/${user.uid}`)
      const snapshot = await get(settingsRef)

      if (snapshot.exists()) {
        const data = snapshot.val()
        if (data.level) {
          return data.level as UserLevel
        }
      }
    } catch (error) {
      console.error('Error loading user level:', error)
    }

    return 'medium'
  }

  async setUserLevel(level: UserLevel): Promise<void> {
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      const settingsRef = dbRef(db, `settings/${user.uid}`)
      await set(settingsRef, { level })
    } catch (error) {
      console.error('Error saving user level:', error)
      throw error
    }
  }
}

export const userSettingsService = new UserSettingsService()
