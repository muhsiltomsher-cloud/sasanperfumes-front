"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/common/Button";
import { LoyaltyDashboard } from "@/components/account/LoyaltyDashboard";
import { ReferralProgram } from "@/components/account/ReferralProgram";

interface AccountPageProps {
  params: Promise<{ locale: string }>;
}

export default function AccountPage({ params }: AccountPageProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, locale, router]);

  const isRTL = locale === "ar";

  const t = {
    en: {
      myAccount: "My Account",
      welcome: "Welcome back",
      orders: "My Orders",
      ordersDesc: "View and track your orders",
      addresses: "Addresses",
      addressesDesc: "Manage your delivery addresses",
      wishlist: "Wishlist",
      wishlistDesc: "View your saved items",
      settings: "Account Settings",
      settingsDesc: "Update your profile and preferences",
      logout: "Logout",
      logoutDesc: "Sign out of your account",
      memberSince: "Member since",
      loading: "Loading...",
    },
    ar: {
      myAccount: "حسابي",
      welcome: "مرحباً بعودتك",
      orders: "طلباتي",
      ordersDesc: "عرض وتتبع طلباتك",
      addresses: "العناوين",
      addressesDesc: "إدارة عناوين التوصيل",
      wishlist: "قائمة الرغبات",
      wishlistDesc: "عرض المنتجات المحفوظة",
      settings: "إعدادات الحساب",
      settingsDesc: "تحديث ملفك الشخصي والتفضيلات",
      logout: "تسجيل الخروج",
      logoutDesc: "الخروج من حسابك",
      memberSince: "عضو منذ",
      loading: "جاري التحميل...",
    },
  };

  const texts = t[locale as keyof typeof t] || t.en;

  const menuItems = [
    {
      icon: Package,
      label: texts.orders,
      description: texts.ordersDesc,
      href: `/${locale}/account/orders`,
    },
    {
      icon: MapPin,
      label: texts.addresses,
      description: texts.addressesDesc,
      href: `/${locale}/account/addresses`,
    },
    {
      icon: Heart,
      label: texts.wishlist,
      description: texts.wishlistDesc,
      href: `/${locale}/account/wishlist`,
    },
    {
      icon: Settings,
      label: texts.settings,
      description: texts.settingsDesc,
      href: `/${locale}/account/settings`,
    },
  ];

  const handleLogout = () => {
    logout();
    router.push(`/${locale}`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-border border-t-brand-primary"></div>
          <p className="text-brand-muted">{texts.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="account-shell min-h-screen bg-transparent py-5 md:py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-5 md:px-7 lg:px-12">
        <h1 className="mb-5 font-title text-[30px] leading-none text-brand-primary md:mb-8 md:text-4xl">
          {texts.myAccount}
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="luxury-panel p-5 md:p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-brand-border/70 bg-brand-ivory shadow-[0_12px_28px_rgba(20,15,10,0.08)] md:h-24 md:w-24">
                  <User className="h-10 w-10 text-brand-primary md:h-12 md:w-12" />
                </div>
                <h2 className="text-xl font-semibold text-brand-primary">
                  {user.user_display_name}
                </h2>
                <p className="mt-1 text-brand-muted">{user.user_email}</p>
                <p className="mt-2 text-sm text-brand-muted">
                  {texts.welcome}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Loyalty Points */}
            <LoyaltyDashboard locale={locale as "en" | "ar"} customerId={user?.user_id ? parseInt(String(user.user_id)) : undefined} />

            {/* Referral Program */}
            <ReferralProgram locale={locale as "en" | "ar"} customerId={user?.user_id ? parseInt(String(user.user_id)) : undefined} />

            <div className="luxury-panel overflow-hidden">
              <nav>
                <ul className="divide-y divide-brand-border/70">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                          className="flex items-center justify-between p-4 transition-colors hover:bg-brand-beige/55"
                      >
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border/70 bg-brand-ivory text-brand-primary md:h-12 md:w-12">
                              <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <div>
                              <h3 className="font-medium text-brand-primary">
                              {item.label}
                            </h3>
                              <p className="text-sm text-brand-muted">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 text-brand-muted ${
                            isRTL ? "rotate-180" : ""
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-brand-border/70 p-4">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  {texts.logout}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
