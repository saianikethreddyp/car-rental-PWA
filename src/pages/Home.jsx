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
    TrendingUp,
    AlertTriangle
} from 'lucide-react'

export default function Home() {
    const navigate = useNavigate()
    const { schedule, pickupCount, returnCount, loading: scheduleLoading, refetch: refetchSchedule } = useTodaySchedule()
    const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats()
    const { cars } = useCars()

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
        { icon: Plus, label: 'New Booking', path: '/new-booking' },
        { icon: Calendar, label: 'Rentals', path: '/rentals' },
        { icon: Car, label: 'Inventory', path: '/cars' },
        { icon: Users, label: 'Customers', path: '/customers' },
    ]

    return (
        <div className="flex-1 flex flex-col pb-safe-pb">
            <Header
                title="Dhanya Fleet"
                rightAction={
                    <button
                        onClick={handleRefresh}
                        className="p-2 -mr-2 rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
                    >
                        <RefreshCw className="w-5 h-5 text-neutral-600" />
                    </button>
                }
            />

            <main className="flex-1 overflow-auto px-4 py-6 space-y-8 pb-24">
                {/* Insurance Alert Banner */}
                {(alerts.expired > 0 || alerts.expiringSoon > 0) && (
                    <button
                        onClick={() => navigate('/insurance')}
                        className="w-full bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 active:scale-98 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="font-semibold text-amber-900">Action Required</h3>
                            <p className="text-sm text-amber-700">
                                {alerts.expired > 0 && `${alerts.expired} expired, `}
                                {alerts.expiringSoon > 0 && `${alerts.expiringSoon} expiring soon`}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-amber-400" />
                    </button>
                )}

                {/* Quick Actions (Uber Style) */}
                <div>
                    <div className="flex items-center justify-between gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon
                            return (
                                <button
                                    key={action.path}
                                    onClick={() => navigate(action.path)}
                                    className="flex flex-col items-center gap-2 group flex-1"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center transition-all group-active:scale-95 group-active:bg-neutral-200">
                                        <Icon className="w-6 h-6 text-black" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-xs font-medium text-neutral-900 text-center leading-tight">
                                        {action.label}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Todays Overview - Clean Stats */}
                <div>
                    <h2 className="text-lg font-bold text-black mb-4 px-1">Today's Overview</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-900 text-white rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-neutral-400">
                                <Car className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Available</span>
                            </div>
                            <p className="text-3xl font-bold">
                                {statsLoading ? '-' : stats.availableCars}
                            </p>
                            <p className="text-sm text-neutral-400 mt-1">Ready to rent</p>
                        </div>

                        <div className="bg-white border border-neutral-100 text-neutral-900 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-neutral-500">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
                            </div>
                            <p className="text-3xl font-bold tracking-tight">
                                {statsLoading ? '-' : `₹${(stats.monthlyRevenue / 1000).toFixed(1)}k`}
                            </p>
                            <p className="text-sm text-neutral-400 mt-1">This Month</p>
                        </div>
                    </div>
                </div>

                {/* Schedule Feed */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold text-black">Up Next</h2>
                        <button
                            onClick={() => navigate('/schedule')}
                            className="text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
                        >
                            See All
                        </button>
                    </div>

                    {scheduleLoading ? (
                        <div className="space-y-4">
                            <ScheduleCardSkeleton />
                            <ScheduleCardSkeleton />
                        </div>
                    ) : schedule.length === 0 ? (
                        <div className="bg-neutral-50 rounded-3xl p-8 text-center border dashed border-neutral-200">
                            <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                            <h3 className="font-semibold text-neutral-900">No events today</h3>
                            <p className="text-sm text-neutral-400 mt-1">Enjoy your free time!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedule.slice(0, 3).map((item, index) => (
                                <ScheduleCard key={`${item.id}-${index}`} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
