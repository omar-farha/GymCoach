"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Play, ArrowLeft, Send, ArrowUp, ArrowDown } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Update the Exercise interface to include sets and reps
interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  instructions: string[];
  sets?: number;
  reps?: number;
}

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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [bodyPart, setBodyPart] = useState("all");
  const [loading, setLoading] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const { t } = useLanguage();

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

  useEffect(() => {
    fetchExercises();
  }, [bodyPart]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const url = `/api/exercises?bodyPart=${bodyPart}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      } else {
        console.error("Failed to fetch exercises");
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // In the addExercise function, add default sets and reps
  const addExercise = (exercise: Exercise) => {
    if (!selectedExercises.find((e) => e.id === exercise.id)) {
      setSelectedExercises([
        ...selectedExercises,
        { ...exercise, sets: 3, reps: 12 },
      ]);
    }
  };

  // Add updateExercise function after addExercise
  const updateExercise = (exerciseId: string, sets: number, reps: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets, reps } : ex))
    );
  };

  const removeExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== exerciseId));
  };

  const moveExerciseUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...selectedExercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    setSelectedExercises(newExercises);
  };

  const moveExerciseDown = (index: number) => {
    if (index === selectedExercises.length - 1) return;
    const newExercises = [...selectedExercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    setSelectedExercises(newExercises);
  };

  const saveWorkout = () => {
    if (!workoutName.trim() || selectedExercises.length === 0) return;

    const workout = {
      name: workoutName,
      exercises: selectedExercises,
      client_name: clientName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    onSave(workout);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#181818] sticky top-0 z-50 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <h1 className="text-2xl font-bold text-white">
              {editingWorkout ? t("Edit Workout Plan") : t("Create Workout Plan")}
            </h1>
          </div>

          <Button
            onClick={saveWorkout}
            disabled={!workoutName.trim() || selectedExercises.length === 0}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold px-6 disabled:bg-gray-700 disabled:text-gray-500"
          >
            <Send className="w-4 h-4 mr-2" />
            {t("Save Workout")}
          </Button>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    {t("Workout Name")} *
                  </label>
                  <Input
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder={t("Enter workout name")}
                    className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    {t("Client Name")}
                  </label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={t("Enter client name")}
                    className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    {t("Notes")}
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("Add workout notes or instructions")}
                    className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
                    rows={3}
                  />
                </div>

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
                          transition={{ delay: index * 0.05 }}
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
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("Search exercises...")}
                        className="pl-10 bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
                      />
                    </div>
                  </div>
                  <select
                    value={bodyPart}
                    onChange={(e) => setBodyPart(e.target.value)}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DB954]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredExercises.map((exercise, index) => (
                    <motion.div
                      key={exercise.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-[#181818] border-none hover:bg-[#282828] transition-colors">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-white text-base leading-tight">
                                {exercise.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                <Badge
                                  variant="secondary"
                                  className="bg-[#1DB954]/20 text-[#1DB954] text-xs border-none"
                                >
                                  {exercise.target}
                                </Badge>
                                <span className="text-gray-400 text-xs ml-2">
                                  {exercise.equipment}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div
                            className="relative mb-4 bg-[#121212] rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => setPreviewExercise(exercise)}
                          >
                            <img
                              src={exercise.gifUrl || "/placeholder.svg"}
                              alt={exercise.name}
                              className="w-full h-48 object-contain"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-center">
                                <Play className="w-8 h-8 text-[#1DB954] mx-auto mb-1" />
                                <p className="text-white text-sm font-medium">{t("Preview")}</p>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => addExercise(exercise)}
                            disabled={selectedExercises.some(
                              (e) => e.id === exercise.id
                            )}
                            className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold disabled:bg-[#282828] disabled:text-gray-500"
                          >
                            {selectedExercises.some(
                              (e) => e.id === exercise.id
                            ) ? (
                              t("Added")
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                {t("Add Exercise")}
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Exercise Preview Modal */}
      <Dialog open={!!previewExercise} onOpenChange={() => setPreviewExercise(null)}>
        <DialogContent className="bg-[#181818] border-none max-w-2xl">
          {previewExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-[#1DB954] text-xl">
                  {previewExercise.name}
                </DialogTitle>
                <DialogDescription className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-[#1DB954]/20 text-[#1DB954] border-none">
                    {previewExercise.target}
                  </Badge>
                  <Badge variant="secondary" className="bg-[#282828] text-gray-300 border-none">
                    {previewExercise.equipment}
                  </Badge>
                  <Badge variant="secondary" className="bg-[#282828] text-gray-300 border-none">
                    {previewExercise.bodyPart}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Exercise GIF */}
                <div className="relative bg-[#121212] rounded-lg overflow-hidden">
                  <img
                    src={previewExercise.gifUrl || "/placeholder.svg"}
                    alt={previewExercise.name}
                    className="w-full h-96 object-contain"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">{t("Instructions")}</h4>
                  <ol className="space-y-2">
                    {previewExercise.instructions.map((instruction, index) => (
                      <li key={index} className="text-gray-300 flex">
                        <span className="text-[#1DB954] font-semibold mr-3 min-w-[1.5rem]">{index + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Add Exercise Button */}
                <Button
                  onClick={() => {
                    addExercise(previewExercise);
                    setPreviewExercise(null);
                  }}
                  disabled={selectedExercises.some((e) => e.id === previewExercise.id)}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold disabled:bg-[#282828] disabled:text-gray-500"
                >
                  {selectedExercises.some((e) => e.id === previewExercise.id) ? (
                    t("Already Added")
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("Add to Workout")}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
