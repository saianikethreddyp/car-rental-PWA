import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSync } from '../context/SyncContext'
import { supabase } from '../supabaseClient'
import { Header } from '../components/Header'
import {
    Car,
    Hash,
    Calendar,
    IndianRupee,
    Check
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AddCar() {
    const navigate = useNavigate()
    const { queueAction, isOnline } = useSync()
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        daily_rate: ''
    })

    const updateForm = (key, value) => {
        // Auto-uppercase license plate
        if (key === 'license_plate') {
            value = value.toUpperCase()
        }
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const isValid = () => {
        return (
            formData.make.trim() &&
            formData.model.trim() &&
            formData.year > 1990 &&
            formData.license_plate.trim() &&
            formData.daily_rate > 0
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isValid()) return

        setSubmitting(true)

        const carData = {
            make: formData.make.trim(),
            model: formData.model.trim(),
            year: parseInt(formData.year),
            license_plate: formData.license_plate.trim().toUpperCase(),
            daily_rate: parseFloat(formData.daily_rate),
            status: 'available'
        }

        try {
            if (isOnline) {
                const { error } = await supabase
                    .from('cars')
                    .insert(carData)

                if (error) {
                    if (error.code === '23505') {
                        throw new Error('A car with this license plate already exists')
                    }
                    throw error
                }
            } else {
                await queueAction('INSERT', 'cars', carData)
            }

            toast.success('Car added successfully!')
            navigate('/cars')
        } catch (error) {
            toast.error(error.message || 'Failed to add car')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="Add New Car"
                showBack
                onBack={() => navigate(-1)}
            />

            <main className="flex-1 overflow-auto">
                <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
                    {/* Make */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Make
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Maruti, Honda, Hyundai"
                            value={formData.make}
                            onChange={(e) => updateForm('make', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Model */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Model
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Swift, City, i20"
                            value={formData.model}
                            onChange={(e) => updateForm('model', e.target.value)}
                            required
                        />
                    </div>

                    {/* Year */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Year
                        </label>
                        <input
                            type="number"
                            className="input"
                            placeholder="e.g., 2023"
                            min="1990"
                            max={new Date().getFullYear() + 1}
                            value={formData.year}
                            onChange={(e) => updateForm('year', e.target.value)}
                            required
                        />
                    </div>

                    {/* License Plate */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <Hash className="w-4 h-4" />
                            License Plate
                        </label>
                        <input
                            type="text"
                            className="input uppercase"
                            placeholder="e.g., KA-01-AB-1234"
                            value={formData.license_plate}
                            onChange={(e) => updateForm('license_plate', e.target.value)}
                            required
                        />
                    </div>

                    {/* Daily Rate */}
                    <div>
                        <label className="input-label flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            Daily Rate
                        </label>
                        <input
                            type="number"
                            className="input"
                            placeholder="e.g., 1500"
                            min="0"
                            step="100"
                            value={formData.daily_rate}
                            onChange={(e) => updateForm('daily_rate', e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting || !isValid()}
                            className="btn-success w-full"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding...
                                </span>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Add Car
                                </>
                            )}
                        </button>
                    </div>

                    {/* Offline notice */}
                    {!isOnline && (
                        <p className="text-sm text-yellow-400 text-center">
                            You're offline. The car will be added when you're back online.
                        </p>
                    )}
                </form>
            </main>
        </div>
    )
}
