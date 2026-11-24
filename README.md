# Shared Stuff Scheduler

A small web app for booking shared company resources — a company vehicle, a portable projector, and a StarLink Mobile Unit — without double-booking.

Live demo: TODO add Vercel link

Built with React, Vite, TypeScript, Tailwind CSS, and shadcn/ui (the Base UI variant), with tests in Vitest. There is no server; data lives in the browser's `localStorage`, and the app is deployed on Vercel as a static site. I developed it with help from T3 Code.

## How to run it

Requires Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL that Vite prints in the terminal.

Other scripts:

- `npm test` — runs the Vitest test suite (`src/lib/booking.test.ts`).
- `npm run build` — type-checks and builds the production bundle.

To reset back to the seeded example data, clear the site's `localStorage` (key `shared-stuff-scheduler:v1`) and refresh the page.

## What it does

- **User picker:** A "Booking as" dropdown lets you switch between three seeded users instead of logging in.
- **Resources:** Tabs switch between the Company Vehicle, Portable Projector, and StarLink Mobile Unit, each with a short description.
- **Date controls:** Move by previous/next day, jump via a calendar, or return to Today. Past dates are disabled.
- **Day grid:** Shows hourly slots from 7:00 to 19:00 for the selected resource and date, displaying who booked each block and styling your own bookings differently. Select free hours by dragging with a mouse, or by clicking a start hour and then an end hour (which also works on a phone), then press **Book**.
- **My bookings:** Lists the selected user's upcoming bookings across all resources, each with a **Cancel** button and confirmation dialog. Cancelling frees the hours for everyone.
- **Seed data:** Starts with example bookings dated relative to today so the grid is never empty.

### How double bookings are prevented

- All booking rules live in `src/lib/booking.ts` as pure functions with no React or storage dependencies. Two bookings overlap when they have the same resource and date and `a.startHour < b.endHour && b.startHour < a.endHour`. End hours are exclusive, so back-to-back bookings (12:00 to 14:00 followed by 14:00 to 15:00) are allowed.
- The grid stops a drag or click selection from crossing an already-booked hour, but that is only a UI convenience. The real check runs in `src/lib/store.ts`: `addBooking` re-reads `localStorage` and re-runs `validateBooking` before writing, so a second open tab with stale state cannot double-book.
- `src/lib/booking.test.ts` has 24 tests covering overlap cases, validation rules, and a check that the seed data has no conflicts.

## Assumptions

- **No authentication:** A user picker is enough to show who booked what for this scope.
- **Single-day whole hours:** Bookings are whole hours between 7:00 and 19:00 on a single date. Multi-day bookings are not supported, which is a real limitation for the company vehicle.
- **No past bookings:** You cannot book a past date or an hour today that has already started.
- **Cancel only:** You can only cancel your own bookings. There is no in-place editing; you cancel and rebook.
- **Uniform rules:** All three resources follow the same hours and booking rules.
- **Per-browser data:** Each browser starts from its own copy of the seed data in `localStorage`. Bookings are not shared between devices, and this setup cannot resolve two people on different machines booking the same slot at the same moment — that requires a server.

## One decision I like

Keeping the booking rules in a small pure module (`src/lib/booking.ts`), separate from both the UI components and `localStorage`.

- The overlap and validation logic is easy to read and test on its own without mounting React or mocking storage.
- The UI cannot bypass the rules because `src/lib/store.ts` calls `validateBooking` on fresh state before every save.
- If this were moved behind an API later, the same rule module could run on the server without changes.

## If I had more time

- **A real database.** I would design a schema and host it on Supabase or Neon, both Postgres services that connect directly to Vercel, so bookings are shared between everyone instead of living in one browser.
- **A server that settles simultaneous requests.** Once the app is live, two people can try to book the same slot at the same moment. A server can decide which request arrived first and reject the other, which browser storage cannot do.
- **A login page.** Real accounts would replace the "Booking as" dropdown.
- **A week view, multi-day bookings and editing.** A week view would show availability across several days at once, multi-day bookings matter most for the vehicle, and editing would replace cancel-and-rebook.
- **A dark theme.** It is the least important item here, but I prefer sites that have one.

## How I used AI tools

I used T3 Code with Claude throughout the project: to read through the brief, talk through stack choices and assumptions, plan the build order, and write much of the code (the booking rules, store, tests, and components), which I read, ran, and adjusted.

Things I changed or questioned along the way:

- My first idea was to store bookings in a local JSON file and deploy on Vercel. Talking it through made it clear those conflict because Vercel's filesystem is read-only, so I switched to browser `localStorage` with no server.
- I rewrote parts of the generated booking code in a plainer style I find easier to read (such as simple loops instead of array one-liners) and replaced the generated example users and resource descriptions with my own.
