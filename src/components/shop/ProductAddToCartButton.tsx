"use client";

import type { ButtonHTMLAttributes } from "react";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductAddToCartButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isAdded?: boolean;
  isLoading?: boolean;
  showIcon?: boolean;
}

export function ProductAddToCartButton({
  isAdded = false,
  isLoading = false,
  showIcon = false,
  className,
  children,
  ...props
}: ProductAddToCartButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-white shadow-md transition-all duration-300 hover:bg-brand-primary-dark hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-brand-primary disabled:text-white disabled:opacity-50 disabled:hover:bg-brand-primary disabled:hover:shadow-md",
        isAdded && "bg-green-500 hover:bg-green-500",
        className
      )}
    >
      {showIcon && !isAdded && (
        <ShoppingBag className={cn("h-4 w-4", isLoading && "animate-pulse")} />
      )}
      {children}
    </button>
  );
}
