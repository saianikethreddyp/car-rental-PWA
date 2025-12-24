import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCars } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { carsApi } from '../api/client'
import { Header } from '../components/Header'
import { CarCard, CarCardSkeleton } from '../components/CarCard'
import { Search, Plus, X, Car, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'rented', label: 'Rented' },
    { value: 'maintenance', label: 'Maintenance' },
]

export default function Cars() {
    const navigate = useNavigate()
    const { cars, loading, refetch } = useCars()
    const { queueAction, isOnline } = useSync()
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedCar, setSelectedCar] = useState(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Filter cars
    const filteredCars = cars.filter(car => {
        const matchesSearch =
            car.make?.toLowerCase().includes(search.toLowerCase()) ||
            car.model?.toLowerCase().includes(search.toLowerCase()) ||
            car.license_plate?.toLowerCase().includes(search.toLowerCase())

        const matchesFilter = activeFilter === 'all' || car.status === activeFilter

        return matchesSearch && matchesFilter
    })

    const handleCarClick = (car) => {
        setSelectedCar(car)
        setShowStatusModal(true)
    }

    const handleStatusUpdate = async (newStatus) => {
        if (!selectedCar) return

        setUpdating(true)

        try {
            if (isOnline) {
                await carsApi.update(selectedCar.id, { status: newStatus })
            } else {
                await queueAction('UPDATE', 'cars', {
                    id: selectedCar.id,
                    status: newStatus
                })
            }

            toast.success(`Status updated to ${newStatus}`)
            setShowStatusModal(false)
            setSelectedCar(null)
            refetch()
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col pb-safe-pb">
            <Header
                title="Inventory"
                rightAction={
                    <button
                        onClick={() => navigate('/add-car')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black active:scale-95 transition-all text-white shadow-md hover:bg-neutral-800"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                }
            />

            <main className="flex-1 flex flex-col">
                {/* Search & Filter Header */}
                <div className="px-4 py-3 bg-white sticky top-0 z-10 border-b border-neutral-100">
                    <div className="relative mb-3">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search cars..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-11 pr-10 text-base placeholder:text-neutral-400 focus:ring-0 text-black"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-black rounded-full hover:bg-neutral-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {statusFilters.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                                    ${activeFilter === filter.value
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                    }
                                `}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cars list */}
                <div className="flex-1 overflow-auto px-4 py-4 pb-24">
                    {loading ? (
                        <div className="space-y-3">
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                        </div>
                    ) : filteredCars.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                                <Car className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-bold text-black">No cars found</h3>
                            <p className="text-neutral-500 mt-1 max-w-xs mx-auto">
                                {search || activeFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Add a new car to get started'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCars.map(car => (
                                <CarCard
                                    key={car.id}
                                    car={car}
                                    onClick={handleCarClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Status Update Modal */}
            {showStatusModal && selectedCar && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowStatusModal(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 shadow-2xl animate-slide-up safe-area-bottom">
                        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-black">
                                    Update Status
                                </h2>
                                <p className="text-neutral-500">
                                    {selectedCar.make} {selectedCar.model} • {selectedCar.license_plate}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleStatusUpdate('available')}
                                disabled={updating}
                                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedCar.status === 'available' ? 'border-green-500 bg-green-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                            >
                                <span className={`font-semibold ${selectedCar.status === 'available' ? 'text-green-700' : 'text-neutral-700'}`}>Available</span>
                                {selectedCar.status === 'available' && <Check className="w-5 h-5 text-green-600" />}
                            </button>

                            <button
                                onClick={() => handleStatusUpdate('rented')}
                                disabled={updating}
                                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedCar.status === 'rented' ? 'border-black bg-neutral-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                            >
                                <span className={`font-semibold ${selectedCar.status === 'rented' ? 'text-black' : 'text-neutral-700'}`}>Rented</span>
                                {selectedCar.status === 'rented' && <Check className="w-5 h-5 text-black" />}
                            </button>

                            <button
                                onClick={() => handleStatusUpdate('maintenance')}
                                disabled={updating}
                                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedCar.status === 'maintenance' ? 'border-amber-500 bg-amber-50' : 'border-neutral-100 hover:bg-neutral-50'}`}
                            >
                                <span className={`font-semibold ${selectedCar.status === 'maintenance' ? 'text-amber-700' : 'text-neutral-700'}`}>Maintenance</span>
                                {selectedCar.status === 'maintenance' && <Check className="w-5 h-5 text-amber-600" />}
                            </button>

                            <button
                                onClick={() => handleStatusUpdate('disabled')}
                                disabled={updating}
                                className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedCar.status === 'disabled' ? 'border-neutral-400 bg-neutral-100' : 'border-neutral-100 hover:bg-neutral-50'}`}
                            >
                                <span className={`font-semibold ${selectedCar.status === 'disabled' ? 'text-neutral-700' : 'text-neutral-700'}`}>Disabled</span>
                                {selectedCar.status === 'disabled' && <Check className="w-5 h-5 text-neutral-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
