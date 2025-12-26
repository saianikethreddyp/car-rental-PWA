import { useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';

/**
 * Floating WhatsApp Support Button for Worker PWA
 * Shows a WhatsApp icon that expands to show support contact options
 */
export default function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);

    const contacts = [
        {
            name: 'Primary Support',
            number: '918328417230',
            displayNumber: '+91 832 841 7230'
        },
        {
            name: 'Secondary Support',
            number: '919398840252',
            displayNumber: '+91 939 884 0252'
        }
    ];

    const openWhatsApp = (number) => {
        const message = encodeURIComponent('Hi, I need help with the Dhanya Worker App.');
        window.open(`https://wa.me/${number}?text=${message}`, '_blank');
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-20 right-4 z-50">
            {/* Contact Options Panel */}
            {isOpen && (
                <div className="absolute bottom-14 right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-green-500 text-white px-4 py-3">
                        <h3 className="font-semibold text-sm">Need Help?</h3>
                        <p className="text-xs text-green-100">Contact support via WhatsApp</p>
                    </div>
                    <div className="p-2">
                        {contacts.map((contact, index) => (
                            <button
                                key={index}
                                onClick={() => openWhatsApp(contact.number)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                            >
                                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">{contact.name}</p>
                                    <p className="text-xs text-gray-500">{contact.displayNumber}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 ${isOpen
                        ? 'bg-gray-600'
                        : 'bg-green-500'
                    }`}
                aria-label={isOpen ? 'Close support menu' : 'Open support menu'}
            >
                {isOpen ? (
                    <X className="w-5 h-5 text-white" />
                ) : (
                    <MessageCircle className="w-5 h-5 text-white" />
                )}
            </button>

            {/* Notification dot */}
            {!isOpen && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
        </div>
    );
}
