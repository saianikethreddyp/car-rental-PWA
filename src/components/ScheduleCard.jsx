import { Clock, MapPin, Phone, User, ArrowRight, CheckCircle2 } from 'lucide-react'

export function ScheduleCard({ item, onAction }) {
    const isPickup = item.type === 'pickup'
    const time = isPickup ? item.start_time : item.end_time
    const location = isPickup ? item.from_location : item.to_location

    return (
        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4 transition-all active:scale-[0.99]">
            <div className="flex items-start gap-4">
                {/* Type Visualization */}
                <div className={`
                    shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${isPickup
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }
                `}>
                    {isPickup ? (
                        <ArrowRight className="w-5 h-5 -rotate-45" strokeWidth={2.5} />
                    ) : (
                        <ArrowRight className="w-5 h-5 rotate-[135deg]" strokeWidth={2.5} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <span className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            ${isPickup
                                ? 'bg-black text-white'
                                : 'bg-neutral-100 text-neutral-600'
                            }
                        `}>
                            {isPickup ? 'Pickup' : 'Return'}
                        </span>
                        {time && (
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                                <Clock className="w-4 h-4 text-neutral-500" />
                                {time}
                            </div>
                        )}
                    </div>

                    {/* Car Info */}
                    <div className="mb-3">
                        <h3 className="font-bold text-lg text-neutral-900 leading-tight">
                            {item.cars?.make} {item.cars?.model}
                        </h3>
                        <p className="text-sm font-medium text-neutral-500">
                            {item.cars?.license_plate}
                        </p>
                    </div>

                    {/* Customer & Location Details */}
                    <div className="space-y-2.5 bg-neutral-50 rounded-xl p-3 mb-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 flex justify-center">
                                <User className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">
                                    {item.customer_name}
                                </p>
                                <a
                                    href={`tel:${item.customer_phone}`}
                                    className="text-neutral-500 text-xs hover:text-black hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {item.customer_phone}
                                </a>
                            </div>
                            <a
                                href={`tel:${item.customer_phone}`}
                                className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Phone className="w-4 h-4 text-neutral-700" />
                            </a>
                        </div>

                        {location && (
                            <div className="flex items-center gap-3 text-sm border-t border-neutral-100 pt-2.5">
                                <div className="w-8 flex justify-center">
                                    <MapPin className="w-4 h-4 text-neutral-400" />
                                </div>
                                <p className="font-medium text-neutral-700 truncate">
                                    {location}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onAction?.(item)
                        }}
                        className={`
                            w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center justify-center gap-2
                            ${isPickup
                                ? 'bg-black text-white hover:bg-neutral-800'
                                : 'bg-neutral-900 text-white hover:bg-neutral-800'
                            }
                        `}
                    >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        {isPickup ? 'Start Rental' : 'Complete Return'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export function ScheduleCardSkeleton() {
    return (
        <div className="bg-white border border-neutral-100 shadow-sm rounded-2xl p-4">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 animate-pulse" />
                <div className="flex-1">
                    <div className="flex justify-between mb-3">
                        <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
                        <div className="h-6 w-16 bg-neutral-100 rounded animate-pulse" />
                    </div>
                    <div className="h-7 w-40 bg-neutral-100 rounded animate-pulse mb-2" />
                    <div className="h-5 w-24 bg-neutral-100 rounded animate-pulse mb-4" />
                    <div className="h-24 w-full bg-neutral-100 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
