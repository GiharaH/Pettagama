# Outfit Designer (Design Room)

Retro Mac–style outfit builder: wardrobe picker, canvas preview, styling feedback, and capsule saves.

## Embedded in Pettagama

This folder holds **source only**. The app is bundled with Pettagama:

- Route: **`/design-room`**
- Entry: `src/pages/DesignRoom.tsx` → imports `@outfit-designer/App`
- Wardrobe data comes from **`getWardrobe()`** (same items as the Wardrobe tab)
- Capsule outfits persist under **`localStorage` key `pettagama_design_room_capsule`**

From the repo root:

```bash
npm install
npm run dev
```

Open Pettagama, then use the **circular key** floating button (or go to `/design-room`).

## Structure

```
outfit-designer/
├── public/index.html    (reference only — real app uses root index.html)
├── src/
│   ├── components/
│   ├── styles/globals.css
│   ├── App.tsx
│   ├── mapWardrobeItems.ts
│   └── index.tsx
├── package.json
└── README.md
```

Tailwind is configured at the **repo root** (`tailwind.config.js`, `postcss.config.js`) with utilities scoped to `#design-room-root` so the main app styles are not reset.
