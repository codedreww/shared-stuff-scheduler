import { describe, expect, it } from "vitest";

import { createSeedBookings } from "@/data/seed";
import {
  bookingAtHour,
  findConflict,
  overlaps,
  toDateKey,
  validateBooking,
} from "@/lib/booking";
import type { Booking } from "@/lib/booking";

function slot(
  startHour: number,
  endHour: number,
  extra: Partial<Booking> = {},
): Booking {
  return {
    id: "test",
    resourceId: "vehicle",
    userId: "u1",
    date: "2026-12-01",
    startHour,
    endHour,
    ...extra,
  };
}

describe("overlaps", () => {
  it("is true when two bookings share an hour", () => {
    expect(overlaps(slot(9, 11), slot(10, 12))).toBe(true);
  });

  it("gives the same answer whichever booking comes first", () => {
    expect(overlaps(slot(10, 12), slot(9, 11))).toBe(true);
  });

  it("is false for back-to-back bookings", () => {
    expect(overlaps(slot(9, 11), slot(11, 12))).toBe(false);
    expect(overlaps(slot(11, 12), slot(9, 11))).toBe(false);
  });

  it("is false for different resources at the same time", () => {
    const projector = slot(9, 11, { resourceId: "projector" });
    expect(overlaps(slot(9, 11), projector)).toBe(false);
  });

  it("is false for the same hours on different dates", () => {
    const nextDay = slot(9, 11, { date: "2026-12-02" });
    expect(overlaps(slot(9, 11), nextDay)).toBe(false);
  });

  it("is true when one booking sits inside another", () => {
    expect(overlaps(slot(9, 12), slot(10, 11))).toBe(true);
  });

  it("is true for two identical bookings", () => {
    expect(overlaps(slot(9, 11), slot(9, 11))).toBe(true);
  });
});

describe("findConflict", () => {
  it("returns the booking that is in the way", () => {
    const existing = [slot(9, 11, { id: "a" }), slot(13, 15, { id: "b" })];
    expect(findConflict(slot(14, 16), existing)?.id).toBe("b");
  });

  it("returns undefined when the slot is free", () => {
    const existing = [slot(9, 11), slot(13, 15)];
    expect(findConflict(slot(11, 13), existing)).toBeUndefined();
  });
});

describe("validateBooking", () => {
  // A fixed "now" before the test date, so tests don't depend on today's date.
  const now = new Date(2026, 10, 24, 8, 0); // 24 Nov 2026, 08:00 (months start at 0)

  it("accepts a free slot", () => {
    const result = validateBooking(slot(11, 13), [slot(9, 11)], now);
    expect(result.ok).toBe(true);
  });

  it("rejects a slot that overlaps an existing booking", () => {
    const existing = slot(9, 11, { id: "existing" });
    const result = validateBooking(slot(10, 12), [existing], now);
    expect(result).toMatchObject({ ok: false, conflict: { id: "existing" } });
  });

  it("rejects an end time before the start time", () => {
    expect(validateBooking(slot(12, 10), [], now).ok).toBe(false);
  });

  it("rejects a booking with no length", () => {
    expect(validateBooking(slot(10, 10), [], now).ok).toBe(false);
  });

  it("rejects hours outside 7:00 to 19:00", () => {
    expect(validateBooking(slot(6, 8), [], now).ok).toBe(false);
    expect(validateBooking(slot(18, 20), [], now).ok).toBe(false);
  });

  it("accepts a booking that fills the whole day", () => {
    expect(validateBooking(slot(7, 19), [], now).ok).toBe(true);
  });

  it("rejects times that are not on the hour", () => {
    expect(validateBooking(slot(9.5, 11), [], now).ok).toBe(false);
  });

  it("rejects a date in the past", () => {
    const yesterday = slot(9, 11, { date: "2026-11-23" });
    expect(validateBooking(yesterday, [], now).ok).toBe(false);
  });

  it("rejects an hour today that has already started", () => {
    // It is 08:00, so the 8:00 slot is under way and 7:00 is over.
    const today = { date: "2026-11-24" };
    expect(validateBooking(slot(8, 9, today), [], now).ok).toBe(false);
    expect(validateBooking(slot(7, 9, today), [], now).ok).toBe(false);
  });

  it("accepts a later hour today", () => {
    const laterToday = slot(9, 10, { date: "2026-11-24" });
    expect(validateBooking(laterToday, [], now).ok).toBe(true);
  });
});

describe("bookingAtHour", () => {
  const bookings = [slot(12, 14, { id: "lunch" })];

  it("finds the booking for each hour it covers", () => {
    expect(bookingAtHour(bookings, "vehicle", "2026-12-01", 12)?.id).toBe("lunch");
    expect(bookingAtHour(bookings, "vehicle", "2026-12-01", 13)?.id).toBe("lunch");
  });

  it("treats the end hour as free", () => {
    expect(bookingAtHour(bookings, "vehicle", "2026-12-01", 14)).toBeUndefined();
  });

  it("ignores other resources and other dates", () => {
    expect(bookingAtHour(bookings, "projector", "2026-12-01", 12)).toBeUndefined();
    expect(bookingAtHour(bookings, "vehicle", "2026-12-02", 12)).toBeUndefined();
  });
});

describe("toDateKey", () => {
  it("pads single-digit months and days", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("seed data", () => {
  it("has no bookings that overlap each other", () => {
    const bookings = createSeedBookings(new Date(2026, 10, 24));
    for (const booking of bookings) {
      const others = bookings.filter((b) => b.id !== booking.id);
      expect(findConflict(booking, others)).toBeUndefined();
    }
  });
});
