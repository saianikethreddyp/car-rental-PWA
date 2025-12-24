import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCars } from '../hooks/useData'
import { useSync } from '../context/SyncContext'
import { rentalsApi, carsApi } from '../api/client'
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
    CreditCard,
    ArrowLeft
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
                await rentalsApi.create(bookingData)

                // Update car status
                await carsApi.update(formData.car_id, { status: 'rented' })
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
            toast.error(error.response?.data?.error || error.message || 'Failed to create booking')
        } finally {
            setSubmitting(false)
        }
    }

    // Check if any documents are uploaded
    const hasDocuments = formData.pan_image_url || formData.aadhar_image_url || formData.license_image_url

    const stepTitles = ['Who is booking?', 'Choose a car', 'Trip Details', 'Confirm']

    return (
        <div className="flex-1 flex flex-col pb-safe-pb bg-white h-full relative">
            <Header
                title={step === 1 ? "New Booking" : stepTitles[step - 1]}
                showBack
                onBack={handleBack}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Progress Bar - minimalist */}
                <div className="px-6 py-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-black' : 'bg-neutral-200'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1 overflow-auto px-6 py-4 pb-24">
                    {/* Step 1: Customer Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h1 className="text-3xl font-bold text-black mb-2">Customer Details</h1>
                                <p className="text-neutral-500">Who is renting the car?</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-neutral-900 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-neutral-100 border-none rounded-xl p-4 text-lg font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-black/5 transition-all text-black"
                                        placeholder="Enter name"
                                        value={formData.customer_name}
                                        onChange={(e) => updateForm('customer_name', e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-neutral-900 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full bg-neutral-100 border-none rounded-xl p-4 text-lg font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-black/5 transition-all text-black"
                                        placeholder="10-digit number"
                                        value={formData.customer_phone}
                                        onChange={(e) => updateForm('customer_phone', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Identity Documents Toggle */}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowDocuments(!showDocuments)}
                                    className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
                                >
                                    {showDocuments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {showDocuments ? 'Hide Documents' : 'Add Documents (Optional)'}
                                </button>

                                {showDocuments && (
                                    <div className="mt-4 space-y-6 animate-slide-down">
                                        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                            <h3 className="font-semibold text-black mb-3 text-sm uppercase tracking-wide">Identity Proofs</h3>

                                            <div className="space-y-5">
                                                {/* PAN */}
                                                <div>
                                                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">PAN Card</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-3 text-sm font-medium uppercase mb-2 placeholder:normal-case"
                                                        placeholder="PAN Number"
                                                        value={formData.pan_number}
                                                        onChange={(e) => updateForm('pan_number', e.target.value)}
                                                    />
                                                    <DocumentUpload
                                                        label="Upload Photo"
                                                        docType="pan"
                                                        existingUrl={formData.pan_image_url}
                                                        onUpload={(url) => updateForm('pan_image_url', url)}
                                                    />
                                                </div>

                                                {/* Aadhar */}
                                                <div className="border-t border-neutral-100 pt-4">
                                                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Aadhar Card</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-3 text-sm font-medium mb-2"
                                                        placeholder="Aadhar Number"
                                                        value={formData.aadhar_number}
                                                        onChange={(e) => updateForm('aadhar_number', e.target.value)}
                                                    />
                                                    <DocumentUpload
                                                        label="Upload Photo"
                                                        docType="aadhar"
                                                        existingUrl={formData.aadhar_image_url}
                                                        onUpload={(url) => updateForm('aadhar_image_url', url)}
                                                    />
                                                </div>

                                                {/* License */}
                                                <div className="border-t border-neutral-100 pt-4">
                                                    <label className="text-xs font-semibold text-neutral-500 mb-1.5 block">Driving License</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-white border border-neutral-200 rounded-lg p-3 text-sm font-medium uppercase mb-2 placeholder:normal-case"
                                                        placeholder="License Number"
                                                        value={formData.license_number}
                                                        onChange={(e) => updateForm('license_number', e.target.value)}
                                                    />
                                                    <DocumentUpload
                                                        label="Upload Photo"
                                                        docType="license"
                                                        existingUrl={formData.license_image_url}
                                                        onUpload={(url) => updateForm('license_image_url', url)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Car */}
                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-black mb-6">Select a Car</h2>

                            {carsLoading ? (
                                <div className="space-y-3">
                                    <CarCardSkeleton />
                                    <CarCardSkeleton />
                                </div>
                            ) : availableCars.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Car className="w-8 h-8 text-neutral-400" />
                                    </div>
                                    <h3 className="font-semibold text-black">No cars available</h3>
                                    <p className="text-neutral-500 text-sm mt-1">Please mark a car as available first.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {availableCars.map(car => (
                                        <div
                                            key={car.id}
                                            onClick={() => selectCar(car)}
                                            className={`transition-all active:scale-[0.98] ${formData.car_id === car.id ? 'ring-2 ring-black rounded-2xl' : ''}`}
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
                        <div className="space-y-8 animate-fade-in">
                            {/* Selected car summary */}
                            {formData.selectedCar && (
                                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Car className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-black">
                                            {formData.selectedCar.make} {formData.selectedCar.model}
                                        </h3>
                                        <p className="text-sm font-medium text-neutral-500">
                                            {formData.selectedCar.license_plate}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* DateTime */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide ml-1">Start</label>
                                        <input
                                            type="date"
                                            className="w-full bg-neutral-100 border-none rounded-xl p-3 font-medium text-black focus:ring-2 focus:ring-black/5"
                                            value={formData.start_date}
                                            onChange={(e) => updateForm('start_date', e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            className="w-full mt-2 bg-neutral-100 border-none rounded-xl p-3 font-medium text-black focus:ring-2 focus:ring-black/5"
                                            value={formData.start_time}
                                            onChange={(e) => updateForm('start_time', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide ml-1">End</label>
                                        <input
                                            type="date"
                                            className="w-full bg-neutral-100 border-none rounded-xl p-3 font-medium text-black focus:ring-2 focus:ring-black/5"
                                            value={formData.end_date}
                                            min={formData.start_date}
                                            onChange={(e) => updateForm('end_date', e.target.value)}
                                        />
                                        <input
                                            type="time"
                                            className="w-full mt-2 bg-neutral-100 border-none rounded-xl p-3 font-medium text-black focus:ring-2 focus:ring-black/5"
                                            value={formData.end_time}
                                            onChange={(e) => updateForm('end_time', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Locations */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide ml-1">Pickup Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-11 pr-4 font-medium"
                                                placeholder="Enter location"
                                                value={formData.from_location}
                                                onChange={(e) => updateForm('from_location', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide ml-1">Drop Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-neutral-100 border-none rounded-xl py-3 pl-11 pr-4 font-medium"
                                                placeholder="Enter location"
                                                value={formData.to_location}
                                                onChange={(e) => updateForm('to_location', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="pt-4 border-t border-neutral-100 space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="font-bold text-black text-lg">Total Amount</label>
                                        <span className="text-xs text-neutral-500 font-medium bg-neutral-100 px-2 py-1 rounded-md">
                                            {calculateDays()} days × ₹{formData.selectedCar?.daily_rate || 0}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-lg">₹</span>
                                        <input
                                            type="number"
                                            className="w-full bg-neutral-900 border-none rounded-2xl py-4 pl-10 pr-4 text-white text-2xl font-bold placeholder:text-neutral-600 focus:ring-0"
                                            placeholder={suggestedAmount().toString()}
                                            value={formData.total_amount}
                                            onChange={(e) => updateForm('total_amount', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirmation */}
                    {step === 4 && (
                        <div className="animate-fade-in pb-8">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20">
                                    <Check className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-black">Confirm Booking</h1>
                                <p className="text-neutral-500">Please review the details below</p>
                            </div>

                            <div className="bg-neutral-50 rounded-3xl p-6 space-y-6">
                                {/* Car & Amount */}
                                <div className="flex justify-between items-start border-b border-neutral-200 pb-6">
                                    <div>
                                        <h3 className="font-bold text-lg text-black">{formData.selectedCar?.make} {formData.selectedCar?.model}</h3>
                                        <p className="text-sm text-neutral-500">{formData.selectedCar?.license_plate}</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="font-bold text-lg text-black">₹{formData.total_amount || suggestedAmount()}</h3>
                                        <p className="text-sm text-neutral-500">{calculateDays()} Days</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-black" />
                                        <div className="w-0.5 h-12 bg-neutral-200" />
                                        <div className="w-2 h-2 rounded-full border-2 border-black bg-white" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Pickup</p>
                                            <p className="font-semibold text-black">{formData.start_date}, {formData.start_time}</p>
                                            {formData.from_location && <p className="text-sm text-neutral-500 truncate">{formData.from_location}</p>}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide">Return</p>
                                            <p className="font-semibold text-black">{formData.end_date}, {formData.end_time}</p>
                                            {formData.to_location && <p className="text-sm text-neutral-500 truncate">{formData.to_location}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer */}
                                <div className="border-t border-neutral-200 pt-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                                        <User className="w-6 h-6 text-neutral-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-black">{formData.customer_name}</p>
                                        <p className="text-sm text-neutral-500">{formData.customer_phone}</p>
                                    </div>
                                    {hasDocuments && (
                                        <div className="ml-auto bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                            Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 safe-area-bottom z-10">
                    <div className="max-w-lg mx-auto">
                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="w-full bg-black text-white font-bold text-lg h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100"
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full bg-black text-white font-bold text-lg h-14 rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Confirming...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Confirm Booking</span>
                                        <div className="w-1 h-1 bg-white/50 rounded-full" />
                                        <span>₹{formData.total_amount || suggestedAmount()}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
