import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCars } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { supabase } from '../supabaseClient'
import { Header } from '../components/Header'
import { CarCard, CarCardSkeleton } from '../components/CarCard'
import { Search, Plus, X, Car } from 'lucide-react'
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
                const { error } = await supabase
                    .from('cars')
                    .update({ status: newStatus })
                    .eq('id', selectedCar.id)

                if (error) throw error
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
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="Cars"
                rightAction={
                    <button
                        onClick={() => navigate('/add-car')}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </button>
                }
            />

            <main className="flex-1 flex flex-col">
                {/* Search */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search cars..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-400 hover:text-dark-300"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-4 px-4">
                        {statusFilters.map(filter => (
                            <button
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
                                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                  ${activeFilter === filter.value
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-dark-700/50 text-dark-300 hover:bg-dark-700'
                                    }
                `}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cars list */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                            <CarCardSkeleton />
                        </div>
                    ) : filteredCars.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Car className="w-16 h-16 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-center">
                                {search || activeFilter !== 'all'
                                    ? 'No cars match your filters'
                                    : 'No cars found'
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
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-dark-800 rounded-t-3xl p-6 animate-slide-up safe-area-bottom">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-dark-100">
                                Update Status
                            </h2>
                            <button
                                onClick={() => {
                                    setShowStatusModal(false)
                                    setSelectedCar(null)
                                }}
                                className="p-2 rounded-full hover:bg-dark-700/50"
                            >
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-dark-300">
                                {selectedCar.make} {selectedCar.model}
                            </p>
                            <p className="text-sm text-dark-500">
                                {selectedCar.license_plate}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleStatusUpdate('available')}
                                disabled={updating || selectedCar.status === 'available'}
                                className="btn bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 disabled:opacity-50"
                            >
                                Available
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('rented')}
                                disabled={updating || selectedCar.status === 'rented'}
                                className="btn bg-blue-600/20 text-blue-400 border border-blue-600/30 hover:bg-blue-600/30 disabled:opacity-50"
                            >
                                Rented
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('maintenance')}
                                disabled={updating || selectedCar.status === 'maintenance'}
                                className="btn bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30 disabled:opacity-50"
                            >
                                Maintenance
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('disabled')}
                                disabled={updating || selectedCar.status === 'disabled'}
                                className="btn bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 disabled:opacity-50"
                            >
                                Disabled
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
