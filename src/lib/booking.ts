export type Resource = { id: string; name: string; description: string };
export type User = { id: string; name: string };
export type Booking = {
  id: string;
  resourceId: string;
  userId: string; /* YYYY-MM-DD */
  date: string;
  startHour: number; /* First booked hour, 24h clock. */
  endHour: number; /* if end hour at 14, block hour 12 and 13 is booked */
};

/** A booking that has not been saved yet. */
export type BookingRequest = Omit<Booking, "id">;

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string; conflict?: Booking };

/** Bookable day runs from 7:00 to 19:00. */
export const OPEN_HOUR = 7;
export const CLOSE_HOUR = 19;

/** Every hour that can start a slot: 7, 8, ... 18. */
const HOURS: number[] = [];
for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour++) {
  HOURS.push(hour);
}

type Slot = Pick<Booking, "resourceId" | "date" | "startHour" | "endHour">;

/**Function to create date*/
export function toDateKey(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(
    2,
    "0",
  ); /*Javascript starts month from 0*/
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/**
 * True when two slots collide: same resource, same day, and their hours intersect.
 * Because endHour is exclusive, back-to-back bookings (12-14 then 14-15) do not overlap.
 */
export function overlaps(a: Slot, b: Slot): boolean {
  return (
    a.resourceId === b.resourceId &&
    a.date === b.date &&
    a.startHour < b.endHour &&
    b.startHour < a.endHour
  );
}

/** The first existing booking that collides with the request, if any. */
export function findConflict(
  request: Slot,
  bookings: Booking[],
): Booking | undefined {
  for (const existing of bookings) {
    if (overlaps(request, existing)) {
      return existing;
    }
  }
  return undefined;
}

/**
 * Checks a request against every rule. Call this right before saving,
 * with the freshest list of bookings.
 */
export function validateBooking(
  request: BookingRequest,
  bookings: Booking[],
  now: Date,
): ValidationResult {
  const { startHour, endHour, date } = request;

  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
    return { ok: false, reason: "Bookings must start and end on the hour." };
  }
  if (endHour <= startHour) {
    return { ok: false, reason: "The end time must be after the start time." };
  }
  if (startHour < OPEN_HOUR || endHour > CLOSE_HOUR) {
    return {
      ok: false,
      reason: `Bookings must be between ${OPEN_HOUR}:00 and ${CLOSE_HOUR}:00.`,
    };
  }

  const today = toDateKey(now);
  const alreadyStarted = date === today && startHour <= now.getHours();
  if (date < today || alreadyStarted) {
    return { ok: false, reason: "That time has already passed." };
  }

  const conflict = findConflict(request, bookings);
  if (conflict) {
    return {
      ok: false,
      reason: `Already booked from ${conflict.startHour}:00 to ${conflict.endHour}:00.`,
      conflict,
    };
  }

  return { ok: true };
}

/** The booking covering one hour of one resource on one day. Used to draw the grid. */
export function bookingAtHour(
  bookings: Booking[],
  resourceId: string,
  date: string,
  hour: number,
): Booking | undefined {
  return bookings.find(
    (b) =>
      b.resourceId === resourceId &&
      b.date === date &&
      b.startHour <= hour &&
      hour < b.endHour,
  );
}
