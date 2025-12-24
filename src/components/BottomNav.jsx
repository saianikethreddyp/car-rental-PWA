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
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowMore(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up overflow-hidden max-w-lg mx-auto pb-safe-pb">
                        <div className="p-4 pt-6">
                            <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-xl font-bold">More Options</h3>
                                <button
                                    onClick={() => setShowMore(false)}
                                    className="p-2 bg-neutral-100 rounded-full"
                                >
                                    <X className="w-5 h-5 text-neutral-600" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
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
                                              flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all border
                                              ${isActive
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-neutral-50 text-neutral-700 border-transparent hover:bg-neutral-100'
                                                }
                                            `}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Sign Out */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-around max-w-lg mx-auto px-2 relative">
                    {mainNavItems.map((item) => {
                        const Icon = item.icon

                        if (item.isMenu) {
                            const active = isMoreActive || showMore
                            return (
                                <button
                                    key="more"
                                    onClick={handleMoreClick}
                                    className="bottom-nav-item flex-1 group"
                                >
                                    <div className={`
                                        p-1.5 rounded-full transition-all duration-200
                                        ${active ? 'text-black' : 'text-neutral-400 group-hover:text-neutral-600'}
                                    `}>
                                        <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-[10px] font-medium transition-colors ${active ? 'text-black' : 'text-neutral-400'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            )
                        }

                        if (item.isAction) {
                            return (
                                <div key={item.path} className="flex-1 flex justify-center -mt-6">
                                    <NavLink
                                        to={item.path}
                                        onClick={() => setShowMore(false)}
                                        className="flex items-center justify-center shadow-lg shadow-black/20 rounded-full bg-black text-white w-14 h-14 active:scale-95 transition-transform"
                                    >
                                        <Icon className="w-7 h-7" strokeWidth={2.5} />
                                    </NavLink>
                                </div>
                            )
                        }

                        const isActive = location.pathname === item.path

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setShowMore(false)}
                                className="bottom-nav-item flex-1 group"
                            >
                                <div className={`
                                    p-1.5 rounded-full transition-all duration-200
                                    ${isActive ? 'text-black' : 'text-neutral-400 group-hover:text-neutral-600'}
                                `}>
                                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-black' : 'text-neutral-400'}`}>
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

