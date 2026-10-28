# NEXTowner — Campus Auction Web Platform

A complete campus auction web application for students to buy, sell, and auction textbooks, electronics, furniture, and gear safely and sustainably.

This repository is built following a structured 12-phase development roadmap.

---

## Phase 1: Foundation (Current Phase)

Phase 1 establishes the foundational architecture, design system, API health infrastructure, and component library for NEXTowner.

### Technology Stack
- **Frontend**: React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express 4, Mongoose 8
- **Database**: MongoDB (port 27017)
- **Styling**: Tailwind CSS with custom design tokens adhering to the restrained palette

---

## Design System Tokens

NEXTowner uses an intentional, restrained editorial palette without neon colors, glowing borders, or artificial gradients:

| Token Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Warm Paper** | `#F7F5F0` | Application background & clean card contrast |
| **Forest Green** | `#315B43` | Primary action buttons, active tabs, system ok |
| **Ink** | `#20231F` | Primary text typography, high-contrast headings |
| **Stone** | `#E8E5DB` | Surface cards, muted containers, badges |
| **Muted Olive** | `#77776D` | Secondary text, captions, thin dividers |

---

## Directory Structure

```text
tcc_auction-NextOwner/
├── client/                     # Frontend application (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Reusable UI library
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Dialog.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingState.jsx
│   │   │   │   └── PageContainer.jsx
│   │   │   └── layout/         # Shell components
│   │   │       ├── AppShell.jsx
│   │   │       ├── Footer.jsx
│   │   │       └── Navbar.jsx
│   │   ├── pages/              # Routed views
│   │   │   ├── BrowsePlaceholderPage.jsx
│   │   │   ├── FoundationShowcasePage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── NotFoundPage.jsx
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
│   │   ├── routes/
│   │   │   └── healthRoutes.js # /api/health and /api/health/db
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
*(Or install individually: `cd server && npm install` and `cd client && npm install`)*

### 2. Environment Setup
Review `server/.env` (defaults to local MongoDB):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/nextowner
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Running the Backend Server
From the root directory:
```bash
npm run server
```
The server will start on `http://localhost:5000`.

### 4. Running the Frontend Client
In a separate terminal, from the root directory:
```bash
npm run client
```
The Vite dev server will start on `http://localhost:5173`.

---

## Health & Diagnostic Endpoints

The backend provides explicit health and database connection monitoring:

- `GET http://localhost:5000/api/health`
  - Returns service status, node environment, and server uptime.
- `GET http://localhost:5000/api/health/db`
  - Returns HTTP 200 with database name, host, and connection state when connected.
  - Returns HTTP 503 with exact error reason when MongoDB is unreachable.

---

## Responsive Breakpoints
The layout and design system have been calibrated for standard screen widths:
- **Mobile (360px)**: Collapsed mobile navigation drawer, single-column card flows.
- **Tablet (768px)**: 2-column grids, inline navigation, touch target padding.
- **Laptop (1024px)**: Full horizontal desktop menu, status indicators, multi-column cards.
- **Desktop (1440px)**: Constrained `max-w-7xl` centered container with balanced margins.

---

## Roadmap
- [x] **Phase 1**: NEXTowner Foundation & Design System
- [ ] **Phase 2**: Authentication & Student Identity
- [ ] **Phase 3**: Auction Listings & Catalog
- [ ] **Phase 4**: Real-time Bidding & Socket.IO Engine
- [ ] **Phase 5**: Timers, Anti-Sniping & Auction Extensions
- [ ] **Phase 6**: Auction Closure & Reserve Resolution
- [ ] **Phase 7**: Post-Auction Seller Approval & Handover
- [ ] **Phase 8**: Saved Searches & Instant Alerts
- [ ] **Phase 9**: Automatic Proxy Bidding
- [ ] **Phase 10**: Q&A Discussion Threading
- [ ] **Phase 11**: AI Campus Buying Assistant
- [ ] **Phase 12**: Progressive Web App (PWA) & Offline Shell
