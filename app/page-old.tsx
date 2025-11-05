"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Dumbbell, Users, Share2, Globe, Pencil, Trash2, Copy, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import WorkoutBuilder from "@/components/workout-builder"
import { useLanguage } from "@/hooks/use-language"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface WorkoutPlan {
  id: string
  name: string
  exercises: any[]
  created_at: string
  client_name?: string
  notes?: string
}

export default function Dashboard() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "client">("date")
  const { language, toggleLanguage, t } = useLanguage()

  useEffect(() => {
    fetchWorkoutPlans()
  }, [])

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setWorkoutPlans(data || [])
    } catch (error) {
      console.error('Error fetching workout plans:', error)
      toast.error('Failed to load workout plans')
    } finally {
      setLoading(false)
    }
  }

  const saveWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id' | 'created_at'>) => {
    try {
      if (editingWorkout) {
        // Update existing workout
        const { data, error } = await supabase
          .from('workout_plans')
          .update(plan)
          .eq('id', editingWorkout.id)
          .select()
          .single()

        if (error) throw error

        setWorkoutPlans(workoutPlans.map(w => w.id === data.id ? data : w))
        toast.success('Workout plan updated successfully!')
      } else {
        // Create new workout
        const { data, error } = await supabase
          .from('workout_plans')
          .insert([plan])
          .select()
          .single()

        if (error) throw error

        setWorkoutPlans([data, ...workoutPlans])
        toast.success('Workout plan created successfully!')
      }

      setShowBuilder(false)
      setEditingWorkout(null)
    } catch (error) {
      console.error('Error saving workout plan:', error)
      toast.error(editingWorkout ? 'Failed to update workout plan' : 'Failed to save workout plan')
    }
  }

  const deleteWorkoutPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .delete()
        .eq('id', id)

      if (error) throw error

      setWorkoutPlans(workoutPlans.filter(w => w.id !== id))
      toast.success('Workout plan deleted successfully!')
    } catch (error) {
      console.error('Error deleting workout plan:', error)
      toast.error('Failed to delete workout plan')
    } finally {
      setDeleteDialogOpen(false)
      setWorkoutToDelete(null)
    }
  }

  const handleEdit = (workout: WorkoutPlan) => {
    setEditingWorkout(workout)
    setShowBuilder(true)
  }

  const handleDeleteClick = (id: string) => {
    setWorkoutToDelete(id)
    setDeleteDialogOpen(true)
  }

  const duplicateWorkout = async (workout: WorkoutPlan) => {
    try {
      const duplicatedWorkout = {
        name: `${workout.name} (Copy)`,
        exercises: workout.exercises,
        client_name: workout.client_name,
        notes: workout.notes,
      }

      const { data, error } = await supabase
        .from('workout_plans')
        .insert([duplicatedWorkout])
        .select()
        .single()

      if (error) throw error

      setWorkoutPlans([data, ...workoutPlans])
      toast.success('Workout duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating workout:', error)
      toast.error('Failed to duplicate workout')
    }
  }

  const shareWorkout = (planId: string) => {
    const url = `${window.location.origin}/workout/${planId}`
    const message =
      language === "ar" ? `مرحباً! إليك خطة التمرين الخاصة بك: ${url}` : `Hi! Here's your workout plan: ${url}`

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  // Filter and sort workouts
  const filteredAndSortedWorkouts = workoutPlans
    .filter((plan) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        plan.name.toLowerCase().includes(searchLower) ||
        plan.client_name?.toLowerCase().includes(searchLower) ||
        plan.notes?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "client") {
        return (a.client_name || "").localeCompare(b.client_name || "")
      }
      return 0
    })

  if (showBuilder) {
    return (
      <WorkoutBuilder
        onSave={saveWorkoutPlan}
        onCancel={() => {
          setShowBuilder(false)
          setEditingWorkout(null)
        }}
        editingWorkout={editingWorkout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#181818] sticky top-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1DB954] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Dumbbell className="w-5 h-5 sm:w-7 sm:h-7 text-black" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">{t("GymCoach Pro")}</h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{t("Online Fitness Training")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-gray-300 hover:text-white hover:bg-[#282828] px-2 sm:px-4"
            >
              <Globe className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{language === "en" ? "العربية" : "English"}</span>
            </Button>

            <Button
              onClick={() => setShowBuilder(true)}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold px-3 sm:px-6 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t("Create Workout")}</span>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#1DB954] flex items-center gap-2 text-lg">
                <Dumbbell className="w-5 h-5" />
                {t("Total Workouts")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{workoutPlans.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#1DB954] flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                {t("Active Clients")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">
                {new Set(workoutPlans.map((p) => p.client_name).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#1DB954] flex items-center gap-2 text-lg">
                <Share2 className="w-5 h-5" />
                {t("Plans Shared")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-white">{workoutPlans.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workout Plans */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{t("Workout Plans")}</h2>
            </div>

            {/* Search and Filter Bar */}
            <Card className="bg-[#181818] border-none">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t("Search workouts, clients, or notes...")}
                      className="pl-10 bg-[#282828] border-none text-white placeholder:text-gray-500 focus:ring-2 focus:ring-[#1DB954]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "date" | "name" | "client")}
                      className="px-4 py-2 bg-[#282828] border-none rounded-md text-white text-sm focus:ring-2 focus:ring-[#1DB954]"
                    >
                      <option value="date">{t("Sort by Date")}</option>
                      <option value="name">{t("Sort by Name")}</option>
                      <option value="client">{t("Sort by Client")}</option>
                    </select>
                  </div>
                </div>
                {searchTerm && (
                  <div className="mt-3 text-sm text-[#1DB954]">
                    {filteredAndSortedWorkouts.length} {t("results found")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
            </div>
          ) : filteredAndSortedWorkouts.length === 0 && !searchTerm ? (
            <Card className="bg-[#181818] border-none border-dashed border-[#282828]">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">{t("No workout plans yet")}</h3>
                <p className="text-gray-500 text-center mb-6">
                  {t("Create your first workout plan to get started with training your clients.")}
                </p>
                <Button onClick={() => setShowBuilder(true)} className="bg-[#1DB954] hover:bg-[#1ed760] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("Create First Workout")}
                </Button>
              </CardContent>
            </Card>
          ) : filteredAndSortedWorkouts.length === 0 && searchTerm ? (
            <Card className="bg-[#181818] border-none">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400 mb-2">{t("No results found")}</h3>
                <p className="text-gray-500 text-center">
                  {t("Try adjusting your search or filter criteria")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedWorkouts.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-all">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {plan.client_name && (
                          <Badge variant="secondary" className="bg-[#1DB954]/20 text-[#1DB954] mb-2">
                            {plan.client_name}
                          </Badge>
                        )}
                        <div>
                          {plan.exercises.length} {t("exercises")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t("Created")}: {new Date(plan.created_at).toLocaleDateString()}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/workout/${plan.id}`, "_blank")}
                          className="flex-1 border-[#282828] hover:bg-[#282828] bg-[#121212]"
                        >
                          {t("View")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => shareWorkout(plan.id)}
                          className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                          className="flex-1 border-[#282828] hover:bg-[#282828] text-white bg-[#121212]"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          {t("Edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateWorkout(plan)}
                          className="flex-1 border-[#282828] hover:bg-[#282828] text-white bg-[#121212]"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {t("Duplicate")}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(plan.id)}
                          className="flex-1 border-red-500/30 hover:bg-red-500/20 text-red-400 bg-[#121212]"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t("Delete")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#282828] border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">{t("Delete Workout Plan")}</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {t("Are you sure you want to delete this workout plan? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#181818] text-white hover:bg-[#121212] border-none">
              {t("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workoutToDelete && deleteWorkoutPlan(workoutToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
