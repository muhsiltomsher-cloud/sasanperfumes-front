import { Skeleton } from "@/components/common/Skeleton";
import { AuthBackground } from "@/components/common/AuthBackground";

export default function LoginLoading() {
  return (
    <AuthBackground showImage={false} className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-6 md:p-8 lg:p-12 shadow-2xl">
          <Skeleton className="mb-4 h-10 w-10 rounded-full" />
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="mb-8 h-8 w-64" />

          <Skeleton className="mb-4 h-12 w-full rounded-lg" />

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <Skeleton className="h-4 w-8" />
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>

          <Skeleton className="mt-6 h-4 w-48" />
        </div>
      </div>
    </AuthBackground>
  );
}
