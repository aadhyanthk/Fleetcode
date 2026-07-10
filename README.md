# Fleetcode

Fleetcode is a flashcard-based study tool designed for LeetCode problem solving. It trains pattern recognition rather than syntax recall, helping you identify optimal strategies for algorithmic problems quickly and efficiently.

## Features

- **LeetCode UI Aesthetic**: A clean, premium interface matching LeetCode's design system with both Light and Dark mode options.
- **Preloaded Master Decks**: Study from the most highly recommended curated problem lists:
  - Blind 75
  - NeetCode 150
  - Grind 169
- **Spaced Repetition & Weighted Algorithms**: Fleetcode intelligently tracks your performance on each problem (✅ Got it, 🟡 Partial, ❌ No idea) and probabilistically serves you questions you struggle with more frequently.
- **Custom Strategies**: Write, save, and refer back to your own personal notes and strategies for every individual problem.
- **Master-Detail Viewing Mode**: A beautifully structured split layout that lets you browse deck problems at lightning speed.
- **Firebase Backend**: Full cloud integration storing your custom decks, history, and strategies across sessions using Firebase Auth and Firestore.

## Setup & Local Development

This project uses Vite for its frontend tooling.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root of the project with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Deployment

Fleetcode is configured for deployment on Firebase Hosting.

1. Build the production application:
   ```bash
   npm run build
   ```

2. Deploy using the Firebase CLI:
   ```bash
   npx firebase-tools deploy
   ```

## Architecture

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, Vanilla CSS
- **Backend & Data**: Firebase Firestore (NoSQL Document DB)
- **Auth**: Firebase Authentication (Google Sign-In)
- **Tooling**: Vite
