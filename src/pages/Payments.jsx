import { useState } from 'react'
import { usePayments } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { rentalsApi } from '../api/client'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'
import {
    CreditCard,
    Search,
    Calendar,
    Car,
    User,
    IndianRupee,
    CheckCircle,
    Clock,
    AlertCircle,
    X
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
]

const statusStyles = {
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    partial: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    paid: 'bg-green-500/15 text-green-400 border-green-500/30',
}

export default function Payments() {
    const { payments, stats, loading, refetch } = usePayments()
    const { isOnline } = useSync()

    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [showEdit, setShowEdit] = useState(false)
    const [saving, setSaving] = useState(false)
    const [amountPaid, setAmountPaid] = useState('')

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch =
            payment.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
            payment.customer_phone?.includes(search) ||
            payment.cars?.license_plate?.toLowerCase().includes(search.toLowerCase())

        const matchesFilter = activeFilter === 'all' || payment.payment_status === activeFilter

        return matchesSearch && matchesFilter
    })

    const handlePaymentClick = (payment) => {
        setSelectedPayment(payment)
        setAmountPaid(payment.amount_paid?.toString() || '0')
        setShowEdit(true)
    }

    const handleSave = async () => {
        if (!selectedPayment) return

        setSaving(true)
        try {
            const paid = parseFloat(amountPaid) || 0
            let newStatus = 'pending'
            if (paid >= selectedPayment.total_amount) {
                newStatus = 'paid'
            } else if (paid > 0) {
                newStatus = 'partial'
            }

            await rentalsApi.update(selectedPayment.id, {
                amount_paid: paid,
                payment_status: newStatus
            })

            toast.success('Payment updated!')
            setShowEdit(false)
            setSelectedPayment(null)
            refetch()
        } catch (error) {
            toast.error('Failed to update payment')
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        })
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-3.5 h-3.5" />
            case 'partial': return <Clock className="w-3.5 h-3.5" />
            default: return <AlertCircle className="w-3.5 h-3.5" />
        }
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header title="Payments" />

            <main className="flex-1 flex flex-col">
                {/* Stats */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="card p-3">
                            <p className="text-xs text-dark-400 mb-1">Total Billed</p>
                            <p className="text-xl font-bold text-dark-100">
                                ₹{stats.totalBilled?.toLocaleString()}
                            </p>
                        </div>
                        <div className="card p-3">
                            <p className="text-xs text-dark-400 mb-1">Collected</p>
                            <p className="text-xl font-bold text-green-400">
                                ₹{stats.collected?.toLocaleString()}
                            </p>
                        </div>
                        <div className="card p-3">
                            <p className="text-xs text-dark-400 mb-1">Outstanding</p>
                            <p className="text-xl font-bold text-yellow-400">
                                ₹{stats.outstanding?.toLocaleString()}
                            </p>
                        </div>
                        <div className="card p-3">
                            <p className="text-xs text-dark-400 mb-1">Paid Rentals</p>
                            <p className="text-xl font-bold text-primary-400">
                                {stats.paidCount}
                            </p>
                        </div>
                    </div>
                </div>

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

                {/* Payment list */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-4">
                                    <div className="h-5 w-32 skeleton mb-2" />
                                    <div className="h-4 w-24 skeleton" />
                                </div>
                            ))}
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <CreditCard className="w-16 h-16 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-center">No payments found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPayments.map(payment => {
                                const balance = (payment.total_amount || 0) - (payment.amount_paid || 0)
                                return (
                                    <div
                                        key={payment.id}
                                        onClick={() => handlePaymentClick(payment)}
                                        className="card-interactive p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-dark-100 truncate">
                                                        {payment.customer_name}
                                                    </h3>
                                                    <span className={`badge border flex items-center gap-1 ${statusStyles[payment.payment_status || 'pending']}`}>
                                                        {getStatusIcon(payment.payment_status)}
                                                        {payment.payment_status || 'pending'}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-dark-400 flex items-center gap-1">
                                                    <Car className="w-3.5 h-3.5" />
                                                    {payment.cars?.make} {payment.cars?.model}
                                                </p>

                                                <div className="flex items-center gap-3 mt-2 text-sm">
                                                    <span className="text-dark-400 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDate(payment.start_date)} - {formatDate(payment.end_date)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-primary-400 font-bold">
                                                    ₹{payment.total_amount?.toLocaleString()}
                                                </p>
                                                {balance > 0 && (
                                                    <p className="text-xs text-yellow-400">
                                                        Due: ₹{balance.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Edit Payment Modal */}
            <Modal
                isOpen={showEdit}
                onClose={() => {
                    setShowEdit(false)
                    setSelectedPayment(null)
                }}
                title="Update Payment"
            >
                {selectedPayment && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="card p-4 bg-dark-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-dark-400">Customer</span>
                                <span className="text-dark-100 font-medium">{selectedPayment.customer_name}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-dark-400">Vehicle</span>
                                <span className="text-dark-100">{selectedPayment.cars?.make} {selectedPayment.cars?.model}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-dark-400">Total Amount</span>
                                <span className="text-primary-400 font-bold">₹{selectedPayment.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Amount Paid Input */}
                        <div>
                            <label className="input-label flex items-center gap-2">
                                <IndianRupee className="w-4 h-4" />
                                Amount Paid
                            </label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                            />
                            <div className="flex justify-between mt-2 text-sm">
                                <span className="text-dark-400">Balance</span>
                                <span className={`font-medium ${(selectedPayment.total_amount || 0) - (parseFloat(amountPaid) || 0) <= 0
                                    ? 'text-green-400'
                                    : 'text-yellow-400'
                                    }`}>
                                    ₹{Math.max(0, (selectedPayment.total_amount || 0) - (parseFloat(amountPaid) || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Quick amount buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAmountPaid(selectedPayment.total_amount?.toString() || '0')}
                                className="btn-secondary flex-1 text-sm"
                            >
                                Full Amount
                            </button>
                            <button
                                onClick={() => setAmountPaid((selectedPayment.total_amount / 2)?.toString() || '0')}
                                className="btn-secondary flex-1 text-sm"
                            >
                                50%
                            </button>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary w-full"
                        >
                            {saving ? (
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : 'Save Payment'}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}
