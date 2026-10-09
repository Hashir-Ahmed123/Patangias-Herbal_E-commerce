# Patangia's Herbal Shampoo

A React storefront for browsing herbal shampoo products, managing a cart, and placing orders. Firebase Authentication and Cloud Firestore provide Google sign-in, customer accounts, order storage, product reviews, and store settings.

## Features

- Product storefront, shopping cart, bundle pricing, and checkout
- Guest checkout and optional Google sign-in
- Firebase-backed orders, customer accounts, and product reviews
- Admin dashboard for order management and store contact/payment settings
- Order confirmation and WhatsApp follow-up

## Requirements

- Node.js and npm
- A Firebase project with a web app and Cloud Firestore database

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file by copying `.env.example` to `.env.local`. In PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Replace the example values in `.env.local` with the Firebase web app configuration for your own project.
4. Start the development server:

   ```sh
   npm run dev
   ```

The app is served at `http://localhost:3000`.

## Firebase configuration

The Vite app reads these values from `.env.local`:

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase web app ID |
| `VITE_FIREBASE_DATABASE_ID` | Firestore database ID; use `(default)` for the default database |

To enable sign-in and Firestore features:

1. Enable Google as a sign-in provider in Firebase Authentication.
2. Create a Cloud Firestore database.
3. Review and deploy `firestore.rules` to your Firebase project.
4. Configure at least one admin using either an `admins/{uid}` document, where `{uid}` is the administrator's Firebase Authentication UID, or a trusted `admin: true` Firebase custom claim. Only a trusted project owner/server should grant admin access.
5. Sign in as an admin and configure the store's WhatsApp and JazzCash numbers in the admin dashboard. JazzCash checkout is unavailable until a number is configured.

### Security warning

The checked-in `firestore.rules` currently allows anyone to read/list orders and delete orders. It also allows guest order creation. **Do not deploy these rules or use them with real customer data until the public order read and delete permissions have been reviewed and restricted for your use case.** Making the rules file private would not secure a deployed database.

Firebase web app configuration (including the API key) is included in client-side code at runtime and is not a server-side secret. Restrict the API key to the APIs and websites you need. Never put Firebase Admin SDK credentials, service account keys, or other server secrets in this app or in `VITE_*` variables. Keep `.env.local` out of version control.

## Useful commands

```sh
npm run dev     # Start the local development server
npm run lint    # Type-check the TypeScript project
npm run build   # Create a production build in dist/
npm run preview # Preview the production build locally
```

## Project structure

- `src/pages/` — storefront, checkout, account, and admin pages
- `src/components/` — shared UI such as the navigation bar and footer
- `src/context/` — authentication, cart, navigation, and store settings state
- `src/lib/` — Firebase initialization and shared utilities
- `firestore.rules` — Cloud Firestore authorization and validation rules
- `.env.example` — template for local Firebase configuration
