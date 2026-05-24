"use client";

import { useEffect } from "react";
import { ShoppingBag, Check } from "lucide-react";

interface AddToCartAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function AddToCartAnimation({ isVisible, onComplete }: AddToCartAnimationProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      <div className="animate-bounce-in rounded-full bg-green-500 p-4 shadow-2xl">
        <Check className="h-8 w-8 text-white" />
      </div>
    </div>
  );
}

interface CartButtonAnimatedProps {
  isAdding: boolean;
  isAdded: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  addingLabel?: string;
  isRTL?: boolean;
}

export function CartButtonAnimated({
  isAdding,
  isAdded,
  onClick,
  disabled,
  className = "",
  label = "Add to Cart",
  addingLabel = "Adding...",
  isRTL = false,
}: CartButtonAnimatedProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isAdding}
      className={`flex items-center justify-center gap-2 transition-all duration-300 ${
        isAdded
          ? "bg-green-500 scale-95"
          : isAdding
          ? "opacity-70 scale-95"
          : "active:scale-95"
      } ${className}`}
    >
      {isAdded ? (
        <>
          <Check className="h-4 w-4" />
          <span>{isRTL ? "تمت الإضافة" : "Added!"}</span>
        </>
      ) : (
        <>
          <ShoppingBag className={`h-4 w-4 ${isAdding ? "animate-pulse" : ""}`} />
          <span>{isAdding ? addingLabel : label}</span>
        </>
      )}
    </button>
  );
}
