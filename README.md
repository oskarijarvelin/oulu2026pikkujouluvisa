# Oulu2026 Pikkujouluvisa

A modern, interactive quiz application built with Next.js 14, TypeScript, and Firebase. Features time-based scoring, multi-select questions, and real-time leaderboard tracking.

## 🎯 Project Overview

This is a Christmas quiz application (Pikkujouluvisa) created for Oulu2026. The app provides an engaging quiz experience with:

- **Multiple Quiz Support**: Support for various quiz topics with customizable themes
- **Time-based Scoring**: Dynamic point calculation based on answer speed
- **Multi-select Questions**: Support for both single and multiple correct answers
- **Firebase Integration**: Real-time data storage and leaderboard
- **Admin Interface**: Easy-to-use admin panel for managing quiz content
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.x or higher)
- **npm** (comes with Node.js)
- **Git** for version control
- **Firebase Account** (free tier is sufficient)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/oskarijarvelin/oulu2026pikkujouluvisa.git
cd oulu2026pikkujouluvisa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

#### Enable Required Services

1. **Realtime Database**:
   - Navigate to **Build** → **Realtime Database**
   - Click **Create Database**
   - Choose your location
   - Start in **test mode** (we'll configure security rules next)

2. **Authentication**:
   - Navigate to **Build** → **Authentication**
   - Click **Get Started**
   - Go to **Sign-in method** tab
   - Enable **Anonymous** authentication

#### Configure Security Rules

1. Go to **Realtime Database** → **Rules**
2. Replace the default rules with:

```json
{
  "rules": {
    "quizzes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "leaderboard": {
      ".read": "auth != null",
      "$playerKey": {
        ".write": "auth != null"
      }
    }
  }
}
```

3. Click **Publish**

For more details, see [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md)

#### Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration values

### 4. Environment Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**⚠️ Important**: Never commit `.env.local` to version control!

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Migrate Initial Data (One-Time Setup)

1. Navigate to [http://localhost:3000/admin/migrate](http://localhost:3000/admin/migrate)
2. Click **"Siirrä Firebaseen"** (Migrate to Firebase) button
3. Wait for the success message
4. Your quiz data is now in Firebase!

## 🏗️ Project Structure

```
oulu2026pikkujouluvisa/
├── app/                          # Next.js 14 App Router
│   ├── (root)/                  # Main quiz interface
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── admin/                   # Admin panel (localhost only)
│   │   ├── page.tsx             # Quiz editor
│   │   └── migrate/             # Data migration tool
│   ├── qr/                      # QR code page
│   ├── tulokset/                # Results/leaderboard page
│   ├── layout.tsx               # Global layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── atoms/                   # Basic UI components
│   │   ├── answer.tsx           # Single answer option
│   │   ├── current-question.tsx # Question counter
│   │   ├── progress.tsx         # Progress indicator
│   │   ├── score.tsx            # Score display
│   │   ├── subjects.tsx         # Quiz selection grid
│   │   └── ...
│   ├── molecules/               # Composite components
│   │   ├── answers.tsx          # Answer selection logic
│   │   ├── game.tsx             # Main quiz game
│   │   └── header.tsx           # App header
│   ├── animated/                # Framer Motion wrappers
│   └── providers/               # Context providers
├── lib/                         # Core utilities
│   ├── firebase.ts              # Firebase initialization
│   ├── firebase-service.ts      # Firebase CRUD operations
│   ├── types.ts                 # TypeScript interfaces
│   └── utils.ts                 # Helper functions
├── store/                       # Zustand state management
│   ├── quiz-store.ts            # Quiz state and logic
│   └── theme-store.ts           # Theme state
├── public/                      # Static assets
│   └── data.json                # Fallback quiz data
├── .env.local.example           # Environment template
├── FIREBASE_SETUP.md            # Firebase setup guide
├── FIREBASE_SECURITY_RULES.md   # Security documentation
└── README.md                    # This file
```

## 🛠️ Development Workflow

### Available Scripts

- **`npm run dev`** - Start development server (http://localhost:3000)
- **`npm run build`** - Create production build
- **`npm run start`** - Start production server
- **`npm run lint`** - Run ESLint for code quality

### Making Changes to Quiz Content

#### Using the Admin Panel (Recommended)

1. Start the dev server: `npm run dev`
2. Navigate to [http://localhost:3000/admin](http://localhost:3000/admin)
3. Make your changes using the visual editor
4. Click **"Tallenna muutokset"** (Save Changes) to update Firebase

**Note**: Admin panel only works on localhost for security

#### Direct Firebase Editing

You can also edit data directly in the Firebase Console:
1. Go to **Realtime Database**
2. Navigate to `/quizzes`
3. Edit the JSON structure

### Quiz Data Structure

```typescript
interface Quizz {
  title: string;
  questions: Question[];
  options?: {
    timeBasedScoring?: boolean;        // Enable time-based scoring
    fullPointsThreshold?: number;       // Time for full points (ms)
    halfPointsThreshold?: number;       // Time for half points (ms)
    iconColor?: string;                 // Icon color
    iconBgColor?: string;               // Icon background
  };
}

interface Question {
  id: number;
  question: string;
  options: string[];                    // Answer choices (2-4)
  answer: string | string[];            // Correct answer(s)
}
```

## 📦 Building for Production

### Create Production Build

```bash
npm run build
```

This will:
- Compile TypeScript
- Optimize React components
- Generate static pages where possible
- Create optimized bundles

### Run Production Build Locally

```bash
npm run start
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env.local`
5. Deploy!

Vercel automatically:
- Detects Next.js
- Configures build settings
- Sets up continuous deployment

### Environment Variables in Production

Make sure to add all `NEXT_PUBLIC_FIREBASE_*` variables in your deployment platform's environment settings.

## 🎨 Customization

### Theming

The app uses Tailwind CSS with custom colors defined in `tailwind.config.ts`:
- `yotaivas` (night sky blue)
- `perameri` (deep sea blue)
- `metsa` (forest green)
- `puolukka` (lingonberry red)
- `valkoinen` (white)
- `harmaa` (gray)

### Scoring Configuration

Time-based scoring can be configured per quiz in the `options` field:

```typescript
{
  timeBasedScoring: true,      // Enable/disable
  fullPointsThreshold: 5000,    // 5 seconds for full points
  halfPointsThreshold: 10000    // 10 seconds for half points
}
```

Points are calculated:
- **≤5s**: 1.0 point (full)
- **5-10s**: 0.9-0.6 points (linear decrease)
- **≥10s**: 0.5 points (half)

## 🔍 Troubleshooting

### Firebase Connection Issues

**Problem**: "Permission denied" errors
- **Solution**: Ensure Anonymous Authentication is enabled
- Verify security rules are published correctly
- Check browser console for auth errors

**Problem**: Data not loading
- **Solution**: Check Firebase credentials in `.env.local`
- Verify Realtime Database is enabled
- App falls back to `/data.json` if Firebase fails

### Admin Panel Issues

**Problem**: Admin page redirects or doesn't work
- **Solution**: Admin panel only works on `localhost`
- Access it via `http://localhost:3000/admin` (not 127.0.0.1)

**Problem**: Changes don't save
- **Solution**: Check browser console for errors
- Verify Firebase write permissions
- Ensure you're authenticated (happens automatically)

### Build Issues

**Problem**: TypeScript errors
- **Solution**: Run `npm install` to ensure all dependencies are installed
- Check for syntax errors in modified files

**Problem**: ESLint warnings
- **Solution**: Run `npm run lint` to see all issues
- Most can be auto-fixed with proper IDE setup

## 🔐 Security Considerations

- ✅ Anonymous authentication required for all Firebase operations
- ✅ Admin panel restricted to localhost only
- ✅ Environment variables never committed to git
- ✅ Firebase security rules enforce authentication
- ✅ No sensitive data exposed in client code

For detailed security information, see [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md)

## 🎯 Features in Detail

### Time-based Scoring
Questions can be configured with time-based scoring that rewards faster answers with more points.

### Multi-select Questions
Support for questions with multiple correct answers. Users must select all correct options.

### Persistent Question Order
Question order is randomized once per user and persisted to localStorage for consistency.

### Leaderboard
Real-time leaderboard showing top scores, stored in Firebase.

### Theme Switching
Dark mode support with persistent theme preference.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## 📧 Support

For detailed Firebase setup, see:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete Firebase integration guide
- [FIREBASE_SECURITY_RULES.md](./FIREBASE_SECURITY_RULES.md) - Security configuration

---

Built with ❤️ using Next.js, TypeScript, and Firebase
