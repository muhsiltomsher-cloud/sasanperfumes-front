"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoyaltySettings {
  enabled: boolean;
  points_per_aed: number;
  aed_per_point?: number;
  min_redeem_points?: number;
  label_en: string;
  label_ar: string;
}

interface LoyaltyData {
  balance: number;
  currency: string;
  message?: string;
}

export function CheckoutLoyaltyPoints({
  subtotal,
  isRTL,
  divisor,
}: {
  subtotal: string;
  isRTL: boolean;
  divisor: number;
}) {
  const { isAuthenticated, user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);

  // Fetch loyalty settings from backend
  useEffect(() => {
    fetch("/api/loyalty?action=settings")
      .then((r) => r.json())
      .then((d: LoyaltySettings) => {
        if (d?.enabled) setSettings(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchLoyalty = async () => {
      if (!settings?.enabled || !isAuthenticated || !user?.token || !user?.user_id) return;

      try {
        const response = await fetch(`/api/loyalty?customer_id=${user.user_id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data?.points !== undefined) {
            setLoyaltyData({
              balance: data.points,
              currency: "AED",
              message: data.can_redeem ? undefined : "Keep earning to redeem!",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch loyalty balance:", error);
      }
    };

    fetchLoyalty();
  }, [isAuthenticated, settings?.enabled, user]);

  // If loyalty is not enabled in backend, don't show anything.
  if (!settings?.enabled) return null;

  if (!isAuthenticated) {
    return (
      <div className="space-y-2 border-b border-gray-100 py-4">
        <p className="text-sm text-gray-600">
          {isRTL ? "نقاط الولاء" : "Loyalty Points"}
        </p>
        <p className="text-xs text-gray-500">
          {isRTL ? "سجل دخولك لكسب نقاط على هذا الطلب" : "Sign in to earn points on this order"}
        </p>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  const pointsPerAed = settings?.points_per_aed ?? 1;
  const subtotalNum = parseFloat(subtotal);
  const earnedPoints = Math.floor((subtotalNum / divisor) * pointsPerAed);

  return (
    <div className="space-y-2 border-b border-gray-100 py-4">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{isRTL ? "نقاط الولاء - الرصيد" : "Loyalty Points - Balance"}</span>
        <span className="font-medium text-gray-900">{loyaltyData.balance}</span>
      </div>
      {earnedPoints > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>{isRTL ? "نقاط سيتم كسبها" : "Points to Earn"}</span>
          <span className="font-medium text-gray-900">+{earnedPoints}</span>
        </div>
      )}
    </div>
  );
}
