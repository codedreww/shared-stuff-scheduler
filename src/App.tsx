import { useState } from "react";
import { toast } from "sonner";

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
    <main className="mx-auto max-w-3xl p-6">
      {/* UserPicker: state.users, userId, setUserId */}
      {/* ResourceTabs: seedResources, resourceId, setResourceId */}
      {/* Date picker: date, setDate */}
      {/* DayGrid: state.bookings, resourceId, date, userId, handleBook */}
      {/* MyBookings: state.bookings filtered by userId, handleCancel */}
    </main>
  );
}

export default App;
