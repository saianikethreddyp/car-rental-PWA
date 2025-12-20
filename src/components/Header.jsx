import { useSync } from '../context/SyncContext'
import { Wifi, WifiOff, RefreshCw, Cloud } from 'lucide-react'

export function SyncIndicator() {
    const { isOnline, isSyncing, pendingCount } = useSync()

    if (isSyncing) {
        return (
            <div className="sync-indicator syncing">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing...</span>
            </div>
        )
    }

    if (!isOnline) {
        return (
            <div className="sync-indicator offline">
                <WifiOff className="w-4 h-4" />
                <span>Offline{pendingCount > 0 ? ` (${pendingCount} pending)` : ''}</span>
            </div>
        )
    }

    if (pendingCount > 0) {
        return (
            <div className="sync-indicator syncing">
                <Cloud className="w-4 h-4" />
                <span>{pendingCount} pending</span>
            </div>
        )
    }

    return null
}

export function Header({ title, showBack = false, onBack, rightAction }) {
    return (
        <header className="sticky top-0 z-40 bg-dark-900/95 backdrop-blur-lg border-b border-dark-700/50 safe-area-top">
            <div className="flex items-center justify-between px-4 h-14">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={onBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-dark-700/50 active:scale-95 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-lg font-semibold text-dark-100">{title}</h1>
                </div>
                {rightAction && (
                    <div>{rightAction}</div>
                )}
            </div>
            <SyncIndicator />
        </header>
    )
}
