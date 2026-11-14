# EventMate 🎟️✨

> **Thoughtful local plans, right when you need one.**  
> EventMate is a full-stack event discovery, reservation, and social planning platform built with **React Native / Expo** on the mobile frontend and **Node.js / Express / PostgreSQL** on the backend.

---

## 📱 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Backend Setup](#-backend-setup)
- [Mobile Setup](#-mobile-setup)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [Troubleshooting & Tips](#-troubleshooting--tips)

---

## 🌟 Overview

EventMate helps people discover curated local experiences—from rooftop socials and intimate jazz nights to hands-on pottery workshops and sunrise park yoga.

The repository is structured into two main workspaces:
1. `backend/`: RESTful API powered by Node.js, Express, PostgreSQL, JWT authentication (Access & Refresh tokens), and Google OAuth ID token verification.
2. `mobile/`: Cross-platform mobile app built with Expo (v55), React Native, and React Navigation, supporting iOS, Android, and Web.

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    subgraph Mobile ["Mobile App (Expo / React Native)"]
        UI["Screens & UI Components\n(Home, Explore, Details, Bookings, Profile)"]
        Services["Services & API Client\n(Auth, Events, Bookings, Profile)"]
        Storage["Local Storage\n(SecureStore / LocalStorage)"]
        UI --> Services
        Services --> Storage
    end

    subgraph Backend ["Backend API (Node.js & Express)"]
        Routes["Express Routes & Middleware\n(Auth, Profile, Events, Bookings)"]
        Controllers["Controllers & Error Mapping"]
        ServicesBackend["Business Logic Services"]
        Repos["Database Repositories"]
        Routes --> Controllers --> ServicesBackend --> Repos
    end

    subgraph Database ["PostgreSQL Database"]
        DB[("Tables:\nusers\nrefresh_tokens\nevents\nbookings")]
    end

    Services -->|HTTP / REST (Bearer JWT)| Routes
    Repos -->|pg Pool Query| DB
```

---

## 🚀 Key Features

### 🔐 Authentication & Account Management
- **Email & Password Authentication**: Secure sign up with bcrypt hashing (12 rounds) and JWT session tokens.
- **Session Refresh**: Silent token restoration using persistent refresh tokens (`/api/auth/refresh`).
- **Google OAuth Integration**: Native Google Sign-In using ID tokens (`expo-auth-session`) and server-side audience validation via `google-auth-library`.
- **Google Account Linking**: Ability to link an existing email account with Google from the profile screen.
- **Profile Editing**: Real-time display name editing with backend persistence (`PATCH /api/profile`).

### 🧭 Event Discovery & Search
- **Live Event Catalog**: Real-time feed of upcoming events sorted by chronological date.
- **Vibe & Category Filtering**: Quick filter chips across categories: *Social*, *Workshop*, *Music*, *Wellness*, *Culture*, and *All*.
- **Live Search**: Instant keyword search matching event title, location, or description.
- **Capacity & Spot Tracking**: Dynamic calculation of remaining spots with warnings (e.g., *"⚡ Only 3 spots left"* or *"Sold out"*).
- **Graceful Offline Mode**: Packaged fallback events keep the app responsive during offline testing or server cold starts.

### 🎟️ Bookings & Calendar
- **Instant RSVP / Booking**: 1-tap event reservation with capacity check and duplicate booking prevention.
- **Reservation Cancellation**: Self-service booking cancellation from both the event details page and the dedicated "My Bookings" schedule.
- **Booking Status Indication**: Visual *"Booked ✓"* badge displayed throughout the app on reserved events.
- **Calendar Summary Stats**: Quick count of active reservations and upcoming plans.

### 🏠 Personalized Home Dashboard
- **Welcoming Experience**: Hero greeting personalized to the user's name.
- **Active Reservation Spotlight**: Prominently displays the user's next upcoming event with time and venue.
- **Trending & Featured Carousel**: Highlights top picks with category-coded badges.
- **Browse by Vibe**: Direct shortcuts to explore specific event categories.

### 🔖 Bookmarks & Social Sharing
- **Saved Events**: Bookmark events of interest with local storage persistence to review anytime.
- **Native Social Share**: One-click sharing via the platform's native share sheet.

---

## 📁 Project Structure

```text
EventMate/
├── README.md                      # Complete project documentation
├── backend/                       # Node.js + Express API server
│   ├── .env                       # Environment configuration
│   ├── .env.example               # Template environment configuration
│   ├── package.json               # Backend dependencies & scripts
│   ├── server.js                  # Express application entrypoint
│   ├── database/
│   │   ├── schema.sql             # PostgreSQL schema definition
│   │   ├── seed.sql               # Development sample events
│   │   └── migrations/
│   │       └── 20260917_add_google_identity.sql
│   └── src/
│       ├── config/database.js     # PostgreSQL connection pool
│       ├── controllers/           # Request handlers (auth, events, bookings, profile)
│       ├── middleware/            # JWT authentication middleware
│       ├── repositories/          # Direct database queries & CRUD
│       ├── routes/                # Express router endpoints
│       ├── services/              # Domain logic & validation
│       └── utils/                 # Token generation and API error formatting
│
└── mobile/                        # Expo / React Native client
    ├── App.js                     # Root React Native application
    ├── app.json                   # Expo application configuration
    ├── package.json               # Mobile dependencies & scripts
    ├── assets/                    # App icons, splash screens, favicon
    └── src/
        ├── components/            # Reusable UI components (EventCard, GoogleLoginButton)
        ├── config/                # Google OAuth client ID configuration
        ├── context/               # AuthContext (state, login, register, profile)
        ├── data/                  # Offline fallback event catalog
        ├── navigation/            # AppNavigator (Tabs + Stack navigation)
        ├── screens/               # Screen views (Home, Events, Details, Bookings, Profile, Auth)
        ├── services/              # HTTP clients (api, auth, events, bookings, profile)
        ├── storage/               # Auth token and bookmark storage helpers
        └── theme/                 # Design system color palette
```

---

## ⚙️ Prerequisites

- **Node.js**: `v18.x` or higher (`v20+` recommended)
- **npm** or **yarn**
- **PostgreSQL**: `v14+` running locally or via a cloud instance (e.g. Supabase, Neon, Railway)
- **Expo Go App** (optional, for physical iOS / Android testing) or an Android / iOS simulator

---

## 🛠️ Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` inside `backend/` and verify the values:
```bash
cp .env.example .env
```
Ensure your database credentials match your PostgreSQL instance:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventmate
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
GOOGLE_OAUTH_CLIENT_IDS=your-web-client-id.apps.googleusercontent.com,your-android-client-id.apps.googleusercontent.com
```

### 3. Initialize the Database

#### Option A: One-Command Automated Setup (Recommended)
This runs through Node.js and avoids Windows PATH conflicts:
```bash
npm run db:init
```
*(This automatically creates the `eventmate` database if missing, and executes `schema.sql`, `migrations`, and `seed.sql`.)*

#### Option B: Manual PostgreSQL CLI Commands
```bash
# If PostgreSQL is not in your PATH or conflicts with Oracle, use the full path:
& "C:\Program Files\PostgreSQL\18\bin\createdb.exe" -U postgres eventmate

# Run schema, migration, and seed
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d eventmate -f database/schema.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d eventmate -f database/migrations/20260917_add_google_identity.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d eventmate -f database/seed.sql
```

### 4. Start the API Server
```bash
# Production mode
npm start

# Development mode (auto-reload with Node --watch)
npm run dev

# Syntax / integrity check
npm test
```
The API will be available at: `http://localhost:5000`  
Verify connection at: `http://localhost:5000/db-test`

---

## 📱 Mobile Setup

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure API Endpoint (Optional)
By default, `mobile/src/services/api.js` points to:
- `http://localhost:5000/api` for Web & iOS Simulator
- `http://10.0.2.2:5000/api` for Android Emulator

To connect from a physical phone on the same Wi-Fi, create a `.env` file in `mobile/`:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:5000/api
```

### 3. Start the Expo Development Server
```bash
# Start Metro bundler
npm start

# Or run directly on Web
npm run web

# Or run on Android emulator
npm run android

# Or run on iOS simulator (macOS required)
npm run ios
```

---

## 🔌 API Reference

### Health & Diagnostic
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API status check | No |
| `GET` | `/db-test` | PostgreSQL connection test | No |

---

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with name, email, password | No |
| `POST` | `/api/auth/login` | Sign in with email and password | No |
| `POST` | `/api/auth/google` | Sign in / register using a Google ID token | No |
| `POST` | `/api/auth/google/link` | Link Google identity to current account | Yes |
| `POST` | `/api/auth/refresh` | Refresh expired access token | No |
| `POST` | `/api/auth/logout` | Revoke active refresh token | No |

#### Example: Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

---

### User Profile (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/profile` | Retrieve authenticated user profile | Yes |
| `PATCH` | `/api/profile` | Update profile details (e.g. `name`) | Yes |

#### Example: Update Display Name
```http
PATCH /api/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Jane D."
}
```

---

### Events (`/api/events`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/events` | List upcoming events (filters: `?category=...&search=...`) | No |
| `GET` | `/api/events/:id` | Get details and capacity for a specific event | No |
| `POST` | `/api/events` | Create a new event | Yes |
| `DELETE` | `/api/events/:id` | Remove an event | Yes |

#### Query Parameters for `GET /api/events`:
- `category`: Filter by category (e.g. `Social`, `Workshop`, `Music`, `Wellness`, `Culture`).
- `search`: Case-insensitive search on title, description, or location.

---

### Bookings (`/api/bookings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/bookings` | List all bookings for the authenticated user | Yes |
| `POST` | `/api/bookings` | Book / RSVP for an event (`{ "eventId": 1 }`) | Yes |
| `GET` | `/api/bookings/check/:eventId`| Check if the current user booked this event | Yes |
| `DELETE` | `/api/bookings/:id` | Cancel a booking by booking ID | Yes |
| `DELETE` | `/api/bookings/event/:eventId`| Cancel a booking by event ID | Yes |

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  provider VARCHAR(30),
  provider_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Persistent Refresh Tokens
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(80) NOT NULL,
  location VARCHAR(200) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INTEGER,
  image_url TEXT
);

-- Bookings (RSVP)
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
```

---

## 🎨 Theme & Colors

EventMate uses a warm, editorial design language:

| Token | Hex Code | Purpose |
|---|---|---|
| `cream` | `#FBF9F4` | App background |
| `navy` | `#16213E` | Hero headers & primary branding |
| `coral` | `#F5654A` | Primary actions & accent |
| `orange` | `#FF9D4D` | Secondary badge & highlights |
| `ink` | `#0E1726` | Body typography |
| `slate` | `#637381` | Secondary descriptions |
| `line` | `#E7E2D6` | Card borders & dividers |
| `white` | `#FFFFFF` | Card surfaces |

---

## 💡 Troubleshooting & Tips

1. **Android Emulator Connection**: Android emulators use `http://10.0.2.2:5000/api` to refer to the host machine's `localhost`.
2. **Physical Device Testing**: Use `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api` so the phone can reach your computer.
3. **Database Connection**: If `/db-test` returns an error, verify that PostgreSQL is running (`pg_isready`) and that `.env` credentials match.
4. **Google Sign-In on Web**: When developing in the browser, ensure your Expo web port (`http://localhost:8081`) is added to authorized JavaScript origins in your Google Cloud Console.

---

Made with ❤️ by the EventMate Team.
