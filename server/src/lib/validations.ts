import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'done', 'stuck', 'skipped']).default('pending'),
  priority: z.number().int().min(1).max(3).default(1),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .default(() => new Date().toISOString().split('T')[0]),
  estimated_minutes: z.number().int().min(5).max(480).default(30),
  order_index: z.number().int().default(0),
})

// Standalone — not taskSchema.partial(). That's the bug you already fixed once;
// don't reintroduce it by "cleaning up" this file later.
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'done', 'stuck', 'skipped']).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD').optional(),
  estimated_minutes: z.number().int().min(5).max(480).optional(),
  order_index: z.number().int().optional(),
})

export const checkinSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(['on_track', 'stuck', 'skipped', 'done']),
  stuck_reason: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  duration_seconds: z.number().int().min(0).max(86400).optional(),
})

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
})

// This is what the migration actually buys you here: types derived from the
// live validation rules instead of a hand-written interface that can drift
// from them silently.
export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof updateTaskSchema>
export type CheckinInput = z.infer<typeof checkinSchema>