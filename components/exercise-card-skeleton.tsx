import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ExerciseCardSkeleton() {
  return (
    <Card className="bg-[#181818] border-none">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4 bg-[#282828]" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-16 bg-[#282828]" />
          <Skeleton className="h-5 w-20 bg-[#282828]" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full bg-[#282828] rounded-lg mb-4" />
        <Skeleton className="h-10 w-full bg-[#282828]" />
      </CardContent>
    </Card>
  )
}

export function ExerciseCardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  )
}
