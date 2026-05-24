"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate: string;
  locale?: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endDate: string): TimeLeft | null {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export function CountdownTimer({ endDate, locale = "en", compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => {
      const t = calcTimeLeft(endDate);
      setTimeLeft(t);
      if (!t) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  if (!timeLeft) return null;

  const isAr = locale === "ar";
  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <Clock className="h-3 w-3" />
        {timeLeft.days > 0
          ? `${timeLeft.days}${isAr ? "ي" : "d"} ${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}`
          : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
      </span>
    );
  }

  const units = isAr
    ? [
        { label: "يوم", value: timeLeft.days },
        { label: "ساعة", value: timeLeft.hours },
        { label: "دقيقة", value: timeLeft.minutes },
        { label: "ثانية", value: timeLeft.seconds },
      ]
    : [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Mins", value: timeLeft.minutes },
        { label: "Secs", value: timeLeft.seconds },
      ];

  const visible = timeLeft.days > 0 ? units : units.slice(1);

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-2">
      <Clock className="h-4 w-4 shrink-0 text-red-500" />
      <span className="text-xs font-medium text-red-600 ltr:mr-1 rtl:ml-1">
        {isAr ? "ينتهي خلال" : "Ends in"}:
      </span>
      <div className="flex items-center gap-1">
        {visible.map((u, i) => (
          <div key={u.label} className="flex items-center gap-1">
            {i > 0 && <span className="font-bold text-red-400">:</span>}
            <div className="flex flex-col items-center">
              <span className="min-w-[28px] rounded bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold tabular-nums text-white">
                {pad(u.value)}
              </span>
              <span className="mt-0.5 text-[9px] uppercase tracking-wide text-red-400">{u.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
