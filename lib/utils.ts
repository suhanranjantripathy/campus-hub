import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAttendanceMetrics(
  attended: number,
  total: number,
  targetPercent: number = 75
) {
  const currentPercent = total === 0 ? 100 : Math.round((attended / total) * 100 * 10) / 10;
  const isSafe = currentPercent >= targetPercent;

  let safeBunks = 0;
  let classesNeededToRecover = 0;

  if (isSafe) {
    // How many classes can be missed without dropping below target%
    // (attended) / (total + x) >= target / 100
    // 100 * attended >= target * (total + x)
    // x <= (100 * attended / target) - total
    safeBunks = Math.max(0, Math.floor((attended * 100) / targetPercent - total));
  } else {
    // How many consecutive classes to attend to reach target%
    // (attended + y) / (total + y) >= target / 100
    // 100 * (attended + y) >= target * (total + y)
    // 100*attended + 100*y >= target*total + target*y
    // y * (100 - target) >= target*total - 100*attended
    const numerator = targetPercent * total - 100 * attended;
    const denominator = 100 - targetPercent;
    classesNeededToRecover = Math.max(1, Math.ceil(numerator / denominator));
  }

  return {
    currentPercent,
    targetPercent,
    isSafe,
    safeBunks,
    classesNeededToRecover,
    statusColor:
      currentPercent >= targetPercent + 5
        ? "green"
        : currentPercent >= targetPercent
        ? "yellow"
        : "red",
  };
}
