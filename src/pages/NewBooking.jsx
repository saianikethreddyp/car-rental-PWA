import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCars } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { supabase } from '../supabaseClient'
import { Header } from '../components/Header'
import { CarCard } from '../components/CarCard'
import { DocumentUpload } from '../components/DocumentUpload'
import {
    User,
    Phone,
    Calendar,
    Clock,
    MapPin,
    Car,
    IndianRupee,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Check,
    IdCard,
    CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewBooking() {
    const navigate = useNavigate()
    const { availableCars, loading: carsLoading } = useCars()
    const { queueAction, isOnline } = useSync()

    const [step, setStep] = useState(1) // 1: Customer, 2: Car, 3: Details, 4: Confirm
    const [submitting, setSubmitting] = useState(false)
    const [showDocuments, setShowDocuments] = useState(false)

    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        car_id: null,
        selectedCar: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '10:00',
        end_time: '10:00',
        from_location: '',
        to_location: '',
        total_amount: '',
        // Identity documents
        pan_number: '',
        pan_image_url: '',
        aadhar_number: '',
        aadhar_image_url: '',
        license_number: '',
        license_image_url: ''
    })

    const updateForm = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }))
    }

    const selectCar = (car) => {
        updateForm('car_id', car.id)
        updateForm('selectedCar', car)
        setStep(3)
    }

    // Calculate days and suggested amount
    const calculateDays = () => {
        if (!formData.start_date || !formData.end_date) return 0
        const start = new Date(formData.start_date)
        const end = new Date(formData.end_date)
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        return diff > 0 ? diff : 1
    }

    const suggestedAmount = () => {
        if (!formData.selectedCar) return 0
        return calculateDays() * (formData.selectedCar.daily_rate || 0)
    }

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.customer_name.trim() && formData.customer_phone.trim()
            case 2:
                return formData.car_id !== null
            case 3:
                return formData.start_date && formData.end_date
            case 4:
                return true
            default:
                return false
        }
    }

    const handleNext = () => {
        if (!canProceed()) return
        if (step < 4) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 1) setStep(step - 1)
        else navigate(-1)
    }

    const handleSubmit = async () => {
        setSubmitting(true)

        const bookingData = {
            car_id: formData.car_id,
            customer_name: formData.customer_name.trim(),
            customer_phone: formData.customer_phone.trim(),
            start_date: formData.start_date,
            end_date: formData.end_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            from_location: formData.from_location.trim(),
            to_location: formData.to_location.trim(),
            total_amount: parseFloat(formData.total_amount) || suggestedAmount(),
            status: 'active',
            payment_status: 'pending',
            amount_paid: 0,
            // Identity documents
            pan_number: formData.pan_number.trim().toUpperCase(),
            pan_image_url: formData.pan_image_url,
            aadhar_number: formData.aadhar_number.trim(),
            aadhar_image_url: formData.aadhar_image_url,
            license_number: formData.license_number.trim().toUpperCase(),
            license_image_url: formData.license_image_url
        }

        try {
            if (isOnline) {
                // Create rental
                const { error: rentalError } = await supabase
                    .from('rentals')
                    .insert(bookingData)

                if (rentalError) throw rentalError

                // Update car status
                const { error: carError } = await supabase
                    .from('cars')
                    .update({ status: 'rented' })
                    .eq('id', formData.car_id)

                if (carError) throw carError
            } else {
                // Queue for offline sync
                await queueAction('INSERT', 'rentals', bookingData)
                await queueAction('UPDATE', 'cars', {
                    id: formData.car_id,
                    status: 'rented'
                })
            }

            toast.success('Booking created successfully!')
            navigate('/')
        } catch (error) {
            toast.error(error.message || 'Failed to create booking')
        } finally {
            setSubmitting(false)
        }
    }

    // Check if any documents are uploaded
    const hasDocuments = formData.pan_image_url || formData.aadhar_image_url || formData.license_image_url

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header
                title="New Booking"
                showBack
                onBack={handleBack}
            />

            <main className="flex-1 flex flex-col">
                {/* Progress indicator */}
                <div className="px-4 py-3 border-b border-dark-700/50">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                  ${s < step
                                        ? 'bg-primary-600 text-white'
                                        : s === step
                                            ? 'bg-primary-600/20 text-primary-400 border-2 border-primary-600'
                                            : 'bg-dark-700 text-dark-400'
                                    }
                `}>
                                    {s < step ? <Check className="w-4 h-4" /> : s}
                                </div>
                                {s < 4 && (
                                    <div className={`w-12 h-0.5 mx-1 ${s < step ? 'bg-primary-600' : 'bg-dark-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-dark-400">
                        <span>Customer</span>
                        <span>Car</span>
                        <span>Details</span>
                        <span>Confirm</span>
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-auto px-4 py-4">
                    {/* Step 1: Customer Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-lg font-semibold text-dark-100 mb-4">
                                Customer Information
                            </h2>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter customer name"
                                    value={formData.customer_name}
                                    onChange={(e) => updateForm('customer_name', e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="input"
                                    placeholder="Enter phone number"
                                    value={formData.customer_phone}
                                    onChange={(e) => updateForm('customer_phone', e.target.value)}
                                />
                            </div>

                            {/* Identity Documents Section */}
                            <div className="border border-dark-600 rounded-xl overflow-hidden mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowDocuments(!showDocuments)}
                                    className="w-full flex items-center justify-between p-4 bg-dark-800/50 active:bg-dark-700 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center">
                                            <IdCard className="w-5 h-5 text-primary-400" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-dark-100">Identity Documents</span>
                                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-dark-600 text-dark-400">Optional</span>
                                            {hasDocuments && (
                                                <p className="text-xs text-green-400 mt-0.5">Documents attached</p>
                                            )}
                                        </div>
                                    </div>
                                    {showDocuments ? <ChevronUp className="w-5 h-5 text-dark-400" /> : <ChevronDown className="w-5 h-5 text-dark-400" />}
                                </button>

                                {showDocuments && (
                                    <div className="p-4 space-y-5 bg-dark-800/30">
                                        {/* PAN Card */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                                                <CreditCard className="w-4 h-4 text-primary-400" />
                                                PAN Card
                                            </div>
                                            <input
                                                type="text"
                                                className="input uppercase"
                                                placeholder="ABCDE1234F"
                                                value={formData.pan_number}
                                                onChange={(e) => updateForm('pan_number', e.target.value)}
                                            />
                                            <DocumentUpload
                                                label="PAN Card Photo"
                                                docType="pan"
                                                existingUrl={formData.pan_image_url}
                                                onUpload={(url) => updateForm('pan_image_url', url)}
                                            />
                                        </div>

                                        {/* Aadhar Card */}
                                        <div className="space-y-3 pt-3 border-t border-dark-600">
                                            <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                                                <IdCard className="w-4 h-4 text-blue-400" />
                                                Aadhar Card
                                            </div>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="1234 5678 9012"
                                                value={formData.aadhar_number}
                                                onChange={(e) => updateForm('aadhar_number', e.target.value)}
                                            />
                                            <DocumentUpload
                                                label="Aadhar Card Photo"
                                                docType="aadhar"
                                                existingUrl={formData.aadhar_image_url}
                                                onUpload={(url) => updateForm('aadhar_image_url', url)}
                                            />
                                        </div>

                                        {/* Driving License */}
                                        <div className="space-y-3 pt-3 border-t border-dark-600">
                                            <div className="flex items-center gap-2 text-sm font-medium text-dark-200">
                                                <Car className="w-4 h-4 text-green-400" />
                                                Driving License
                                            </div>
                                            <input
                                                type="text"
                                                className="input uppercase"
                                                placeholder="TS0120200012345"
                                                value={formData.license_number}
                                                onChange={(e) => updateForm('license_number', e.target.value)}
                                            />
                                            <DocumentUpload
                                                label="License Photo"
                                                docType="license"
                                                existingUrl={formData.license_image_url}
                                                onUpload={(url) => updateForm('license_image_url', url)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Car */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-lg font-semibold text-dark-100 mb-4">
                                Select Vehicle
                            </h2>

                            {carsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-24 skeleton rounded-xl" />
                                    <div className="h-24 skeleton rounded-xl" />
                                </div>
                            ) : availableCars.length === 0 ? (
                                <div className="card p-8 text-center">
                                    <Car className="w-12 h-12 text-dark-500 mx-auto mb-3" />
                                    <p className="text-dark-400">No cars available</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {availableCars.map(car => (
                                        <div
                                            key={car.id}
                                            onClick={() => selectCar(car)}
                                            className={`
                        card-interactive p-4 cursor-pointer
                        ${formData.car_id === car.id ? 'ring-2 ring-primary-500' : ''}
                      `}
                                        >
                                            <CarCard car={car} showStatus={false} compact />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Booking Details */}
                    {step === 3 && (
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-lg font-semibold text-dark-100 mb-4">
                                Booking Details
                            </h2>

                            {/* Selected car summary */}
                            {formData.selectedCar && (
                                <div className="card p-3 mb-4 bg-primary-600/10 border-primary-600/20">
                                    <div className="flex items-center gap-3">
                                        <Car className="w-5 h-5 text-primary-400" />
                                        <div>
                                            <p className="font-medium text-dark-100">
                                                {formData.selectedCar.make} {formData.selectedCar.model}
                                            </p>
                                            <p className="text-sm text-dark-400">
                                                {formData.selectedCar.license_plate} • ₹{formData.selectedCar.daily_rate}/day
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="input-label flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.start_date}
                                        onChange={(e) => updateForm('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="input-label flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Start Time
                                    </label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formData.start_time}
                                        onChange={(e) => updateForm('start_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="input-label flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.end_date}
                                        min={formData.start_date}
                                        onChange={(e) => updateForm('end_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="input-label flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        End Time
                                    </label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formData.end_time}
                                        onChange={(e) => updateForm('end_time', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Pickup Location
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter pickup location"
                                    value={formData.from_location}
                                    onChange={(e) => updateForm('from_location', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Drop Location
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter drop location"
                                    value={formData.to_location}
                                    onChange={(e) => updateForm('to_location', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="input-label flex items-center gap-2">
                                    <IndianRupee className="w-4 h-4" />
                                    Total Amount
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder={`Suggested: ₹${suggestedAmount()}`}
                                    value={formData.total_amount}
                                    onChange={(e) => updateForm('total_amount', e.target.value)}
                                />
                                <p className="text-xs text-dark-500 mt-1">
                                    {calculateDays()} days × ₹{formData.selectedCar?.daily_rate || 0} = ₹{suggestedAmount()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h2 className="text-lg font-semibold text-dark-100 mb-4">
                                Confirm Booking
                            </h2>

                            <div className="space-y-4">
                                {/* Customer */}
                                <div className="card p-4">
                                    <h3 className="text-sm font-medium text-dark-400 mb-2">Customer</h3>
                                    <p className="text-dark-100 font-medium">{formData.customer_name}</p>
                                    <p className="text-dark-300">{formData.customer_phone}</p>
                                    {hasDocuments && (
                                        <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Documents attached
                                        </p>
                                    )}
                                </div>

                                {/* Vehicle */}
                                <div className="card p-4">
                                    <h3 className="text-sm font-medium text-dark-400 mb-2">Vehicle</h3>
                                    <p className="text-dark-100 font-medium">
                                        {formData.selectedCar?.make} {formData.selectedCar?.model}
                                    </p>
                                    <p className="text-dark-300">{formData.selectedCar?.license_plate}</p>
                                </div>

                                {/* Duration */}
                                <div className="card p-4">
                                    <h3 className="text-sm font-medium text-dark-400 mb-2">Duration</h3>
                                    <div className="flex items-center gap-2 text-dark-100">
                                        <span>{formData.start_date}</span>
                                        <ChevronRight className="w-4 h-4 text-dark-500" />
                                        <span>{formData.end_date}</span>
                                    </div>
                                    <p className="text-dark-300 text-sm mt-1">
                                        {formData.start_time} - {formData.end_time}
                                    </p>
                                </div>

                                {/* Locations */}
                                {(formData.from_location || formData.to_location) && (
                                    <div className="card p-4">
                                        <h3 className="text-sm font-medium text-dark-400 mb-2">Locations</h3>
                                        {formData.from_location && (
                                            <p className="text-dark-300 text-sm">From: {formData.from_location}</p>
                                        )}
                                        {formData.to_location && (
                                            <p className="text-dark-300 text-sm">To: {formData.to_location}</p>
                                        )}
                                    </div>
                                )}

                                {/* Amount */}
                                <div className="card p-4 bg-primary-600/10 border-primary-600/20">
                                    <h3 className="text-sm font-medium text-dark-400 mb-2">Total Amount</h3>
                                    <p className="text-2xl font-bold text-primary-400">
                                        ₹{formData.total_amount || suggestedAmount()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom action */}
                <div className="px-4 py-4 border-t border-dark-700/50 bg-dark-900">
                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="btn-primary w-full"
                        >
                            Continue
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-success w-full"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating...
                                </span>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Create Booking
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
