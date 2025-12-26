# Dhanya Car Rentals - Worker PWA

A Progressive Web App (PWA) for field workers to manage car rentals on-the-go.

![PWA](https://img.shields.io/badge/PWA-Installable-green) ![React](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple)

## 🚀 Features

- **Installable PWA** - Works like a native app
- **Offline Support** - Basic functionality without internet
- **Quick Actions** - Fast access to common tasks
- **Mobile-First Design** - Optimized for phones
- **WhatsApp Support** - Quick contact support

### Core Features
- View and manage rentals
- Update rental status
- View fleet availability
- Customer information access
- Today's schedule overview

## 📋 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **PWA:** Vite PWA Plugin
- **Authentication:** Supabase Auth
- **API Client:** Axios
- **Deployment:** Vercel

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Backend API running
- Supabase project configured

### 1. Clone the Repository

```bash
git clone https://github.com/saianikethreddyp/car-rental-PWA.git
cd car-rental-PWA
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://backend-car-rental-production-a9db.up.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:5174` in your browser.

### 5. Build for Production

```bash
npm run build
```

## 📱 Installing the PWA

### On Mobile (Android/iOS)

1. Open the app URL in Chrome/Safari
2. Tap "Add to Home Screen" or install prompt
3. App will appear on your home screen

### On Desktop

1. Open the app URL in Chrome
2. Click install icon in address bar
3. App will open in its own window

## 🚀 Deployment (Vercel)

```bash
vercel
```

Set environment variables in Vercel dashboard.

## 📞 Support

WhatsApp support button available in the app.

## 📄 License

Proprietary - Dhanya Car Rentals
