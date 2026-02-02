import type { VoicePracticeResult, VoicePracticePhrase } from '@/types'

class VoicePracticeService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787'

  async generatePhrase(
    word: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ): Promise<VoicePracticePhrase> {
    try {
      const response = await fetch(`${this.baseUrl}/api/voice-practice-phrase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating practice phrase:', error)
      throw error
    }
  }

  async evaluateVoice(
    audioBlob: Blob,
    targetPhrase: string,
  ): Promise<VoicePracticeResult> {
    try {
      const base64 = await this.blobToBase64(audioBlob)

      const response = await fetch(`${this.baseUrl}/api/voice-practice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: base64,
          targetPhrase,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error evaluating voice:', error)
      throw error
    }
  }

  async speakText(text: string, lang: string = 'en'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, lang }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate speech')
      }

      const arrayBuffer = await response.arrayBuffer()
      const audioBlob = new Blob([arrayBuffer], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audioEl = new Audio(audioUrl)
      await audioEl.play()
    } catch (error) {
      console.error('Error playing text:', error)
      throw error
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      if (blob.size === 0) {
        reject(new Error('Audio blob is empty'))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        if (!result || !result.includes(',')) {
          reject(new Error('Invalid audio data format'))
          return
        }
        const base64 = result.split(',')[1]
        if (!base64) {
          reject(new Error('Failed to extract base64 audio data'))
          return
        }
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read audio blob'))
      reader.readAsDataURL(blob)
    })
  }
}

export const voicePracticeService = new VoicePracticeService()
