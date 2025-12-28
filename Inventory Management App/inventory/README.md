# Inventory Management (React + Firebase)

## Setup

1. Create a Firebase project and enable:
   - Authentication: Google provider
   - Firestore Database
   - Storage
2. Copy `.env.example` to `.env` and fill values from Firebase project settings.
3. Install and run:
```bash
npm install
npm run dev
```

## Features (implemented baseline)
- Google Sign-In auth
- Route guard
- Firestore schema scaffolding
- Pages: Dashboard, Items, Categories, Suppliers, Transactions, Settings
- CSV utilities (skeleton), image upload (skeleton)

## Firestore Collections
- `items`, `categories`, `suppliers`, `transactions`, `users`, `activityLog`

## Build
```bash
npm run build && npm run preview
```
