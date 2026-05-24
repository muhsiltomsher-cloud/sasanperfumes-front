"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";

interface AccountAuthGuardProps {
  locale: string;
  icon: LucideIcon;
  notLoggedInText: string;
  loginText: string;
  children: React.ReactNode;
}

function AuthLoadingSkeleton() {
  return (
    <div className="container mx-auto px-5 md:px-7 lg:px-12 py-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

function NotAuthenticatedState({
  locale,
  icon: Icon,
  notLoggedInText,
  loginText,
}: {
  locale: string;
  icon: LucideIcon;
  notLoggedInText: string;
  loginText: string;
}) {
  return (
    <div className="container mx-auto px-5 md:px-7 lg:px-12 py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <Icon className="h-12 w-12 text-gray-400" />
          </div>
        </div>
        <p className="mb-8 text-gray-500">{notLoggedInText}</p>
        <Button asChild variant="primary" size="lg">
          <Link href={`/${locale}/login`}>{loginText}</Link>
        </Button>
      </div>
    </div>
  );
}

export function AccountAuthGuard({
  locale,
  icon,
  notLoggedInText,
  loginText,
  children,
}: AccountAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <NotAuthenticatedState
        locale={locale}
        icon={icon}
        notLoggedInText={notLoggedInText}
        loginText={loginText}
      />
    );
  }

  return <>{children}</>;
}
