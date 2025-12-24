import { Car, Fuel, Gauge } from 'lucide-react'

const statusStyles = {
    available: 'bg-green-100 text-green-700',
    rented: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-amber-100 text-amber-700',
    disabled: 'bg-neutral-100 text-neutral-600'
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
            className={`
                group relative bg-white border border-neutral-100 shadow-sm rounded-2xl overflow-hidden transition-all duration-200
                ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''}
                ${compact ? 'p-3' : 'p-4'}
            `}
        >
            <div className="flex items-start gap-4">
                {/* Car Icon / Image Placeholder */}
                <div className={`
                    shrink-0 rounded-2xl bg-neutral-50 flex items-center justify-center
                    ${compact ? 'w-12 h-12' : 'w-16 h-16'}
                `}>
                    <Car className={`
                        text-neutral-900
                        ${compact ? 'w-6 h-6' : 'w-8 h-8'}
                    `} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-neutral-900 text-lg leading-tight truncate">
                                {car.make} {car.model}
                            </h3>
                            <p className="text-sm text-neutral-500 font-medium">
                                {car.license_plate}
                            </p>
                        </div>
                        {showStatus && (
                            <span className={`
                                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                ${statusStyles[car.status]}
                            `}>
                                {statusLabels[car.status]}
                            </span>
                        )}
                    </div>

                    {!compact && (
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                                <span className="text-xs font-medium text-neutral-600">
                                    {car.year}
                                </span>
                            </div>
                            {car.fuel_type && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-50 border border-neutral-100">
                                    <Fuel className="w-3 h-3 text-neutral-400" />
                                    <span className="text-xs font-medium text-neutral-600 capitalize">
                                        {car.fuel_type}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 text-right">
                                <span className="text-lg font-bold text-neutral-900">
                                    ₹{car.daily_rate}
                                </span>
                                <span className="text-xs text-neutral-500 font-medium ml-1">
                                    /day
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export function CarCardSkeleton({ compact = false }) {
    return (
        <div className={`bg-white border border-neutral-100 shadow-sm rounded-2xl ${compact ? 'p-3' : 'p-4'}`}>
            <div className="flex items-start gap-4">
                <div className={`rounded-2xl bg-neutral-100 animate-pulse ${compact ? 'w-12 h-12' : 'w-16 h-16'}`} />
                <div className="flex-1 py-1">
                    <div className="h-6 w-32 bg-neutral-100 rounded-md animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-neutral-100 rounded-md animate-pulse" />
                    {!compact && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-2">
                                <div className="h-6 w-12 bg-neutral-100 rounded-md animate-pulse" />
                                <div className="h-6 w-16 bg-neutral-100 rounded-md animate-pulse" />
                            </div>
                            <div className="h-6 w-20 bg-neutral-100 rounded-md animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
