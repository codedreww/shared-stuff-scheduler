import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { HOURS, bookingAtHour, toDateKey } from "@/lib/booking";
import type { Booking, BookingRequest, User } from "@/lib/booking";
import { cn } from "@/lib/utils";

type DayGridProps = {
  bookings: Booking[];
  users: User[];
  resourceId: string;
  /** "YYYY-MM-DD" */
  date: string;
  userId: string;
  onBook: (request: BookingRequest) => void;
};

/** The hour the user pressed first, and the hour the selection currently reaches. */
type Selection = { anchor: number; end: number };

const formatHour = (hour: number) => `${hour}:00`;

/** One day of one resource, hour by hour. Click or drag free hours to pick a time. */
export function DayGrid({
  bookings,
  users,
  resourceId,
  date,
  userId,
  onBook,
}: DayGridProps) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [dragging, setDragging] = useState(false);

  // A drag can end anywhere on the page, so listen on the window while one is active.
  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging]);

  // Read the clock once, when the grid is first shown.
  const [now] = useState(() => new Date());
  const today = toDateKey(now);

  const isPast = (hour: number) =>
    date < today || (date === today && hour <= now.getHours());

  const isFree = (hour: number) =>
    HOURS.includes(hour) &&
    !isPast(hour) &&
    !bookingAtHour(bookings, resourceId, date, hour);

  /** Walks from the anchor towards the target and stops before the first unavailable hour. */
  function reach(anchor: number, target: number): number {
    const step = target >= anchor ? 1 : -1;
    let end = anchor;
    while (end !== target && isFree(end + step)) end += step;
    return end;
  }

  /**
   * Pressing a free hour starts a selection. If exactly one hour is already
   * selected, pressing another hour stretches the selection to it instead.
   * That makes "tap the start, tap the end" work on a phone, where dragging scrolls.
   */
  function press(hour: number) {
    const oneHourSelected =
      selection !== null && selection.anchor === selection.end;
    if (oneHourSelected && hour !== selection.anchor) {
      setSelection({ anchor: selection.anchor, end: reach(selection.anchor, hour) });
    } else {
      setSelection({ anchor: hour, end: hour });
    }
  }

  function dragOver(hour: number) {
    if (!dragging || !selection) return;
    setSelection({ anchor: selection.anchor, end: reach(selection.anchor, hour) });
  }

  // The stored end hour is exclusive, so it is the last selected row plus one.
  const startHour = selection && Math.min(selection.anchor, selection.end);
  const endHour = selection && Math.max(selection.anchor, selection.end) + 1;
  const isSelected = (hour: number) =>
    startHour !== null && endHour !== null && startHour <= hour && hour < endHour;

  function book() {
    if (startHour === null || endHour === null) return;
    onBook({ resourceId, userId, date, startHour, endHour });
    setSelection(null);
  }

  const nameOf = (booking: Booking) =>
    booking.userId === userId
      ? "You"
      : (users.find((u) => u.id === booking.userId)?.name ?? "Someone");

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-lg border select-none">
        {HOURS.map((hour) => {
          const booking = bookingAtHour(bookings, resourceId, date, hour);
          const mine = booking?.userId === userId;

          return (
            <div
              key={hour}
              className="grid h-10 grid-cols-[4.5rem_1fr] border-b text-sm last:border-b-0"
            >
              <div className="flex items-center border-r px-3 text-muted-foreground tabular-nums">
                {formatHour(hour)}
              </div>

              {booking ? (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3",
                    mine
                      ? "bg-primary/10 font-medium text-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {/* Label only the first hour, so a long booking reads as one block. */}
                  {booking.startHour === hour && (
                    <>
                      <span>{nameOf(booking)}</span>
                      <span className="text-xs tabular-nums opacity-70">
                        {formatHour(booking.startHour)} to {formatHour(booking.endHour)}
                      </span>
                    </>
                  )}
                </div>
              ) : isPast(hour) ? (
                <div className="flex items-center px-3 text-xs text-muted-foreground/60">
                  Past
                </div>
              ) : (
                <button
                  type="button"
                  aria-pressed={isSelected(hour)}
                  aria-label={`${formatHour(hour)}, free`}
                  className={cn(
                    "cursor-pointer px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isSelected(hour)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                  onPointerDown={(e) => {
                    if (e.button !== 0) return;
                    press(hour);
                    // A finger drag scrolls the page, so only a mouse or pen drags.
                    if (e.pointerType !== "touch") setDragging(true);
                  }}
                  onPointerEnter={() => dragOver(hour)}
                  onClick={(e) => {
                    // detail is 0 when the "click" came from Enter or Space.
                    if (e.detail === 0) press(hour);
                  }}
                >
                  {isSelected(hour) && hour === startHour && "Your selection"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-8 items-center justify-between gap-3">
        {startHour !== null && endHour !== null ? (
          <>
            <p className="text-sm tabular-nums">
              {formatHour(startHour)} to {formatHour(endHour)}
              <span className="text-muted-foreground">
                {" "}
                · {endHour - startHour} {endHour - startHour === 1 ? "hour" : "hours"}
              </span>
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelection(null)}>
                Clear
              </Button>
              <Button onClick={book}>Book</Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click or drag over free hours to choose a time.
          </p>
        )}
      </div>
    </section>
  );
}
