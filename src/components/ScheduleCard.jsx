import { Clock, MapPin, Phone, User, ArrowRight } from 'lucide-react'

export function ScheduleCard({ item, onAction }) {
    const isPickup = item.type === 'pickup'
    const time = isPickup ? item.start_time : item.end_time
    const location = isPickup ? item.from_location : item.to_location

    return (
        <div className="card-interactive p-4">
            <div className="flex items-start gap-3">
                {/* Type indicator */}
                <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
          ${isPickup
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }
        `}>
                    {isPickup ? (
                        <ArrowRight className="w-5 h-5 rotate-45" />
                    ) : (
                        <ArrowRight className="w-5 h-5 -rotate-[135deg]" />
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`
              text-xs font-medium px-2 py-0.5 rounded-full
              ${isPickup
                                ? 'bg-green-500/15 text-green-400'
                                : 'bg-blue-500/15 text-blue-400'
                            }
            `}>
                            {isPickup ? 'Pickup' : 'Return'}
                        </span>
                        {time && (
                            <span className="flex items-center gap-1 text-sm text-dark-400">
                                <Clock className="w-3.5 h-3.5" />
                                {time}
                            </span>
                        )}
                    </div>

                    {/* Car info */}
                    <h3 className="font-semibold text-dark-100 truncate">
                        {item.cars?.make} {item.cars?.model}
                    </h3>
                    <p className="text-sm text-dark-400">
                        {item.cars?.license_plate}
                    </p>

                    {/* Customer info */}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-dark-300">
                            <User className="w-3.5 h-3.5" />
                            {item.customer_name}
                        </span>
                        <a
                            href={`tel:${item.customer_phone}`}
                            className="flex items-center gap-1 text-primary-400"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {item.customer_phone}
                        </a>
                    </div>

                    {/* Location */}
                    {location && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-dark-400">
                            <MapPin className="w-3.5 h-3.5" />
                            {location}
                        </div>
                    )}
                </div>
            </div>

            {/* Action button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onAction?.(item)
                }}
                className={`
          w-full mt-3 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98]
          ${isPickup
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    }
        `}
            >
                {isPickup ? 'Check-in Customer' : 'Complete Return'}
            </button>
        </div>
    )
}

export function ScheduleCardSkeleton() {
    return (
        <div className="card p-4">
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1">
                    <div className="h-4 w-20 skeleton mb-2" />
                    <div className="h-5 w-32 skeleton mb-1" />
                    <div className="h-4 w-24 skeleton mb-2" />
                    <div className="h-4 w-40 skeleton" />
                </div>
            </div>
            <div className="h-10 w-full skeleton mt-3 rounded-xl" />
        </div>
    )
}
