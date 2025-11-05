import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { WorkoutPlan } from "@/lib/supabase"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 12

export interface WorkoutFilters {
  search?: string
  sortBy?: "date" | "name" | "client"
  page?: number
}

// Fetch workouts with pagination and filters
export function useWorkouts(filters: WorkoutFilters = {}) {
  const { search = "", sortBy = "date", page = 1 } = filters

  return useQuery({
    queryKey: ["workouts", { search, sortBy, page }],
    queryFn: async () => {
      let query = supabase.from("workout_plans").select("*", { count: "exact" })

      // Apply search filter on server side
      if (search) {
        query = query.or(
          `name.ilike.%${search}%,client_name.ilike.%${search}%,notes.ilike.%${search}%`
        )
      }

      // Apply sorting
      if (sortBy === "date") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "name") {
        query = query.order("name", { ascending: true })
      } else if (sortBy === "client") {
        query = query.order("client_name", { ascending: true, nullsFirst: false })
      }

      // Apply pagination
      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        workouts: (data || []) as WorkoutPlan[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE),
        currentPage: page,
        itemsPerPage: ITEMS_PER_PAGE,
      }
    },
  })
}

// Fetch single workout by ID
export function useWorkout(id: string) {
  return useQuery({
    queryKey: ["workout", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_plans")
        .select("*")
        .eq("id", id)
        .single()

      if (error) throw error
      return data as WorkoutPlan
    },
    enabled: !!id,
  })
}

// Create workout mutation
export function useCreateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (plan: Omit<WorkoutPlan, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("workout_plans")
        .insert([plan])
        .select()
        .single()

      if (error) throw error
      return data as WorkoutPlan
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast.success("Workout plan created successfully!")
    },
    onError: (error) => {
      console.error("Error creating workout:", error)
      toast.error("Failed to create workout plan")
    },
  })
}

// Update workout mutation
export function useUpdateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: Partial<WorkoutPlan> }) => {
      const { data, error } = await supabase
        .from("workout_plans")
        .update(plan)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data as WorkoutPlan
    },
    onMutate: async ({ id, plan }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workouts"] })
      await queryClient.cancelQueries({ queryKey: ["workout", id] })

      // Snapshot previous values
      const previousWorkouts = queryClient.getQueriesData({ queryKey: ["workouts"] })
      const previousWorkout = queryClient.getQueryData(["workout", id])

      // Optimistically update
      queryClient.setQueriesData({ queryKey: ["workouts"] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          workouts: old.workouts.map((w: WorkoutPlan) =>
            w.id === id ? { ...w, ...plan } : w
          ),
        }
      })

      queryClient.setQueryData(["workout", id], (old: any) => {
        if (!old) return old
        return { ...old, ...plan }
      })

      return { previousWorkouts, previousWorkout }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        context.previousWorkouts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousWorkout) {
        queryClient.setQueryData(["workout", variables.id], context.previousWorkout)
      }
      console.error("Error updating workout:", error)
      toast.error("Failed to update workout plan")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast.success("Workout plan updated successfully!")
    },
  })
}

// Delete workout mutation
export function useDeleteWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workout_plans").delete().eq("id", id)

      if (error) throw error
      return id
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["workouts"] })

      // Snapshot previous value
      const previousWorkouts = queryClient.getQueriesData({ queryKey: ["workouts"] })

      // Optimistically remove from cache
      queryClient.setQueriesData({ queryKey: ["workouts"] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          workouts: old.workouts.filter((w: WorkoutPlan) => w.id !== id),
          totalCount: old.totalCount - 1,
        }
      })

      return { previousWorkouts }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousWorkouts) {
        context.previousWorkouts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error("Error deleting workout:", error)
      toast.error("Failed to delete workout plan")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast.success("Workout plan deleted successfully!")
    },
  })
}

// Duplicate workout mutation
export function useDuplicateWorkout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (workout: WorkoutPlan) => {
      const duplicatedWorkout = {
        name: `${workout.name} (Copy)`,
        exercises: workout.exercises,
        client_name: workout.client_name,
        notes: workout.notes,
      }

      const { data, error } = await supabase
        .from("workout_plans")
        .insert([duplicatedWorkout])
        .select()
        .single()

      if (error) throw error
      return data as WorkoutPlan
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast.success("Workout duplicated successfully!")
    },
    onError: (error) => {
      console.error("Error duplicating workout:", error)
      toast.error("Failed to duplicate workout")
    },
  })
}

// Get workout statistics
export function useWorkoutStats() {
  return useQuery({
    queryKey: ["workout-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("workout_plans").select("client_name")

      if (error) throw error

      const totalWorkouts = data.length
      const activeClients = new Set(data.map((p) => p.client_name).filter(Boolean)).size
      const plansShared = totalWorkouts // Placeholder - implement tracking later

      return {
        totalWorkouts,
        activeClients,
        plansShared,
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}
