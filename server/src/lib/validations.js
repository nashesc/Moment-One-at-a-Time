import { z } from 'zod'

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  status: z.enum(['pending', 'in_progress', 'done', 'stuck', 'skipped']).default('pending'),
  priority: z.number().int().min(1).max(3).default(1),
  scheduled_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD')
    .default(() => new Date().toISOString().split('T')[0]),
  estimated_minutes: z.number().int().min(5).max(480).default(30),
  order_index: z.number().int().default(0),
})

export const updateTaskSchema = taskSchema.partial()

export const checkinSchema = z.object({
  task_id: z.string().uuid(),
  status: z.enum(['on_track', 'stuck', 'skipped', 'done']),
  stuck_reason: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
})

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .regex(
      passwordRegex,
      'Password must contain uppercase, number, and special character (@$!%*?&)'
    ),
  full_name: z.string().min(1, 'Name is required').max(100),
})