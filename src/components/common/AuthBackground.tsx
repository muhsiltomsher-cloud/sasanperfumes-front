import Image from "next/image";
import { cn } from "@/lib/utils";
import { shouldUseUnoptimizedImage } from "@/lib/utils/image";

const AUTH_BACKGROUND_IMAGE = "https://cms.sasanperfumes.ae/wp-content/uploads/2025/12/page-bg.jpg";

interface AuthBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showImage?: boolean;
}

export function AuthBackground({ children, className, showImage = true }: AuthBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", showImage && "bg-brand-beige", className)}>
      {showImage && (
        <Image
          src={AUTH_BACKGROUND_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized={shouldUseUnoptimizedImage(AUTH_BACKGROUND_IMAGE)}
        />
      )}
      <div className="relative z-10 flex w-full justify-center">
        {children}
      </div>
    </div>
  );
}
