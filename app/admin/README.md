# Admin Tool - Visailun Muokkaustyökalu

This directory contains the admin tools for managing quiz data in Firebase Realtime Database.

## Features

### `/admin` - Quiz Editor
A visual editing interface for managing all quizzes, questions, and options.

**Features:**
- Edit quiz properties (title, icon, background color)
- Configure time-based scoring settings
- Add, edit, and delete questions
- Manage question options and correct answers
- Add and delete entire quizzes
- Sticky header with action buttons
- Auto-save to Firebase on "Tallenna muutokset" button click
- Reload from Firebase on "Peruuta" button click

**Access Restriction:**
- Only accessible on localhost (development environment)
- Automatically redirects to home page when accessed from production

### `/admin/migrate` - Data Migration Tool
One-time migration tool to upload initial data from `public/data.json` to Firebase.

**Usage:**
1. Ensure Firebase credentials are set in `.env.local`
2. Navigate to `http://localhost:3000/admin/migrate`
3. Click "Siirrä Firebaseen" to upload data
4. After successful migration, navigate to `/admin` to start editing

## Setup

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Navigate to `http://localhost:3000/admin/migrate` to migrate initial data

5. Start editing at `http://localhost:3000/admin`

## Security

- The admin tools are restricted to localhost only
- Firebase security rules should be configured to restrict write access appropriately
- Never commit `.env.local` file to version control

## Data Structure

The admin tool manages data in the following format:

```typescript
interface Quizz {
  title: string;
  icon: string;
  bgcolor: string;
  options?: {
    timeBasedScoring?: boolean;
    fullPointsThreshold?: number; // in milliseconds
    halfPointsThreshold?: number; // in milliseconds
    icon?: string; // lucide icon name
    iconColor?: string;
    iconBgColor?: string;
  };
  questions: Question[];
}

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
}
```

## Firebase Configuration

The quiz data is stored at the path: `quizzes`

Example Firebase Realtime Database structure:
```json
{
  "quizzes": [
    {
      "title": "HTML",
      "icon": "./assets/images/icon-html.svg",
      "bgcolor": "#FFF1E9",
      "options": { ... },
      "questions": [ ... ]
    }
  ]
}
```
