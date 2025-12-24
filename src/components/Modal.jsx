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
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal content - positioned above bottom nav */}
            <div
                className={`
                    relative w-full max-w-lg bg-white rounded-t-3xl 
                    animate-slide-up mb-0 md:mb-6 shadow-2xl
                    ${sizeClasses[size]}
                    flex flex-col safe-area-bottom
                `}
            >
                {/* Handle bar for visual cue */}
                <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-3 mb-1" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-black">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-neutral-100 active:scale-95 transition-all -mr-2"
                    >
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                {/* Body with bottom padding for safe area */}
                <div className="flex-1 overflow-auto px-6 py-2 pb-8">
                    {children}
                </div>
            </div>
        </div>
    )
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'danger', loading = false }) {
    if (!isOpen) return null

    const variantClasses = {
        danger: 'bg-red-600 text-white hover:bg-red-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        primary: 'bg-black text-white hover:bg-neutral-800'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
            <div className="space-y-6">
                <p className="text-neutral-500 leading-relaxed font-medium">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl bg-neutral-100 text-neutral-900 font-bold hover:bg-neutral-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center ${variantClasses[confirmVariant]}`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
