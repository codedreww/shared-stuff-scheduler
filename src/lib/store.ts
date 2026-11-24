// Storage layer. The only file that touches localStorage.

import { createSeedBookings, seedUsers } from "@/data/seed";
import { validateBooking } from "@/lib/booking";
import type { Booking, BookingRequest, User } from "@/lib/booking";

/** Everything that can change. Resources are fixed, so they stay in seed.ts. */
export type AppState = { users: User[]; bookings: Booking[] };
export type StoreResult =
  | { ok: true; state: AppState }
  | { ok: false; state: AppState; reason: string };

/** Exported so the UI can listen for changes made in another tab. */
export const STORAGE_KEY = "shared-stuff-scheduler:v1";

/** Used only when localStorage is unavailable (e.g. some private windows). */
let memoryFallback: AppState | null = null;

function createSeedState(): AppState {
  return { users: seedUsers, bookings: createSeedBookings(new Date()) };
}

function read(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryFallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.users) && Array.isArray(parsed?.bookings)) {
      return parsed as AppState;
    }
    return null; // Saved data is damaged: fall back to the seed.
  } catch {
    return memoryFallback;
  }
}

function write(state: AppState): void {
  memoryFallback = state;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is blocked or full. The app keeps working from memoryFallback.
  }
}

/** The saved state. Seeds the example data the first time the app is opened. */
export function loadState(): AppState {
  const saved = read();
  if (saved) return saved;

  const seeded = createSeedState();
  write(seeded);
  return seeded;
}

/** Throws away all changes and restores the example data. */
export function resetState(): AppState {
  const seeded = createSeedState();
  write(seeded);
  return seeded;
}

/** Saves a booking if it passes every rule in booking.ts. */
export function addBooking(request: BookingRequest): StoreResult {
  const state = loadState();

  const check = validateBooking(request, state.bookings, new Date());
  if (!check.ok) return { ok: false, state, reason: check.reason };

  const booking: Booking = { ...request, id: crypto.randomUUID() };
  const next = { ...state, bookings: [...state.bookings, booking] };
  write(next);
  return { ok: true, state: next };
}

/** Removes a booking. Only the person who made it can cancel it. */
export function cancelBooking(bookingId: string, userId: string): StoreResult {
  const state = loadState();

  const booking = state.bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return { ok: false, state, reason: "That booking no longer exists." };
  }
  if (booking.userId !== userId) {
    return {
      ok: false,
      state,
      reason: "You can only cancel your own bookings.",
    };
  }

  const next = {
    ...state,
    bookings: state.bookings.filter((b) => b.id !== bookingId),
  };
  write(next);
  return { ok: true, state: next };
}

/** Adds a person to the user picker. Names must be non-empty and unique. */
export function addUser(name: string): StoreResult & { user?: User } {
  const state = loadState();

  const trimmed = name.trim();
  if (!trimmed) return { ok: false, state, reason: "Enter a name." };

  const taken = state.users.some(
    (u) => u.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (taken) {
    return { ok: false, state, reason: `"${trimmed}" is already in the list.` };
  }

  const user: User = { id: crypto.randomUUID(), name: trimmed };
  const next = { ...state, users: [...state.users, user] };
  write(next);
  return { ok: true, state: next, user };
}
