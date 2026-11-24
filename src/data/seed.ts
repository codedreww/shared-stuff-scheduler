import { addDays } from "date-fns";

import { toDateKey } from "@/lib/booking";
import type { Booking, Resource, User } from "@/lib/booking";

export const seedResources: Resource[] = [
  {
    id: "vehicle",
    name: "Company Vehicle",
    description: "Company Van, parked in bay 3",
  },
  {
    id: "projector",
    name: "Portable Projector",
    description: "1080p projector with HDMI and USB-C cables, in a carry case.",
  },
  {
    id: "starlink",
    name: "StarLink Mobile Unit",
    description: "Satelite internet kit used for off site work.",
  },
];

export const seedUsers: User[] = [
  { id: "u1", name: "John Doe" },
  { id: "u2", name: "Mary Doe" },
  { id: "u3", name: "Steven Doe" },
];

/**
 * Example bookings, dated relative to `today` so the demo never opens onto
 * an empty grid of past dates. Most sit on tomorrow so they stay bookable-around
 * even when the app is opened late in the day.
 */
export function createSeedBookings(today: Date): Booking[] {
  const day = (offset: number) => toDateKey(addDays(today, offset));

  return [
    // Today
    {
      id: "seed-1",
      resourceId: "vehicle",
      userId: "u1",
      date: day(0),
      startHour: 15,
      endHour: 17,
    },

    // Tomorrow: the vehicle is busy, including two back-to-back bookings (9-11, 11-12).
    {
      id: "seed-2",
      resourceId: "vehicle",
      userId: "u1",
      date: day(1),
      startHour: 9,
      endHour: 11,
    },
    {
      id: "seed-3",
      resourceId: "vehicle",
      userId: "u2",
      date: day(1),
      startHour: 11,
      endHour: 12,
    },
    {
      id: "seed-4",
      resourceId: "vehicle",
      userId: "u3",
      date: day(1),
      startHour: 14,
      endHour: 17,
    },
    {
      id: "seed-5",
      resourceId: "projector",
      userId: "u2",
      date: day(1),
      startHour: 10,
      endHour: 12,
    },
    // The StarLink unit is left completely free tomorrow.

    // The day after
    {
      id: "seed-6",
      resourceId: "projector",
      userId: "u1",
      date: day(2),
      startHour: 13,
      endHour: 15,
    },
    {
      id: "seed-7",
      resourceId: "starlink",
      userId: "u3",
      date: day(2),
      startHour: 9,
      endHour: 17,
    },
  ];
}
