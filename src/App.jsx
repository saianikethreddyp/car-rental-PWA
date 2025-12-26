import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { BottomNav } from './components/BottomNav'
import { InstallBanner } from './components/InstallPrompt'
import SupportButton from './components/SupportButton'

// Pages
import Login from './pages/Login'
import Home from './pages/Home'
import Cars from './pages/Cars'
import Schedule from './pages/Schedule'
import NewBooking from './pages/NewBooking'
import AddCar from './pages/AddCar'
import Rentals from './pages/Rentals'
import Customers from './pages/Customers'
import Insurance from './pages/Insurance'
import Payments from './pages/Payments'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

// Protected route wrapper
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
                    <p className="text-dark-400">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

// Main layout with bottom nav and install banner
function AppLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-dark-900">
            <InstallBanner />
            {children}
            <BottomNav />
            <SupportButton />
        </div>
    )
}

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Home />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/cars"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Cars />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/schedule"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Schedule />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/new-booking"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <NewBooking />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/add-car"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <AddCar />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/rentals"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Rentals />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customers"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Customers />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/insurance"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Insurance />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payments"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Payments />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Settings />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Profile />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
