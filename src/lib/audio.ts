/**
 * Simple utility to play system sounds using Web Audio API
 * No external files needed.
 */

class AudioService {
  private context: AudioContext | null = null

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  playSuccess() {
    this.playTone(880, 0.1, 'sine') // High pitch A5
  }

  playError() {
    this.playTone(220, 0.3, 'sawtooth') // Low pitch A3
  }

  private playTone(freq: number, duration: number, type: OscillatorType) {
    try {
      this.initContext()
      if (!this.context) return

      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(freq, this.context.currentTime)
      
      gainNode.gain.setValueAtTime(0.1, this.context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration)

      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)

      oscillator.start()
      oscillator.stop(this.context.currentTime + duration)
    } catch (e) {
      console.warn('Audio play failed:', e)
    }
  }
}

export const audioService = new AudioService()
