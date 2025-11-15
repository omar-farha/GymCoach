"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, ArrowLeft, Send, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";
import { useDebounce } from "@/hooks/use-debounce";
import { useExercises, type Exercise } from "@/hooks/use-exercises";
import { ExerciseCardSkeletonGrid } from "@/components/exercise-card-skeleton";
import { PaginationControls } from "@/components/pagination-controls";
import { WorkoutFormSection } from "@/components/workout-form-section";
import { ExerciseGrid } from "@/components/exercise-grid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Exercise[];
  created_at: string;
  client_name?: string;
  notes?: string;
}

interface WorkoutBuilderProps {
  onSave: (plan: Omit<WorkoutPlan, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  editingWorkout?: WorkoutPlan | null;
}

export default function WorkoutBuilder({
  onSave,
  onCancel,
  editingWorkout,
}: WorkoutBuilderProps) {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bodyPart, setBodyPart] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [workoutName, setWorkoutName] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const { t } = useLanguage();

  // Debounce search to reduce filtering operations
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch exercises with pagination
  const {
    data: exercisesData,
    isLoading,
    isError,
    error,
  } = useExercises({
    bodyPart,
    search: debouncedSearch,
    page: currentPage,
  });

  // Load editing workout data
  useEffect(() => {
    if (editingWorkout) {
      setWorkoutName(editingWorkout.name);
      setClientName(editingWorkout.client_name || "");
      setNotes(editingWorkout.notes || "");
      setSelectedExercises(editingWorkout.exercises);
    }
  }, [editingWorkout]);

  const bodyParts = [
    "all",
    "back",
    "cardio",
    "chest",
    "lower arms",
    "lower legs",
    "neck",
    "shoulders",
    "upper arms",
    "upper legs",
    "waist",
  ];

  // Memoize callbacks to prevent recreation on every render
  const handleBodyPartChange = useCallback((value: string) => {
    setBodyPart(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    setSelectedExercises((prev) => {
      if (prev.find((e) => e.id === exercise.id)) return prev;
      return [...prev, { ...exercise, sets: 3, reps: 12 }];
    });
  }, []);

  const updateExercise = useCallback((exerciseId: string, sets: number, reps: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets, reps } : ex))
    );
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((e) => e.id !== exerciseId));
  }, []);

  const moveExerciseUp = useCallback((index: number) => {
    setSelectedExercises((prev) => {
      if (index === 0) return prev;
      const newExercises = [...prev];
      [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
      return newExercises;
    });
  }, []);

  const moveExerciseDown = useCallback((index: number) => {
    setSelectedExercises((prev) => {
      if (index === prev.length - 1) return prev;
      const newExercises = [...prev];
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
      return newExercises;
    });
  }, []);

  const saveWorkout = useCallback(() => {
    if (!workoutName.trim() || selectedExercises.length === 0) return;

    const workout = {
      name: workoutName,
      exercises: selectedExercises,
      client_name: clientName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(workout);
  }, [workoutName, selectedExercises, clientName, notes, onSave]);

  // Form input handlers - memoized to prevent re-renders
  const handleWorkoutNameChange = useCallback((value: string) => {
    setWorkoutName(value);
  }, []);

  const handleClientNameChange = useCallback((value: string) => {
    setClientName(value);
  }, []);

  const handleNotesChange = useCallback((value: string) => {
    setNotes(value);
  }, []);

  // Memoize selected exercise IDs set for efficient lookups
  const selectedExerciseIds = useMemo(
    () => new Set(selectedExercises.map(e => e.id)),
    [selectedExercises]
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#181818] sticky top-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-white hover:bg-[#282828]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back")}
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-white">
              {editingWorkout ? t("Edit Workout Plan") : t("Create Workout Plan")}
            </h1>
          </div>

          <Button
            onClick={saveWorkout}
            disabled={!workoutName.trim() || selectedExercises.length === 0}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold px-3 sm:px-6 disabled:bg-gray-700 disabled:text-gray-500 text-sm sm:text-base"
          >
            <Send className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("Save Workout")}</span>
            <span className="sm:hidden">{t("Save")}</span>
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Workout Details */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-[#181818] border-none sticky top-24 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle className="text-[#1DB954] text-xl">
                  {t("Workout Details")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                <WorkoutFormSection
                  workoutName={workoutName}
                  clientName={clientName}
                  notes={notes}
                  onWorkoutNameChange={handleWorkoutNameChange}
                  onClientNameChange={handleClientNameChange}
                  onNotesChange={handleNotesChange}
                />

                {/* Selected Exercises */}
                <div>
                  <h3 className="text-sm font-medium text-[#1DB954] mb-3">
                    {t("Selected Exercises")} ({selectedExercises.length})
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    <AnimatePresence>
                      {selectedExercises.map((exercise, index) => (
                        <motion.div
                          key={exercise.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -20, opacity: 0 }}
                          className="p-3 bg-[#282828] rounded-lg space-y-3 hover:bg-[#2a2a2a] transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExerciseUp(index)}
                                disabled={index === 0}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-[#1DB954] disabled:opacity-30"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveExerciseDown(index)}
                                disabled={index === selectedExercises.length - 1}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-[#1DB954] disabled:opacity-30"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {index + 1}. {exercise.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {exercise.target}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Sets and Reps Controls */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-400">
                                {t("Sets")}:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={exercise.sets || 3}
                                onChange={(e) =>
                                  updateExercise(
                                    exercise.id,
                                    Number.parseInt(e.target.value) || 3,
                                    exercise.reps || 12
                                  )
                                }
                                className="w-12 h-8 bg-[#121212] border-none rounded text-white text-center text-sm focus:ring-2 focus:ring-[#1DB954]"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-gray-400">
                                {t("Reps")}:
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="50"
                                value={exercise.reps || 12}
                                onChange={(e) =>
                                  updateExercise(
                                    exercise.id,
                                    exercise.sets || 3,
                                    Number.parseInt(e.target.value) || 12
                                  )
                                }
                                className="w-12 h-8 bg-[#121212] border-none rounded text-white text-center text-sm focus:ring-2 focus:ring-[#1DB954]"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Exercise Selection */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2"
          >
            {/* Filters */}
            <Card className="bg-[#181818] border-none mb-6">
              <CardHeader>
                <CardTitle className="text-[#1DB954]">
                  {t("Find Exercises")}
                </CardTitle>
                {debouncedSearch && exercisesData && (
                  <CardDescription className="text-[#1DB954] mt-2">
                    {exercisesData.totalCount} {t("results found")}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder={t("Search exercises...")}
                        className="pl-10 bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
                      />
                    </div>
                  </div>
                  <select
                    value={bodyPart}
                    onChange={(e) => handleBodyPartChange(e.target.value)}
                    className="px-3 py-2 bg-[#282828] border-none rounded-md text-white focus:ring-2 focus:ring-[#1DB954]"
                  >
                    {bodyParts.map((part) => (
                      <option key={part} value={part}>
                        {part === "all"
                          ? t("All Body Parts")
                          : part.charAt(0).toUpperCase() + part.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Grid */}
            {isLoading && <ExerciseCardSkeletonGrid count={50} />}

            {isError && (
              <Card className="bg-[#181818] border-none border-red-500/20">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold mb-2">Failed to load exercises</p>
                    <p className="text-sm text-gray-400">{error instanceof Error ? error.message : "Unknown error"}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !isError && exercisesData && (
              <>
                <ExerciseGrid
                  exercises={exercisesData.exercises}
                  selectedExerciseIds={selectedExerciseIds}
                  onAddExercise={addExercise}
                  onPreviewExercise={setPreviewExercise}
                />

                {/* Pagination */}
                {exercisesData.totalPages > 1 && (
                  <Card className="bg-[#181818] border-none">
                    <CardContent className="p-4">
                      <PaginationControls
                        currentPage={exercisesData.currentPage}
                        totalPages={exercisesData.totalPages}
                        totalItems={exercisesData.totalCount}
                        itemsPerPage={exercisesData.itemsPerPage}
                        onPageChange={handlePageChange}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Exercise Preview Modal */}
      <Dialog open={!!previewExercise} onOpenChange={() => setPreviewExercise(null)}>
        <DialogContent className="bg-[#181818] border-none w-[95vw] max-w-md sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          {previewExercise && (
            <>
              <DialogHeader className="pb-3">
                <DialogTitle className="text-[#1DB954] text-base sm:text-xl leading-tight pr-6">
                  {previewExercise.name}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  <Badge variant="secondary" className="bg-[#1DB954]/20 text-[#1DB954] border-none text-xs">
                    {previewExercise.target}
                  </Badge>
                  <Badge variant="secondary" className="bg-[#282828] text-gray-300 border-none text-xs">
                    {previewExercise.equipment}
                  </Badge>
                  <Badge variant="secondary" className="bg-[#282828] text-gray-300 border-none text-xs">
                    {previewExercise.bodyPart}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 sm:space-y-4">
                {/* Exercise GIF */}
                <div className="relative bg-[#121212] rounded-lg overflow-hidden">
                  <img
                    src={previewExercise.gifUrl || "/placeholder.svg"}
                    alt={previewExercise.name}
                    className="w-full h-48 sm:h-64 object-contain"
                  />
                </div>

                {/* Add Exercise Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPreviewExercise(null)}
                    variant="outline"
                    className="flex-1 border-[#282828] hover:bg-[#282828] text-white bg-[#121212] text-sm sm:text-base h-9 sm:h-10"
                  >
                    {t("Close")}
                  </Button>
                  <Button
                    onClick={() => {
                      addExercise(previewExercise);
                      setPreviewExercise(null);
                    }}
                    disabled={selectedExerciseIds.has(previewExercise.id)}
                    className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold disabled:bg-[#282828] disabled:text-gray-500 text-sm sm:text-base h-9 sm:h-10"
                  >
                    {selectedExerciseIds.has(previewExercise.id) ? (
                      <span className="text-xs sm:text-base">{t("Already Added")}</span>
                    ) : (
                      <>
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-xs sm:text-base">{t("Add to Workout")}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
