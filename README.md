# Dhanya Worker PWA

A Progressive Web App for shop workers to manage car rentals on the go.

## 🚀 Features

- **Quick Booking** - Create rentals in a few taps
- **View Cars** - See all vehicles and their status
- **Today's Schedule** - View pickups and returns
- **Update Status** - Change car status (available/rented/maintenance)
- **Offline Support** - Works without internet, syncs when back online
- **Real-time Sync** - Changes reflect instantly across Admin CRM

## 📱 PWA Features

- Installable on mobile devices
- Works offline
- Push notifications (optional)
- Full-screen app experience

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd Dhanya-Worker-PWA
npm install
```

### 2. Configure Environment

Copy the `.env` file from the main Dhanya CRM (same Supabase credentials):

```bash
cp ../.env .env
```

Or create a new `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5174`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📂 Project Structure

```
Dhanya-Worker-PWA/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── BottomNav.jsx   # Bottom navigation
│   │   ├── Header.jsx      # Page header with sync indicator
│   │   ├── CarCard.jsx     # Car display card
│   │   └── ScheduleCard.jsx # Schedule item card
│   ├── context/
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── SyncContext.jsx # Offline sync management
│   ├── hooks/
│   │   └── useData.js      # Data fetching hooks with realtime
│   ├── pages/
│   │   ├── Login.jsx       # Login page
│   │   ├── Home.jsx        # Dashboard
│   │   ├── Cars.jsx        # Car list & status update
│   │   ├── Schedule.jsx    # Today's schedule
│   │   ├── NewBooking.jsx  # Multi-step booking form
│   │   └── Profile.jsx     # User profile & settings
│   ├── utils/
│   │   └── offlineStorage.js # IndexedDB helpers
│   ├── App.jsx             # Main app with routing
│   ├── main.jsx            # Entry point with PWA
│   ├── index.css           # Tailwind CSS
│   └── supabaseClient.js   # Supabase connection
├── index.html
├── vite.config.js          # Vite + PWA config
├── tailwind.config.js
└── package.json
```

## 🔐 Worker Permissions

Workers can:
- ✅ View all cars
- ✅ Update car status
- ✅ Create new bookings
- ✅ View today's schedule
- ✅ Complete pickups/returns

Workers cannot:
- ❌ Delete cars
- ❌ View payments
- ❌ Access settings
- ❌ Export data

## 🔄 Data Sync

The app uses the **same Supabase database** as the Admin CRM:

- Changes made in Worker PWA appear instantly in Admin CRM
- Changes made in Admin CRM appear instantly in Worker PWA
- Offline changes are queued and synced when back online

## 📦 Deployment

Deploy to Vercel:

```bash
npm run build
vercel deploy
```

Or set up automatic deployment from GitHub.

## 🎨 Customization

- Colors: Edit `tailwind.config.js`
- Icons: Uses [Lucide React](https://lucide.dev/)
- Styling: Tailwind CSS classes in components

---

**Built with:** React 19, Vite 7, Supabase, Tailwind CSS, PWA
