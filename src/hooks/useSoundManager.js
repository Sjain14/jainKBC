/**
 * useSoundManager.js — Howler.js sound manager.
 *
 * Sound files expected in /public/sounds/:
 *   idle-bg.mp3         — ambient loop on idle screen
 *   question-bg.mp3     — tense loop while question is showing
 *   timer-tick.mp3      — ticking sound for last 10s
 *   option-select.mp3   — played when admin locks an option
 *   correct.mp3         — correct answer reveal
 *   wrong.mp3           — wrong answer reveal
 *   winner.mp3          — grand finale fanfare
 *   lifeline.mp3        — lifeline activation chime
 *
 * Returns: { play, stop, stopAll }
 */

import { useRef, useCallback } from 'react'
import { Howl }                from 'howler'

const SOUNDS = {
  'idle-bg':       { src: ['/sounds/idle-bg.mp3'],       loop: true,  volume: 0.35 },
  'question-bg':   { src: ['/sounds/question-bg.mp3'],   loop: true,  volume: 0.35 },
  'timer-tick':    { src: ['/sounds/timer-tick.mp3'],    loop: true,  volume: 0.55 },
  'option-select': { src: ['/sounds/option-select.mp3'], loop: false, volume: 0.8  },
  'correct':       { src: ['/sounds/correct.mp3'],       loop: false, volume: 0.9  },
  'wrong':         { src: ['/sounds/wrong.mp3'],         loop: false, volume: 0.9  },
  'winner':        { src: ['/sounds/winner.mp3'],        loop: false, volume: 1.0  },
  'lifeline':      { src: ['/sounds/lifeline.mp3'],      loop: false, volume: 0.75 },
}

export function useSoundManager() {
  const howls = useRef({})

  function getHowl(name) {
    if (!howls.current[name]) {
      const cfg = SOUNDS[name]
      if (!cfg) return null
      howls.current[name] = new Howl({ ...cfg, html5: true })
    }
    return howls.current[name]
  }

  const play = useCallback((name) => {
    const h = getHowl(name)
    if (!h) return
    // Stop any existing play of this sound before restarting
    h.stop()
    h.play()
  }, [])

  const stop = useCallback((name) => {
    const h = howls.current[name]
    if (h) h.stop()
  }, [])

  const stopAll = useCallback(() => {
    Object.values(howls.current).forEach(h => h.stop())
  }, [])

  const fadeOut = useCallback((name, duration = 800) => {
    const h = howls.current[name]
    if (!h) return
    h.fade(h.volume(), 0, duration)
    setTimeout(() => h.stop(), duration)
  }, [])

  return { play, stop, stopAll, fadeOut }
}
