import { useState } from 'react'
import { useCars } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { supabase } from '../supabaseClient'
import { Header } from '../components/Header'
import { Modal } from '../components/Modal'
import {
    Shield,
    Search,
    Calendar,
    Car,
    AlertTriangle,
    CheckCircle,
    Clock,
    X,
    FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'expired', label: 'Expired', color: 'text-red-400' },
    { value: 'expiring', label: 'Expiring Soon', color: 'text-yellow-400' },
    { value: 'valid', label: 'Valid', color: 'text-green-400' },
    { value: 'notset', label: 'Not Set', color: 'text-dark-400' },
]

export default function Insurance() {
    const { cars, loading, refetch } = useCars()
    const { isOnline } = useSync()

    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [selectedCar, setSelectedCar] = useState(null)
    const [showEdit, setShowEdit] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        insurance_expiry_date: '',
        insurance_provider: '',
        insurance_policy_number: ''
    })

    // Get insurance status
    const getInsuranceStatus = (expiryDate) => {
        if (!expiryDate) return 'notset'
        const today = new Date()
        const expiry = new Date(expiryDate)
        const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

        if (daysUntilExpiry < 0) return 'expired'
        if (daysUntilExpiry <= 30) return 'expiring'
        return 'valid'
    }

    // Filter cars
    const filteredCars = cars.filter(car => {
        const matchesSearch =
            car.make?.toLowerCase().includes(search.toLowerCase()) ||
            car.model?.toLowerCase().includes(search.toLowerCase()) ||
            car.license_plate?.toLowerCase().includes(search.toLowerCase())

        const status = getInsuranceStatus(car.insurance_expiry_date)
        const matchesFilter = activeFilter === 'all' || status === activeFilter

        return matchesSearch && matchesFilter
    })

    // Get counts for each status
    const getCounts = () => {
        const counts = { expired: 0, expiring: 0, valid: 0, notset: 0 }
        cars.forEach(car => {
            const status = getInsuranceStatus(car.insurance_expiry_date)
            counts[status]++
        })
        return counts
    }

    const counts = getCounts()

    const handleEditClick = (car) => {
        setSelectedCar(car)
        setFormData({
            insurance_expiry_date: car.insurance_expiry_date || '',
            insurance_provider: car.insurance_provider || '',
            insurance_policy_number: car.insurance_policy_number || ''
        })
        setShowEdit(true)
    }

    const handleSave = async () => {
        if (!selectedCar) return

        setSaving(true)
        try {
            const { error } = await supabase
                .from('cars')
                .update(formData)
                .eq('id', selectedCar.id)

            if (error) throw error

            toast.success('Insurance updated!')
            setShowEdit(false)
            setSelectedCar(null)
            refetch()
        } catch (error) {
            toast.error('Failed to update insurance')
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'expired':
                return (
                    <span className="badge bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Expired
                    </span>
                )
            case 'expiring':
                return (
                    <span className="badge bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expiring Soon
                    </span>
                )
            case 'valid':
                return (
                    <span className="badge bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Valid
                    </span>
                )
            default:
                return (
                    <span className="badge bg-dark-600/50 text-dark-400 border border-dark-600">
                        Not Set
                    </span>
                )
        }
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header title="Insurance" />

            <main className="flex-1 flex flex-col">
                {/* Stats */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            onClick={() => setActiveFilter('expired')}
                            className={`card p-2 text-center ${activeFilter === 'expired' ? 'ring-2 ring-red-500' : ''}`}
                        >
                            <p className="text-lg font-bold text-red-400">{counts.expired}</p>
                            <p className="text-xs text-dark-400">Expired</p>
                        </button>
                        <button
                            onClick={() => setActiveFilter('expiring')}
                            className={`card p-2 text-center ${activeFilter === 'expiring' ? 'ring-2 ring-yellow-500' : ''}`}
                        >
                            <p className="text-lg font-bold text-yellow-400">{counts.expiring}</p>
                            <p className="text-xs text-dark-400">Expiring</p>
                        </button>
                        <button
                            onClick={() => setActiveFilter('valid')}
                            className={`card p-2 text-center ${activeFilter === 'valid' ? 'ring-2 ring-green-500' : ''}`}
                        >
                            <p className="text-lg font-bold text-green-400">{counts.valid}</p>
                            <p className="text-xs text-dark-400">Valid</p>
                        </button>
                        <button
                            onClick={() => setActiveFilter('notset')}
                            className={`card p-2 text-center ${activeFilter === 'notset' ? 'ring-2 ring-dark-400' : ''}`}
                        >
                            <p className="text-lg font-bold text-dark-400">{counts.notset}</p>
                            <p className="text-xs text-dark-400">Not Set</p>
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10"
                        />
                        {(search || activeFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('')
                                    setActiveFilter('all')
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Car list */}
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
                    ) : filteredCars.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Shield className="w-16 h-16 text-dark-600 mb-4" />
                            <p className="text-dark-400 text-center">No vehicles found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredCars.map(car => {
                                const status = getInsuranceStatus(car.insurance_expiry_date)
                                return (
                                    <div
                                        key={car.id}
                                        onClick={() => handleEditClick(car)}
                                        className="card-interactive p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-dark-100">
                                                        {car.make} {car.model}
                                                    </h3>
                                                    {getStatusBadge(status)}
                                                </div>
                                                <p className="text-sm text-dark-400">{car.license_plate}</p>

                                                {car.insurance_expiry_date && (
                                                    <div className="mt-2 text-sm">
                                                        <p className="text-dark-400 flex items-center gap-1">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Expires: {formatDate(car.insurance_expiry_date)}
                                                        </p>
                                                        {car.insurance_provider && (
                                                            <p className="text-dark-500 flex items-center gap-1 mt-0.5">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                {car.insurance_provider} • {car.insurance_policy_number}
                                                            </p>
                                                        )}
                                                    </div>
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

            {/* Edit Modal */}
            <Modal
                isOpen={showEdit}
                onClose={() => {
                    setShowEdit(false)
                    setSelectedCar(null)
                }}
                title="Edit Insurance"
            >
                {selectedCar && (
                    <div className="space-y-4">
                        <div className="card p-3 bg-dark-700/50">
                            <p className="font-medium text-dark-100">
                                {selectedCar.make} {selectedCar.model}
                            </p>
                            <p className="text-sm text-dark-400">{selectedCar.license_plate}</p>
                        </div>

                        <div>
                            <label className="input-label flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={formData.insurance_expiry_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, insurance_expiry_date: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="input-label">Insurance Provider</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., ICICI Lombard"
                                value={formData.insurance_provider}
                                onChange={(e) => setFormData(prev => ({ ...prev, insurance_provider: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="input-label">Policy Number</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., POL-123456"
                                value={formData.insurance_policy_number}
                                onChange={(e) => setFormData(prev => ({ ...prev, insurance_policy_number: e.target.value }))}
                            />
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
                            ) : 'Save Changes'}
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    )
}
