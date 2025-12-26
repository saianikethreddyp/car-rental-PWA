import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRentals } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { rentalsApi, carsApi } from '../api/client'
import { Header } from '../components/Header'
import { Modal, ConfirmModal } from '../components/Modal'
import {
    Search,
    Calendar,
    User,
    Phone,
    Car,
    MapPin,
    Clock,
    Filter,
    X,
    CheckCircle,
    XCircle,
    Eye,
    IndianRupee
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
]

const statusStyles = {
    active: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/15 text-green-400 border-green-500/30',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function Rentals() {
    const navigate = useNavigate()
    const { rentals, loading, refetch } = useRentals()
    const { isOnline } = useSync()

    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedRental, setSelectedRental] = useState(null)
    const [showDetails, setShowDetails] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmAction, setConfirmAction] = useState(null)
    const [updating, setUpdating] = useState(false)

    // Filter rentals
    const filteredRentals = rentals.filter(rental => {
        const matchesSearch =
            rental.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            rental.customer_phone?.includes(search) ||
            rental.cars?.license_plate?.toLowerCase().includes(search.toLowerCase())

        const matchesFilter = activeFilter === 'all' || rental.status === activeFilter

        return matchesSearch && matchesFilter
    })

    const handleRentalClick = (rental) => {
        setSelectedRental(rental)
        setShowDetails(true)
    }

    const handleStatusAction = (rental, action) => {
        setSelectedRental(rental)
        setConfirmAction(action)
        setShowConfirm(true)
        setShowDetails(false)
    }

    const handleConfirmAction = async () => {
        if (!selectedRental || !confirmAction) return

        setUpdating(true)

        try {
            const newStatus = confirmAction === 'complete' ? 'completed' : 'cancelled'

            // Update rental status
            await rentalsApi.update(selectedRental.id, { status: newStatus })

            // If completing/cancelling, make car available again
            if (selectedRental.car_id) {
                await carsApi.update(selectedRental.car_id, { status: 'available' })
            }

            toast.success(`Rental ${newStatus}!`)
            setShowConfirm(false)
            setSelectedRental(null)
            setConfirmAction(null)
            refetch()
        } catch (error) {
            toast.error('Failed to update rental')
        } finally {
            setUpdating(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return '-'
        const d = new Date(date)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="Rentals"
                rightAction={
                    <button
                        onClick={() => navigate('/new-booking')}
                        className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium active:scale-95 transition-all"
                    >
                        + New
                    </button>
                }
            />

            <main className="flex-1 flex flex-col">
                {/* Search & Filter */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or plate..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-400"
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

                {/* Rentals list */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-xl skeleton" />
                                        <div className="flex-1">
                                            <div className="h-5 w-32 skeleton mb-2" />
                                            <div className="h-4 w-24 skeleton" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredRentals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Calendar className="w-16 h-16 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-center">
                                {search || activeFilter !== 'all'
                                    ? 'No rentals match your filters'
                                    : 'No rentals found'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredRentals.map(rental => (
                                <div
                                    key={rental.id}
                                    onClick={() => handleRentalClick(rental)}
                                    className="card-interactive p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-dark-100 truncate">
                                                    {rental.customer_name}
                                                </h3>
                                                <span className={`badge border ${statusStyles[rental.status]}`}>
                                                    {rental.status}
                                                </span>
                                            </div>

                                            <p className="text-sm text-dark-400 flex items-center gap-1">
                                                <Car className="w-3.5 h-3.5" />
                                                {rental.cars?.make} {rental.cars?.model} • {rental.cars?.license_plate}
                                            </p>

                                            <div className="flex items-center gap-3 mt-2 text-sm text-dark-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                </span>
                                                <span className="flex items-center gap-1 text-primary-400 font-medium">
                                                    <IndianRupee className="w-3.5 h-3.5" />
                                                    {rental.total_amount?.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Rental Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => {
                    setShowDetails(false)
                    setSelectedRental(null)
                }}
                title="Rental Details"
                size="full"
            >
                {selectedRental && (
                    <div className="space-y-4">
                        {/* Status badge */}
                        <div className="flex justify-center">
                            <span className={`badge border px-4 py-1.5 text-sm ${statusStyles[selectedRental.status]}`}>
                                {selectedRental.status}
                            </span>
                        </div>

                        {/* Customer */}
                        <div className="card p-4">
                            <h4 className="text-xs font-medium text-dark-400 mb-2">Customer</h4>
                            <p className="text-dark-100 font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-dark-400" />
                                {selectedRental.customer_name}
                            </p>
                            <a
                                href={`tel:${selectedRental.customer_phone}`}
                                className="text-primary-400 flex items-center gap-2 mt-1"
                            >
                                <Phone className="w-4 h-4" />
                                {selectedRental.customer_phone}
                            </a>
                        </div>

                        {/* Vehicle */}
                        <div className="card p-4">
                            <h4 className="text-xs font-medium text-dark-400 mb-2">Vehicle</h4>
                            <p className="text-dark-100 font-medium flex items-center gap-2">
                                <Car className="w-4 h-4 text-dark-400" />
                                {selectedRental.cars?.make} {selectedRental.cars?.model}
                            </p>
                            <p className="text-dark-400 text-sm ml-6">
                                {selectedRental.cars?.license_plate}
                            </p>
                        </div>

                        {/* Duration */}
                        <div className="card p-4">
                            <h4 className="text-xs font-medium text-dark-400 mb-2">Duration</h4>
                            <div className="flex items-center gap-2 text-dark-100">
                                <Calendar className="w-4 h-4 text-dark-400" />
                                <span>{formatDate(selectedRental.start_date)}</span>
                                <span className="text-dark-500">→</span>
                                <span>{formatDate(selectedRental.end_date)}</span>
                            </div>
                            {(selectedRental.start_time || selectedRental.end_time) && (
                                <p className="text-dark-400 text-sm ml-6 mt-1 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {selectedRental.start_time} - {selectedRental.end_time}
                                </p>
                            )}
                        </div>

                        {/* Locations */}
                        {(selectedRental.from_location || selectedRental.to_location) && (
                            <div className="card p-4">
                                <h4 className="text-xs font-medium text-dark-400 mb-2">Locations</h4>
                                {selectedRental.from_location && (
                                    <p className="text-dark-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-green-400" />
                                        From: {selectedRental.from_location}
                                    </p>
                                )}
                                {selectedRental.to_location && (
                                    <p className="text-dark-300 flex items-center gap-2 mt-1">
                                        <MapPin className="w-4 h-4 text-blue-400" />
                                        To: {selectedRental.to_location}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Amount */}
                        <div className="card p-4 bg-primary-600/10 border-primary-600/20">
                            <h4 className="text-xs font-medium text-dark-400 mb-2">Amount</h4>
                            <p className="text-2xl font-bold text-primary-400">
                                ₹{selectedRental.total_amount?.toLocaleString()}
                            </p>
                            <p className="text-sm text-dark-400 mt-1">
                                Paid: ₹{(selectedRental.amount_paid || 0).toLocaleString()} •
                                Status: {selectedRental.payment_status || 'pending'}
                            </p>
                        </div>

                        {/* Actions */}
                        {selectedRental.status === 'active' && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={() => handleStatusAction(selectedRental, 'complete')}
                                    className="btn bg-green-600 text-white hover:bg-green-500"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Complete
                                </button>
                                <button
                                    onClick={() => handleStatusAction(selectedRental, 'cancel')}
                                    className="btn bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => {
                    setShowConfirm(false)
                    setConfirmAction(null)
                }}
                onConfirm={handleConfirmAction}
                loading={updating}
                title={confirmAction === 'complete' ? 'Complete Rental' : 'Cancel Rental'}
                message={
                    confirmAction === 'complete'
                        ? 'Mark this rental as completed? The car will be available for new bookings.'
                        : 'Cancel this rental? This action cannot be undone.'
                }
                confirmText={confirmAction === 'complete' ? 'Complete' : 'Cancel Rental'}
                confirmVariant={confirmAction === 'complete' ? 'success' : 'danger'}
            />
        </div>
    )
}
