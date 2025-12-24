import { useSync } from '../context/SyncContext'
import { Wifi, WifiOff, RefreshCw, Cloud } from 'lucide-react'

export function SyncIndicator() {
    const { isOnline, isSyncing, pendingCount } = useSync()

    if (isSyncing) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-xs font-medium text-neutral-600 animate-fade-in">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing...</span>
            </div>
        )
    }

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full text-xs font-medium text-red-600 animate-fade-in border border-red-100">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
            </div>
        )
    }

    if (pendingCount > 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full text-xs font-medium text-amber-600 animate-fade-in border border-amber-100">
                <Cloud className="w-3.5 h-3.5" />
                <span>{pendingCount} pending</span>
            </div>
        )
    }

    return null
}

export function Header({ title, showBack = false, onBack, rightAction }) {
    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-100 safe-area-top">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all -ml-2 text-black"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-xl font-bold tracking-tight text-black">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <SyncIndicator />
                    {rightAction && (
                        <div>{rightAction}</div>
                    )}
                </div>
            </div>
        </header>
    )
}
