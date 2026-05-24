import { forwardRef, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, asChild = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      primary: "bg-brand-primary text-white border border-brand-primary hover:bg-brand-primary-dark active:bg-brand-primary-dark focus-visible:ring-brand-primary",
      secondary: "bg-brand-beige text-brand-primary border border-brand-border hover:bg-brand-beige-dark active:bg-brand-beige-dark focus-visible:ring-brand-primary",
      outline: "border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-white active:bg-brand-primary-dark focus-visible:ring-brand-primary",
      ghost: "text-brand-primary border border-transparent hover:bg-brand-beige active:bg-brand-beige-dark focus-visible:ring-brand-primary",
      link: "text-brand-primary underline-offset-4 hover:underline border-0 bg-transparent hover:text-brand-primary-dark focus-visible:ring-brand-primary",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-7 text-base gap-2",
    };

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    // Handle asChild - render child element with button styles
    if (asChild) {
      const child = Children.only(children);
      if (isValidElement(child)) {
        return cloneElement(child, {
          className: cn(combinedClassName, (child.props as { className?: string }).className),
          "aria-disabled": disabled || isLoading || undefined,
          ...props,
        } as React.HTMLAttributes<HTMLElement>);
      }
      return null;
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
