import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday } from 'date-fns'
import type { TaskStatus, TaskPriority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d, yyyy')
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
  stuck: 'Stuck',
  skipped: 'Skipped',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  1: '#2D5A27',
  2: '#D97706',
  3: '#4a7bc4',
}

export const COMPLETION_MESSAGES = [
  "That's one less thing between you and the rest of your day.",
  "You showed up. That's everything.",
  "Progress is still progress. Even the small ones.",
  "One moment at a time — and you just had one.",
  "Well done. The next step will be easier.",
  "You didn't have to do that. But you did.",
]

export function randomCompletionMessage(): string {
  return COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
}

export const OPENING_QUOTES = [
  { text: "You do not have to carry the whole mountain today. Just take the next step.", author: null },
  { text: "You don't have to finish everything today. Just this moment.", author: 'Moment' },
  { text: "The present moment is the only moment available to us, and it is the door to all moments.", author: 'Thich Nhat Hanh' },
  { text: "Rest is not idleness. It is the work of coming back to yourself.", author: null },
  { text: "Small steps forward are still steps forward.", author: null },
]

export function randomQuote() {
  return OPENING_QUOTES[Math.floor(Math.random() * OPENING_QUOTES.length)]
}