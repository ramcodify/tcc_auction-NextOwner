# NEXTowner — Campus Auction Web Platform

A complete campus auction web application for students to buy, sell, and auction textbooks, electronics, furniture, and gear safely and sustainably.

This repository is built following a structured 12-phase development roadmap.

---

## Phase 1 & 2 Completed Status

### Phase 1: Foundation
- Restrained color system: Warm Paper (`#F7F5F0`), Forest Green (`#315B43`), Ink (`#20231F`), Stone (`#E8E5DB`), Muted Olive (`#77776D`).
- Responsive layouts across 360px (mobile), 768px (tablet), 1024px (laptop), and 1440px (desktop).
- Reusable component primitives (Buttons, Inputs, Cards, Badges, Dialogs, Loading states, Page containers).
- Health and database diagnostics (`/api/health`, `/api/health/db`).

### Phase 2: Authentication & Navigation (Active)
- **Single Student Account**: Unified buyer and seller capabilities on one account without separate role selection.
- **Secure Sessions**: Signed JWTs issued in `httpOnly`, `sameSite: 'lax'` cookies with Bearer token header fallback.
- **Password Security**: Passwords hashed using `bcryptjs` (salt factor 10) and hidden by default (`select: false`).
- **Account Lifecycle**: Student registration, login, logout, password recovery, and profile management.
- **Responsive Navigation**:
  - **Desktop / Laptop**: Full top navigation bar with Home, Explore, Sell an item, My activity, AI assistant, Notifications, and Profile.
  - **Mobile**: Compact top header with notifications bell and a fixed bottom navigation bar with an elevated Forest Green action button for quick listing.
- **Route Protection**: Protected routes (`/profile`, `/sell`, `/activity`, `/notifications`) and API middleware rejecting unauthorized access with `HTTP 401`.
- **Session Expiry Handling**: User alerts with instant re-authentication triggers when tokens expire.

---

## Directory Structure

```text
tcc_auction-NextOwner/
├── client/                     # Frontend application (React + Vite)
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Student auth state & cookie sessions
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI library
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Dialog.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingState.jsx
│   │   │   │   ├── PageContainer.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/         # Shell & Navigation components
│   │   │       ├── AppShell.jsx
│   │   │       ├── BottomNav.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── Navbar.jsx
│   │   │       └── SessionExpiredBanner.jsx
│   │   ├── pages/              # Routed views
│   │   │   ├── ActivityPage.jsx
│   │   │   ├── AssistantPage.jsx
│   │   │   ├── BrowsePlaceholderPage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── FoundationShowcasePage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── SellPlaceholderPage.jsx
│   │   │   └── SystemHealthPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose connection & status inspector
│   │   ├── controllers/
│   │   │   └── authController.js # Auth endpoints & logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # JWT verification & cookie helpers
│   │   ├── models/
│   │   │   └── User.js         # Student schema with bcrypt methods
│   │   ├── routes/
│   │   │   ├── authRoutes.js   # /api/auth/*
│   │   │   └── healthRoutes.js # /api/health and /api/health/db
│   │   ├── utils/
│   │   │   └── sendEmail.js    # SMTP / Simulated delivery helper
│   │   └── index.js            # Express entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
├── .env.example                # Root environment template
├── .gitignore
├── package.json                # Root orchestration scripts
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **MongoDB** running locally on `127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Installation
Install all dependencies for both client and server from the root directory:
```bash
npm run install:all
```

### 2. Environment Setup
Review `server/.env` (defaults to local MongoDB):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nextowner
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=nextowner_dev_jwt_secret_token_restrained_2026
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
```

### 3. Running the Backend Server
```bash
npm run server
```
The server will start on `http://localhost:5000`.

### 4. Running the Frontend Client
```bash
npm run client
```
The Vite dev server will start on `http://localhost:5173`.

---

## Authentication Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student account (sets cookie) |
| `POST` | `/api/auth/login` | Public | Log in student account (sets cookie) |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Protected | Get current student session & profile |
| `PUT` | `/api/auth/profile` | Protected | Update student name, campus, studentId, phone, bio |
| `PUT` | `/api/auth/change-password` | Protected | Update password securely |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset token / link |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password using token |
| `POST` | `/api/auth/verify-email/:token` | Public | Verify campus email address |

---

