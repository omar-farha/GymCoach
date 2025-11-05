"use client";

import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";

interface WorkoutFormSectionProps {
  workoutName: string;
  clientName: string;
  notes: string;
  onWorkoutNameChange: (value: string) => void;
  onClientNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
}

// Memoized to prevent re-renders when parent updates
export const WorkoutFormSection = memo(function WorkoutFormSection({
  workoutName,
  clientName,
  notes,
  onWorkoutNameChange,
  onClientNameChange,
  onNotesChange,
}: WorkoutFormSectionProps) {
  const { t } = useLanguage();

  return (
    <>
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          {t("Workout Name")} *
        </label>
        <Input
          value={workoutName}
          onChange={(e) => onWorkoutNameChange(e.target.value)}
          placeholder={t("Enter workout name")}
          className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          {t("Client Name")}
        </label>
        <Input
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          placeholder={t("Enter client name")}
          className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
          autoComplete="off"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          {t("Notes")}
        </label>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={t("Add workout notes or instructions")}
          className="bg-[#282828] border-none text-white focus:ring-2 focus:ring-[#1DB954]"
          rows={3}
        />
      </div>
    </>
  );
});
