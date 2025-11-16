import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { matchesEgyptianSearch } from "@/lib/exercise-translations"

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

const EXERCISES_PER_PAGE = 15

interface ExerciseFilters {
  bodyPart?: string
  search?: string
  page?: number
}

// Fetch ALL exercises once and cache aggressively
function useAllExercises() {
  return useQuery({
    queryKey: ["exercises-all"],
    queryFn: async () => {
      const url = `/api/exercises?bodyPart=all`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch exercises")
      }

      const data: Exercise[] = await response.json()
      return data
    },
    staleTime: Infinity, // Never refetch - exercises don't change
    gcTime: Infinity, // Keep in cache forever
  })
}

export function useExercises(filters: ExerciseFilters = {}) {
  const { bodyPart = "all", search = "", page = 1 } = filters

  // Fetch all exercises once
  const { data: allExercises, isLoading, isError, error } = useAllExercises()

  // Filter and paginate on client side (INSTANT with Egyptian Arabic!)
  const paginatedData = useMemo(() => {
    if (!allExercises) {
      return {
        exercises: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        itemsPerPage: EXERCISES_PER_PAGE,
      }
    }

    // Filter by body part
    let filtered = allExercises
    if (bodyPart !== "all") {
      filtered = allExercises.filter((ex) => ex.bodyPart === bodyPart)
    }

    // Filter by search term (supports both English and Egyptian Arabic)
    if (search) {
      filtered = filtered.filter((exercise) => matchesEgyptianSearch(exercise, search))
    }

    // Paginate
    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / EXERCISES_PER_PAGE)
    const startIndex = (page - 1) * EXERCISES_PER_PAGE
    const endIndex = startIndex + EXERCISES_PER_PAGE
    const paginatedExercises = filtered.slice(startIndex, endIndex)

    return {
      exercises: paginatedExercises,
      totalCount,
      totalPages,
      currentPage: page,
      itemsPerPage: EXERCISES_PER_PAGE,
    }
  }, [allExercises, bodyPart, search, page])

  return {
    data: paginatedData,
    isLoading,
    isError,
    error,
  }
}
