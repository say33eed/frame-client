/** Booking dates and times use Bangladesh time (Asia/Dhaka, UTC+06:00). */
export const BOOKING_TIME_ZONE = "Asia/Dhaka";
const OFFSET_MS = 6 * 60 * 60 * 1000;
export function bookingInstant(date: string, time: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return NaN;
  const millis = Date.parse(`${date}T${time}:00.000Z`);
  if (!Number.isFinite(millis) || new Date(`${date}T00:00:00.000Z`).toISOString().slice(0, 10) !== date) return NaN;
  return millis - OFFSET_MS;
}
export function bookingCompleted(booking: { status: string; date: string; endTime: string }, now = Date.now()): boolean {
  return (booking.status === "Confirmed" || booking.status === "Completed") && bookingInstant(booking.date, booking.endTime) <= now;
}
export function bangladeshToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: BOOKING_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
