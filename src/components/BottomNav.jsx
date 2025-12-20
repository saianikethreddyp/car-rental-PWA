import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Home,
    Calendar,
    Plus,
    Car,
    Menu,
    X,
    Users,
    Shield,
    CreditCard,
    Settings,
    LogOut
} from 'lucide-react'

const mainNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/rentals', icon: Calendar, label: 'Rentals' },
    { path: '/new-booking', icon: Plus, label: 'Book', isAction: true },
    { path: '/cars', icon: Car, label: 'Cars' },
    { path: '/more', icon: Menu, label: 'More', isMenu: true },
]

const moreMenuItems = [
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/insurance', icon: Shield, label: 'Insurance' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
    const location = useLocation()
    const navigate = useNavigate()
    const { signOut } = useAuth()
    const [showMore, setShowMore] = useState(false)

    const handleMoreClick = () => {
        setShowMore(!showMore)
    }

    const handleSignOut = async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await signOut()
            setShowMore(false)
        }
    }

    const isMoreActive = moreMenuItems.some(item => location.pathname === item.path) || location.pathname === '/profile'

    return (
        <>
            {/* More Menu Overlay */}
            {showMore && (
                <div className="fixed inset-0 z-40">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowMore(false)}
                    />
                    <div className="absolute bottom-16 right-4 left-4 max-w-sm ml-auto bg-dark-800 rounded-2xl border border-dark-700/50 shadow-xl animate-fade-in overflow-hidden">
                        <div className="p-2">
                            {moreMenuItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.path
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path)
                                            setShowMore(false)
                                        }}
                                        className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${isActive
                                                ? 'bg-primary-600/20 text-primary-400'
                                                : 'text-dark-300 hover:bg-dark-700/50'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                )
                            })}

                            {/* Divider */}
                            <div className="h-px bg-dark-700/50 my-2" />

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/10 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <div className="flex items-center justify-around max-w-lg mx-auto">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon

                        if (item.isMenu) {
                            return (
                                <button
                                    key="more"
                                    onClick={handleMoreClick}
                                    className={`bottom-nav-item ${isMoreActive || showMore ? 'active' : ''}`}
                                >
                                    {showMore ? (
                                        <X className="w-5 h-5 text-primary-400" />
                                    ) : (
                                        <Icon className={`w-5 h-5 ${isMoreActive ? 'text-primary-400' : ''}`} />
                                    )}
                                    <span className={`text-xs ${isMoreActive || showMore ? 'text-primary-400 font-medium' : ''}`}>
                                        {item.label}
                                    </span>
                                </button>
                            )
                        }

                        if (item.isAction) {
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="flex items-center justify-center -mt-6"
                                    onClick={() => setShowMore(false)}
                                >
                                    <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 active:scale-95 transition-transform">
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </NavLink>
                            )
                        }

                        const isActive = location.pathname === item.path

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setShowMore(false)}
                                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                                <span className={`text-xs ${isActive ? 'text-primary-400 font-medium' : ''}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
