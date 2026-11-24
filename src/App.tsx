import { useState } from "react";
import { toast } from "sonner";

import { DateControls } from "@/components/DateControls";
import { DayGrid } from "@/components/DayGrid";
import { MyBookings } from "@/components/MyBookings";
import { ResourceTabs } from "@/components/ResourceTabs";
import { UserPicker } from "@/components/UserPicker";
import { seedResources } from "@/data/seed";
import { toDateKey } from "@/lib/booking";
import type { BookingRequest } from "@/lib/booking";
import { addBooking, cancelBooking, loadState } from "@/lib/store";

function App() {
  const [state, setState] = useState(loadState); // users + bookings
  const [userId, setUserId] = useState(state.users[0].id); // "Booking as"
  const [resourceId, setResourceId] = useState(seedResources[0].id);
  const [date, setDate] = useState(() => toDateKey(new Date()));

  function handleBook(request: BookingRequest) {
    const result = addBooking(request);
    setState(result.state);
    if (result.ok) toast.success("Booked");
    else toast.error(result.reason);
  }

  function handleCancel(bookingId: string) {
    const result = cancelBooking(bookingId, userId);
    setState(result.state);
    if (result.ok) toast.success("Booking cancelled");
    else toast.error(result.reason);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Shared Stuff Scheduler</h1>
        <UserPicker users={state.users} userId={userId} onChange={setUserId} />
      </header>

      <ResourceTabs
        resources={seedResources}
        resourceId={resourceId}
        onChange={setResourceId}
      />

      <DateControls date={date} onChange={setDate} />

      {/* The key resets the selection whenever the resource or date changes. */}
      <DayGrid
        key={`${resourceId}-${date}`}
        bookings={state.bookings}
        users={state.users}
        resourceId={resourceId}
        date={date}
        userId={userId}
        onBook={handleBook}
      />

      <MyBookings
        bookings={state.bookings}
        resources={seedResources}
        userId={userId}
        onCancel={handleCancel}
      />
    </main>
  );
}

export default App;
