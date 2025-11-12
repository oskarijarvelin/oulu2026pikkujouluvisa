# Firebase Integration - Quick Setup Guide

## What Was Implemented

This implementation adds Firebase Realtime Database integration and a visual admin tool for managing quiz data.

### New Routes

1. **`/admin`** - Main editing interface (localhost only)
2. **`/admin/migrate`** - One-time data migration tool (localhost only)

### Key Features

- ✅ Data stored in Firebase Realtime Database
- ✅ Visual editor with full CRUD operations
- ✅ Floating "Tallenna muutokset" (Save) and "Peruuta" (Cancel) buttons in sticky header
- ✅ Localhost-only restriction for security
- ✅ Fallback to static JSON when Firebase not configured
- ✅ No security vulnerabilities (CodeQL verified)

## Quick Setup

### 1. Configure Firebase

```bash
# Copy the environment template
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Migrate Data (One-Time)

1. Open `http://localhost:3000/admin/migrate`
2. Click "Siirrä Firebaseen" button
3. Wait for success message

### 4. Start Editing

1. Open `http://localhost:3000/admin`
2. Make your changes
3. Click "Tallenna muutokset" to save to Firebase
4. Click "Peruuta" to discard changes and reload from Firebase

## Firebase Database Structure

Path: `/quizzes`

```json
[
  {
    "title": "HTML",
    "icon": "./assets/images/icon-html.svg",
    "bgcolor": "#FFF1E9",
    "options": {
      "timeBasedScoring": true,
      "fullPointsThreshold": 5000,
      "halfPointsThreshold": 10000,
      "icon": "Code2",
      "iconColor": "#E44D26",
      "iconBgColor": "#FFF1E9"
    },
    "questions": [...]
  }
]
```

## Security

- Admin tools only work on `localhost` (auto-redirects otherwise)
- Configure Firebase security rules in Firebase Console
- Never commit `.env.local` to version control
- Static JSON fallback ensures app works without Firebase

## Troubleshooting

**Q: Admin page shows "Ladataan..."**
- Check Firebase credentials in `.env.local`
- Verify Firebase Realtime Database is enabled in Firebase Console

**Q: Changes don't save**
- Check browser console for error messages
- Verify Firebase security rules allow writes
- Ensure you're on localhost

**Q: Main app not loading quizzes**
- If Firebase fails, app automatically falls back to `/data.json`
- Check browser console for error details

## Files Changed

- `lib/firebase.ts` - Added database support
- `lib/firebase-service.ts` - New: Firebase operations
- `store/quiz-store.ts` - Added Firebase fetch with fallback
- `app/admin/page.tsx` - New: Admin editor
- `app/admin/migrate/page.tsx` - New: Migration tool
- `.env.local.example` - New: Configuration template
- `app/admin/README.md` - New: Detailed documentation

## Support

For detailed documentation, see:
- `/app/admin/README.md` - Complete admin tool documentation
- `.env.local.example` - Configuration guide
