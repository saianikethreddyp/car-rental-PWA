import { useTodaySchedule } from '../hooks/useData'
import { Header } from '../components/Header'
import { ScheduleCard, ScheduleCardSkeleton } from '../components/ScheduleCard'
import { Calendar, RefreshCw, Coffee, ChevronRight } from 'lucide-react'
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

    const today = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    return (
        <div className="flex-1 flex flex-col pb-safe-pb bg-neutral-50 min-h-screen">
            <Header
                title="Schedule"
                rightAction={
                    <button
                        onClick={handleRefresh}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-neutral-100 active:scale-95 transition-all text-black hover:bg-neutral-50"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                }
            />

            <main className="flex-1 overflow-auto px-6 py-6 pb-24">
                {/* Date header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black mb-1">Today</h1>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium text-lg">{today}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-3xl font-bold text-black">{pickupCount}</span>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />
                            </div>
                        </div>
                        <p className="font-medium text-neutral-500">Pickups</p>
                    </div>
                    <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-3xl font-bold text-black">{returnCount}</span>
                            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 bg-black rounded-full" />
                            </div>
                        </div>
                        <p className="font-medium text-neutral-500">Returns</p>
                    </div>
                </div>

                {/* Schedule list */}
                <div>
                    <h2 className="text-xl font-bold text-black mb-4">Timeline</h2>
                    {loading ? (
                        <div className="space-y-4">
                            <div className="w-full h-32 bg-white rounded-3xl animate-pulse" />
                            <div className="w-full h-32 bg-white rounded-3xl animate-pulse" />
                        </div>
                    ) : schedule.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
                                <Coffee className="w-10 h-10 text-neutral-300" />
                            </div>
                            <h3 className="text-xl font-bold text-black mb-2">All Clear</h3>
                            <p className="text-neutral-500 max-w-xs mx-auto">
                                No scheduled pickups or returns for today.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-neutral-200 z-0" />

                            {schedule.map((item, index) => (
                                <div key={`${item.id}-${item.type}-${index}`} className="relative z-10 pl-1">
                                    <ScheduleCard
                                        item={item}
                                        onAction={handleScheduleAction}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
