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
    <div className="container mx-auto px-5 py-8 md:px-7 lg:px-12">
      <div className="animate-pulse">
        <div className="mb-8 h-8 w-48 rounded bg-brand-beige" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg border border-brand-border/70 bg-brand-ivory" />
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
    <div className="container mx-auto px-5 py-12 md:px-7 md:py-16 lg:px-12">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-brand-border/70 bg-brand-ivory shadow-[0_12px_28px_rgba(20,15,10,0.08)] md:h-24 md:w-24">
            <Icon className="h-10 w-10 text-brand-muted md:h-12 md:w-12" />
          </div>
        </div>
        <p className="mb-8 text-brand-muted">{notLoggedInText}</p>
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

  return <div className="account-shell">{children}</div>;
}
