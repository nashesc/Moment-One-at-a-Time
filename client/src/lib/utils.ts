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