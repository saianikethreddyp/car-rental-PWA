import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, size = 'default' }) {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
        small: 'max-h-[50vh]',
        default: 'max-h-[75vh]',
        full: 'max-h-[90vh]'
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal content - positioned above bottom nav */}
            <div
                className={`
                    relative w-full max-w-lg bg-dark-800 rounded-t-3xl 
                    animate-slide-up mb-[70px]
                    ${sizeClasses[size]}
                    flex flex-col
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700/50 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-dark-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-dark-700/50 active:scale-95 transition-all"
                    >
                        <X className="w-5 h-5 text-dark-400" />
                    </button>
                </div>

                {/* Body with bottom padding for safe area */}
                <div className="flex-1 overflow-auto px-5 py-4 pb-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) {
    if (!isOpen) return null

    const variantClasses = {
        danger: 'bg-red-600 text-white hover:bg-red-500',
        success: 'bg-green-600 text-white hover:bg-green-500',
        primary: 'bg-primary-600 text-white hover:bg-primary-500'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
            <div className="space-y-4">
                <p className="text-dark-300">{message}</p>
                <div className="flex gap-3 pb-2">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="btn-secondary flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`btn flex-1 ${variantClasses[confirmVariant]} disabled:opacity-50`}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
