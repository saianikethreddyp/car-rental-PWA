import { Car } from 'lucide-react'

const statusStyles = {
    available: 'status-available',
    rented: 'status-rented',
    maintenance: 'status-maintenance',
    disabled: 'status-disabled'
}

const statusLabels = {
    available: 'Available',
    rented: 'Rented',
    maintenance: 'Maintenance',
    disabled: 'Disabled'
}

export function CarCard({ car, onClick, showStatus = true, compact = false }) {
    return (
        <div
            onClick={() => onClick?.(car)}
            className={`card-interactive ${compact ? 'p-3' : 'p-4'} cursor-pointer`}
        >
            <div className="flex items-start gap-3">
                {/* Car icon */}
                <div className="w-12 h-12 rounded-xl bg-dark-700/50 flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-primary-400" />
                </div>

                {/* Car details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-dark-100 truncate">
                            {car.make} {car.model}
                        </h3>
                        {showStatus && (
                            <span className={`badge ${statusStyles[car.status]}`}>
                                {statusLabels[car.status]}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-dark-400 mt-0.5">
                        {car.license_plate}
                    </p>

                    {!compact && (
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-dark-300">
                                {car.year}
                            </span>
                            <span className="text-sm font-medium text-primary-400">
                                ₹{car.daily_rate}/day
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function CarCardSkeleton({ compact = false }) {
    return (
        <div className={`card ${compact ? 'p-3' : 'p-4'}`}>
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="flex-1">
                    <div className="h-5 w-32 skeleton mb-2" />
                    <div className="h-4 w-24 skeleton" />
                    {!compact && <div className="h-4 w-20 skeleton mt-2" />}
                </div>
            </div>
        </div>
    )
}
