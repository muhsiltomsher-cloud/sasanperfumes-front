"use client";

interface AccountLoadingSpinnerProps {
  message: string;
}

export function AccountLoadingSpinner({ message }: AccountLoadingSpinnerProps) {
  return (
    <div className="container mx-auto px-5 md:px-7 lg:px-12 py-8">
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full mx-auto mb-4" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}
