import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Exercise {
  id: string
  name: string
  bodyPart: string
  equipment: string
  gifUrl: string
  target: string
  instructions: string[]
  sets?: number
  reps?: number
}

export interface WorkoutPlan {
  id: string
  name: string
  exercises: Exercise[]
  created_at: string
  client_name?: string
  notes?: string
}
