import { useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toDateKey } from "@/lib/booking";

type DateControlsProps = {
  /** "YYYY-MM-DD" */
  date: string;
  onChange: (date: string) => void;
};

/** Previous day, next day, a calendar to jump further, and a shortcut back to today. */
export function DateControls({ date, onChange }: DateControlsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  // Read the clock once, when the controls are first shown.
  const [now] = useState(() => new Date());

  const today = toDateKey(now);
  const selected = parseISO(date); // "2026-11-24" becomes a Date at local midnight
  const isToday = date === today;

  const shift = (days: number) => onChange(toDateKey(addDays(selected, days)));

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous day"
        disabled={isToday} // No booking in the past, so no browsing back past today.
        onClick={() => shift(-1)}
      >
        <ChevronLeftIcon />
      </Button>

      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          render={<Button variant="outline" className="min-w-44 justify-start" />}
        >
          <CalendarIcon />
          {format(selected, "EEE d MMM yyyy")}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            disabled={{ before: now }}
            onSelect={(day) => {
              if (!day) return; // Clicking the selected day again would clear it.
              onChange(toDateKey(day));
              setCalendarOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        aria-label="Next day"
        onClick={() => shift(1)}
      >
        <ChevronRightIcon />
      </Button>

      {!isToday && (
        <Button variant="ghost" onClick={() => onChange(today)}>
          Today
        </Button>
      )}
    </div>
  );
}
