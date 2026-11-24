import { useState } from "react";
import { format, parseISO } from "date-fns";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toDateKey } from "@/lib/booking";
import type { Booking, Resource } from "@/lib/booking";

type MyBookingsProps = {
  bookings: Booking[];
  resources: Resource[];
  userId: string;
  onCancel: (bookingId: string) => void;
};

/** The current user's upcoming bookings, soonest first, each with a cancel button. */
export function MyBookings({
  bookings,
  resources,
  userId,
  onCancel,
}: MyBookingsProps) {
  // Read the clock once, when the list is first shown.
  const [today] = useState(() => toDateKey(new Date()));

  const mine = bookings
    .filter((b) => b.userId === userId && b.date >= today)
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour,
    );

  const resourceName = (id: string) =>
    resources.find((r) => r.id === id)?.name ?? "Unknown resource";

  return (
    <section className="space-y-3">
      <h2 className="text-base font-medium">My bookings</h2>

      {mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You have no upcoming bookings.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {mine.map((booking) => {
            const when = `${format(parseISO(booking.date), "EEE d MMM")}, ${booking.startHour}:00 to ${booking.endHour}:00`;
            const name = resourceName(booking.resourceId);

            return (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-3 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {when}
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="destructive" size="sm" />}
                  >
                    Cancel
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {name}, {when}. The time becomes free for everyone else.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep booking</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => onCancel(booking.id)}
                      >
                        Cancel booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
