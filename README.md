# AquaPulse — Smart Water Management

A polished React + Tailwind CSS demo for a smart water management dashboard.

## Features

- Live simulated flow rate, tank level, and daily usage counter
- Remote ON/OFF valve with immediate flow feedback
- Low tank and rainwater overflow alert states
- 24-hour / 7-day usage history
- Municipal vs harvested rainwater source toggle
- Auto-prioritize rainwater option
- Rainwater collection, capacity and forecast cards
- Monthly water-saved / estimated ₹ impact
- Responsive desktop-first bento dashboard
- No hardware/backend required — mock simulation updates every 3.5 seconds

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

## Production build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

This is a Vite SPA and works with Vercel's default Vite detection.

```bash
npm install
npm run build
```

Then import the repository/project into Vercel. No environment variables are required for the mock demo.

## Notes

The current implementation intentionally uses simulated state rather than a hardware API. Replace the interval-based state updates in `src/main.jsx` with your IoT/API/WebSocket layer when connecting real sensors and valves.
