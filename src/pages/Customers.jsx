import { useState } from 'react'
import { useCustomers, useRentals } from '../hooks/useData'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'
import {
    Search,
    User,
    Phone,
    ShoppingBag,
    Calendar,
    IndianRupee,
    Award,
    X,
    Car
} from 'lucide-react'

export default function Customers() {
    const { customers, loading, refetch } = useCustomers()
    const { rentals } = useRentals()
    const [search, setSearch] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    // Filter customers
    const filteredCustomers = customers.filter(customer =>
        customer.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search)
    )

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer)
        setShowDetails(true)
    }

    // Get customer's rental history
    const getCustomerRentals = (phone) => {
        return rentals.filter(r => r.customer_phone === phone)
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
            <Header title="Customers" />

            <main className="flex-1 flex flex-col">
                {/* Search */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
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
                </div>

                {/* Stats */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="card p-3 text-center">
                            <p className="text-xl font-bold text-primary-400">{customers.length}</p>
                            <p className="text-xs text-dark-400">Total</p>
                        </div>
                        <div className="card p-3 text-center">
                            <p className="text-xl font-bold text-green-400">
                                {customers.filter(c => c.totalBookings >= 5).length}
                            </p>
                            <p className="text-xs text-dark-400">Loyal</p>
                        </div>
                        <div className="card p-3 text-center">
                            <p className="text-xl font-bold text-blue-400">
                                {customers.filter(c => c.activeRentals > 0).length}
                            </p>
                            <p className="text-xs text-dark-400">Active</p>
                        </div>
                    </div>
                </div>

                {/* Customer list */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-4">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 rounded-full skeleton" />
                                        <div className="flex-1">
                                            <div className="h-5 w-32 skeleton mb-2" />
                                            <div className="h-4 w-24 skeleton" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <User className="w-16 h-16 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-center">
                                {search ? 'No customers match your search' : 'No customers found'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCustomers.map((customer, index) => (
                                <div
                                    key={customer.phone}
                                    onClick={() => handleCustomerClick(customer)}
                                    className="card-interactive p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary-400 font-semibold">
                                                {customer.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-dark-100 truncate">
                                                    {customer.name}
                                                </h3>
                                                {customer.totalBookings >= 5 && (
                                                    <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                                                        <Award className="w-3 h-3" />
                                                        Loyal
                                                    </span>
                                                )}
                                                {customer.activeRentals > 0 && (
                                                    <span className="badge bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                                        Active
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-dark-400 flex items-center gap-1">
                                                <Phone className="w-3.5 h-3.5" />
                                                {customer.phone}
                                            </p>

                                            <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                                                <span>{customer.totalBookings} bookings</span>
                                                <span>₹{customer.totalSpent?.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Customer Details Modal */}
            <Modal
                isOpen={showDetails}
                onClose={() => {
                    setShowDetails(false)
                    setSelectedCustomer(null)
                }}
                title="Customer Profile"
                size="full"
            >
                {selectedCustomer && (
                    <div className="space-y-4">
                        {/* Profile header */}
                        <div className="flex flex-col items-center py-4">
                            <div className="w-20 h-20 rounded-full bg-primary-600/20 flex items-center justify-center mb-3">
                                <span className="text-2xl font-bold text-primary-400">
                                    {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-dark-100">{selectedCustomer.name}</h3>
                            <a
                                href={`tel:${selectedCustomer.phone}`}
                                className="text-primary-400 flex items-center gap-1 mt-1"
                            >
                                <Phone className="w-4 h-4" />
                                {selectedCustomer.phone}
                            </a>
                            {selectedCustomer.totalBookings >= 5 && (
                                <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 mt-2 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" />
                                    Loyal Customer
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="card p-3 text-center">
                                <p className="text-xl font-bold text-primary-400">
                                    {selectedCustomer.totalBookings}
                                </p>
                                <p className="text-xs text-dark-400">Bookings</p>
                            </div>
                            <div className="card p-3 text-center">
                                <p className="text-xl font-bold text-green-400">
                                    ₹{selectedCustomer.totalSpent?.toLocaleString()}
                                </p>
                                <p className="text-xs text-dark-400">Spent</p>
                            </div>
                            <div className="card p-3 text-center">
                                <p className="text-xl font-bold text-blue-400">
                                    {selectedCustomer.activeRentals}
                                </p>
                                <p className="text-xs text-dark-400">Active</p>
                            </div>
                        </div>

                        {/* Rental history */}
                        <div>
                            <h4 className="text-sm font-medium text-dark-400 mb-3">Rental History</h4>
                            <div className="space-y-2">
                                {getCustomerRentals(selectedCustomer.phone).slice(0, 10).map(rental => (
                                    <div key={rental.id} className="card p-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-dark-100 font-medium flex items-center gap-1">
                                                    <Car className="w-4 h-4 text-dark-400" />
                                                    {rental.cars?.make} {rental.cars?.model}
                                                </p>
                                                <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(rental.start_date)} - {formatDate(rental.end_date)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-primary-400 font-medium">
                                                    ₹{rental.total_amount?.toLocaleString()}
                                                </p>
                                                <span className={`
                          text-xs px-2 py-0.5 rounded-full
                          ${rental.status === 'active'
                                                        ? 'bg-blue-500/15 text-blue-400'
                                                        : rental.status === 'completed'
                                                            ? 'bg-green-500/15 text-green-400'
                                                            : 'bg-red-500/15 text-red-400'
                                                    }
                        `}>
                                                    {rental.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {getCustomerRentals(selectedCustomer.phone).length === 0 && (
                                    <p className="text-dark-500 text-center py-4">No rental history</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
