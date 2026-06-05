export interface Quote {
  text: string
  author: string | null
}

// ─── Splash / Opening ────────────────────────────────────────────────────────
export const OPENING_QUOTES: Quote[] = [
  { text: "You do not have to carry the whole mountain today. Just take the next step.", author: null },
  { text: "You don't have to finish everything today. Just this moment.", author: "Moment" },
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: "Thich Nhat Hanh" },
  { text: "Rest is not idleness. It is the work of coming back to yourself.", author: null },
  { text: "Small steps forward are still steps forward.", author: null },
  { text: "You are allowed to be both a work in progress and enough, exactly as you are.", author: null },
  { text: "It does not matter how slowly you go, as long as you do not stop.", author: "Confucius" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "One task at a time. One breath at a time. One moment at a time.", author: "Moment" },
  { text: "Begin anywhere.", author: "John Cage" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Wherever you are, be all there.", author: "Jim Elliot" },
]

// ─── Task Completion (DonePanel) ─────────────────────────────────────────────
export const COMPLETION_QUOTES: string[] = [
  "That's one less thing between you and the rest of your day.",
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "One moment at a time — and you just finished one.",
  "Well done. The next step will be easier.",
  "You didn't have to do that. But you did.",
  "Momentum builds from moments exactly like this.",
  "Done is better than perfect. And you did both.",
  "Rest for a breath, then on to the next.",
]

// ─── Recap / Momentum ────────────────────────────────────────────────────────
export const RECAP_QUOTES: string[] = [
  "Progress is still progress. Even the small ones.",
  "You showed up. That's everything.",
  "Every moment completed is a vote for the person you're becoming.",
  "Rest is part of the work.",
  "One step at a time — that's all it takes.",
  "The days you keep going are the ones that matter most.",
  "Momentum isn't about speed. It's about direction.",
  "You built something today. Even if only you know it.",
]

// ─── Reflection / Stuck ──────────────────────────────────────────────────────
export const STUCK_QUOTES: string[] = [
  "Getting stuck isn't failing — it's information.",
  "Some moments need more time. That's okay.",
  "You can set it down and come back. It will wait for you.",
  "Resistance is part of the process, not the end of it.",
  "Stuck means you're close enough to feel the difficulty.",
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomOpeningQuote(): Quote {
  return randomFrom(OPENING_QUOTES)
}

export function randomCompletionQuote(): string {
  return randomFrom(COMPLETION_QUOTES)
}

export function randomRecapQuote(): string {
  return randomFrom(RECAP_QUOTES)
}

export function randomStuckQuote(): string {
  return randomFrom(STUCK_QUOTES)
}