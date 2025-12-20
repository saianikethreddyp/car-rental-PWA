import { useTodaySchedule } from '../hooks/useData'
import { Header } from '../components/Header'
import { ScheduleCard, ScheduleCardSkeleton } from '../components/ScheduleCard'
import { Calendar, RefreshCw, Coffee } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Schedule() {
    const { schedule, pickupCount, returnCount, loading, refetch } = useTodaySchedule()

    const handleRefresh = async () => {
        toast.promise(refetch(), {
            loading: 'Refreshing...',
            success: 'Schedule updated',
            error: 'Failed to refresh'
        })
    }

    const handleScheduleAction = (item) => {
        if (item.type === 'pickup') {
            toast.success(`Checked in: ${item.customer_name}`)
        } else {
            toast.success(`Return completed: ${item.customer_name}`)
        }
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="Today's Schedule"
                rightAction={
                    <button
                        onClick={handleRefresh}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-700/50 active:scale-95 transition-all"
                    >
                        <RefreshCw className="w-5 h-5 text-dark-400" />
                    </button>
                }
            />

            <main className="flex-1 overflow-auto px-4 py-4">
                {/* Date header */}
                <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-primary-400" />
                    <span className="text-dark-300">{today}</span>
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 card p-3 text-center">
                        <p className="text-2xl font-bold text-green-400">{pickupCount}</p>
                        <p className="text-xs text-dark-400">Pickups</p>
                    </div>
                    <div className="flex-1 card p-3 text-center">
                        <p className="text-2xl font-bold text-blue-400">{returnCount}</p>
                        <p className="text-xs text-dark-400">Returns</p>
                    </div>
                    <div className="flex-1 card p-3 text-center">
                        <p className="text-2xl font-bold text-primary-400">{schedule.length}</p>
                        <p className="text-xs text-dark-400">Total</p>
                    </div>
                </div>

                {/* Schedule list */}
                {loading ? (
                    <div className="space-y-3">
                        <ScheduleCardSkeleton />
                        <ScheduleCardSkeleton />
                        <ScheduleCardSkeleton />
                    </div>
                ) : schedule.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Coffee className="w-16 h-16 text-dark-600 mb-4" />
                        <h3 className="text-lg font-medium text-dark-300 mb-1">All clear!</h3>
                        <p className="text-dark-500 text-center">
                            No scheduled pickups or returns today.
                            <br />
                            Enjoy the quiet time! ☕
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {schedule.map((item, index) => (
                            <ScheduleCard
                                key={`${item.id}-${item.type}-${index}`}
                                item={item}
                                onAction={handleScheduleAction}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
