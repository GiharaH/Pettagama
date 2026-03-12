# Pettagama

**Your wardrobe. Your weather. Your story.**

Pettagama is an AI-ready outfit suggestion app: mobile-first web, weather-aware, and grounded in your real wardrobe. Suggestions are built from clothes you own — no shopping links, no ads.

## Features

- **Onboarding** — Optional body shape, style preference (casual/formal/mixed), and location for weather
- **Wardrobe catalogue** — Add items with photo, category, colour group, and season
- **Weather integration** — OpenWeatherMap (optional); temperature bands drive layer suggestions
- **3 outfit suggestions** — Top + bottom + optional outerwear, footwear, and accessories
- **Occasions** — Casual (default), office, party, wedding, cultural, travel, and more
- **Favourites** — Save suggested outfits for later

## Run locally

```bash
cd pettagama
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Weather API (optional)

For real weather data, create a free [OpenWeatherMap](https://openweathermap.org/api) API key and add:

```bash
# .env (create from .env.example)
VITE_OPENWEATHER_API_KEY=your_key_here
```

Without it, the app shows demo weather and still suggests outfits from your wardrobe.

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- **React Router** for navigation
- **localStorage** for wardrobe and profile (no backend required for MVP)
- PRD design system: IM Fell English, Lato, cream/brown/teal palette

## PRD

See the Product Requirements Document for vision, user flows, feature priorities, and open questions.
