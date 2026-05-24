export function triggerHaptic(duration = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Silently fail - vibration not supported
    }
  }
}
