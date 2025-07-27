import { z } from 'zod'

// User validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  userType: z.enum(['founder', 'investor'], {
    message: 'Please select your role'
  })
})

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  userType: z.enum(['founder', 'investor']).optional()
})

// Startup validation schemas
export const startupSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  tagline: z.string().min(10, 'Tagline must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  industry: z.string().min(2, 'Industry is required'),
  stage: z.string().min(2, 'Stage is required'),
  fundingGoal: z.number().min(1000, 'Funding goal must be at least $1,000'),
  website: z.string().url('Invalid website URL').optional(),
})

// Pitch validation schemas
export const pitchSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  pitchType: z.enum(['text', 'video', 'slide']),
  videoUrl: z.string().url('Invalid video URL').optional(),
  slideUrl: z.string().url('Invalid slide URL').optional()
})

// Comment validation schema
export const commentSchema = z.object({
  content: z.string().min(5, 'Comment must be at least 5 characters')
})

// Message validation schema
export const messageSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  content: z.string().min(10, 'Message must be at least 10 characters'),
  receiverId: z.string().uuid('Invalid receiver ID'),
  startupId: z.string().uuid('Invalid startup ID').optional()
})

// Type exports
export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>
export type StartupData = z.infer<typeof startupSchema>
export type PitchData = z.infer<typeof pitchSchema>
export type CommentData = z.infer<typeof commentSchema>
export type MessageData = z.infer<typeof messageSchema>
