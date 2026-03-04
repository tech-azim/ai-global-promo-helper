import { TagCount } from "@/types";

/**
 * Format tanggal jadi readable (Indonesia)
 */
export function formatDate(dateString: string | Date) {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Hitung frekuensi tag dari semua customer
 * Return TagCount[] sorted by count descending
 */
export function computeTagFrequency(
  customers: { tags: string[] }[],
): TagCount[] {
  const freq: Record<string, number> = {};

  for (const customer of customers) {
    for (const tag of customer.tags || []) {
      const normalized = tag.toLowerCase().trim();
      if (!normalized) continue;
      freq[normalized] = (freq[normalized] || 0) + 1;
    }
  }

  return Object.entries(freq)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Generate label minggu berjalan
 * contoh: "Week 12 - 2026"
 */
export function getWeekLabel(date = new Date()) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);

  const pastDays = Math.floor(
    (date.getTime() - firstDayOfYear.getTime()) / 86400000,
  );

  const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);

  return `Week ${weekNumber} - ${date.getFullYear()}`;
}
