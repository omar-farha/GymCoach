"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Plus, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import type { Exercise } from "@/hooks/use-exercises";

interface ExerciseGridProps {
  exercises: Exercise[];
  selectedExerciseIds: Set<string>;
  onAddExercise: (exercise: Exercise) => void;
  onPreviewExercise: (exercise: Exercise) => void;
}

// Memoized to prevent re-renders when form inputs change
export const ExerciseGrid = memo(function ExerciseGrid({
  exercises,
  selectedExerciseIds,
  onAddExercise,
  onPreviewExercise,
}: ExerciseGridProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {exercises.map((exercise, index) => (
        <motion.div
          key={exercise.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: Math.min(index * 0.05, 0.5) }}
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
                onClick={() => onPreviewExercise(exercise)}
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
                onClick={() => onAddExercise(exercise)}
                disabled={selectedExerciseIds.has(exercise.id)}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold disabled:bg-[#282828] disabled:text-gray-500"
              >
                {selectedExerciseIds.has(exercise.id) ? (
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
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if exercises or selections change
  return (
    prevProps.exercises === nextProps.exercises &&
    prevProps.selectedExerciseIds === nextProps.selectedExerciseIds
  );
});
