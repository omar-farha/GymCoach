import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WorkoutCardSkeleton() {
  return (
    <Card className="bg-[#181818] border-none">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-3/4 bg-[#282828]" />
        </CardTitle>
        <CardDescription className="space-y-2">
          <Skeleton className="h-5 w-20 bg-[#282828]" />
          <Skeleton className="h-4 w-24 bg-[#282828]" />
          <Skeleton className="h-3 w-32 bg-[#282828]" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-8 flex-1 bg-[#282828]" />
          <Skeleton className="h-8 w-12 bg-[#282828]" />
        </div>
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-8 flex-1 bg-[#282828]" />
          <Skeleton className="h-8 flex-1 bg-[#282828]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 bg-[#282828]" />
        </div>
      </CardContent>
    </Card>
  )
}

export function WorkoutCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <WorkoutCardSkeleton key={i} />
      ))}
    </div>
  )
}
