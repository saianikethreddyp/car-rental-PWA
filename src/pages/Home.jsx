import { useNavigate } from 'react-router-dom'
import { useTodaySchedule, useDashboardStats, useCars } from '../hooks/useData'
import { Header } from '../components/Header'
import { ScheduleCard, ScheduleCardSkeleton } from '../components/ScheduleCard'
import {
    Calendar,
    Car,
    Users,
    IndianRupee,
    Plus,
    ChevronRight,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    AlertTriangle
} from 'lucide-react'

export default function Home() {
    const navigate = useNavigate()
    const { schedule, pickupCount, returnCount, loading: scheduleLoading, refetch: refetchSchedule } = useTodaySchedule()
    const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats()
    const { cars } = useCars()

    // Check for insurance alerts
    const getInsuranceAlerts = () => {
        const today = new Date()
        let expired = 0
        let expiringSoon = 0

        cars.forEach(car => {
            if (car.insurance_expiry_date) {
                const expiry = new Date(car.insurance_expiry_date)
                const daysUntil = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
                if (daysUntil < 0) expired++
                else if (daysUntil <= 30) expiringSoon++
            }
        })

        return { expired, expiringSoon }
    }

    const alerts = getInsuranceAlerts()

    const handleRefresh = async () => {
        await Promise.all([refetchSchedule(), refetchStats()])
    }

    const quickActions = [
        { icon: Plus, label: 'New\nBooking', path: '/new-booking', color: 'bg-primary-600' },
        { icon: Calendar, label: 'Rentals', path: '/rentals', color: 'bg-blue-600' },
        { icon: Car, label: 'Cars', path: '/cars', color: 'bg-green-600' },
        { icon: Users, label: 'Customers', path: '/customers', color: 'bg-purple-600' },
    ]

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="Dashboard"
                rightAction={
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-full hover:bg-dark-700/50 active:scale-95 transition-all"
                    >
                        <RefreshCw className="w-5 h-5 text-dark-400" />
                    </button>
                }
            />

            <main className="flex-1 overflow-auto px-4 py-4 space-y-5">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                                <Car className="w-4 h-4 text-green-400" />
                            </div>
                            <span className="text-xs text-dark-400">Available</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-100">
                            {statsLoading ? '-' : stats.availableCars}
                        </p>
                    </div>

                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-xs text-dark-400">Active Rentals</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-100">
                            {statsLoading ? '-' : stats.activeRentals}
                        </p>
                    </div>

                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-600/20 flex items-center justify-center">
                                <IndianRupee className="w-4 h-4 text-primary-400" />
                            </div>
                            <span className="text-xs text-dark-400">This Month</span>
                        </div>
                        <p className="text-2xl font-bold text-primary-400">
                            {statsLoading ? '-' : `₹${stats.monthlyRevenue.toLocaleString()}`}
                        </p>
                    </div>

                    <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="text-xs text-dark-400">Customers</span>
                        </div>
                        <p className="text-2xl font-bold text-dark-100">
                            {statsLoading ? '-' : stats.totalCustomers}
                        </p>
                    </div>
                </div>

                {/* Insurance Alerts */}
                {(alerts.expired > 0 || alerts.expiringSoon > 0) && (
                    <button
                        onClick={() => navigate('/insurance')}
                        className="w-full card p-4 bg-yellow-500/10 border-yellow-500/30 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="font-medium text-yellow-400">Insurance Alerts</p>
                            <p className="text-sm text-dark-400">
                                {alerts.expired > 0 && `${alerts.expired} expired`}
                                {alerts.expired > 0 && alerts.expiringSoon > 0 && ', '}
                                {alerts.expiringSoon > 0 && `${alerts.expiringSoon} expiring soon`}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-dark-400" />
                    </button>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="text-sm font-medium text-dark-400 mb-3">Quick Actions</h2>
                    <div className="grid grid-cols-4 gap-3">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <button
                                    key={action.path}
                                    onClick={() => navigate(action.path)}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-lg active:scale-95 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-xs text-dark-300 text-center whitespace-pre-line leading-tight">
                                        {action.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Today's Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate('/rentals')}
                        className="card p-4 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-dark-100">{pickupCount}</p>
                            <p className="text-xs text-dark-400">Pickups Today</p>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/rentals')}
                        className="card p-4 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-left">
                            <p className="text-2xl font-bold text-dark-100">{returnCount}</p>
                            <p className="text-xs text-dark-400">Returns Today</p>
                        </div>
                    </button>
                </div>

                {/* Today's Schedule Preview */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-dark-400">Today's Schedule</h2>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="text-sm text-primary-400 flex items-center gap-1"
                        >
                            View all
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {scheduleLoading ? (
                        <div className="space-y-3">
                            <ScheduleCardSkeleton />
                            <ScheduleCardSkeleton />
                        </div>
                    ) : schedule.length === 0 ? (
                        <div className="card p-6 text-center">
                            <Calendar className="w-12 h-12 text-dark-600 mx-auto mb-2" />
                            <p className="text-dark-400">No pickups or returns today</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedule.slice(0, 3).map((item, index) => (
                                <ScheduleCard key={`${item.id}-${index}`} item={item} />
                            ))}
                            {schedule.length > 3 && (
                                <button
                                    onClick={() => navigate('/schedule')}
                                    className="w-full py-2 text-sm text-primary-400 text-center"
                                >
                                    +{schedule.length - 3} more items
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
