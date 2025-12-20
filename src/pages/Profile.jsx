import { useAuth } from '../context/AuthContext'
import { useSync } from '../context/SyncContext'
import { Header } from '../components/Header'
import {
    User,
    LogOut,
    Wifi,
    WifiOff,
    Cloud,
    RefreshCw,
    Smartphone,
    Info
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
    const { user, userRole, signOut, loading } = useAuth()
    const { isOnline, pendingCount, syncPendingActions, isSyncing } = useSync()

    const handleSignOut = async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await signOut()
        }
    }

    const handleSync = async () => {
        if (!isOnline) {
            toast.error('Cannot sync while offline')
            return
        }

        toast.promise(syncPendingActions(), {
            loading: 'Syncing...',
            success: 'All changes synced',
            error: 'Sync failed'
        })
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header title="Profile" />

            <main className="flex-1 overflow-auto px-4 py-4 space-y-6">
                {/* User info */}
                <div className="card p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary-600/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-dark-100">
                                {userRole?.name || 'Worker'}
                            </h2>
                            <p className="text-dark-400">{user?.email}</p>
                            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-primary-600/20 text-primary-400">
                                {userRole?.role || 'worker'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sync status */}
                <div className="card p-4">
                    <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        Sync Status
                    </h3>

                    <div className="space-y-3">
                        {/* Connection status */}
                        <div className="flex items-center justify-between">
                            <span className="text-dark-300 flex items-center gap-2">
                                {isOnline ? (
                                    <>
                                        <Wifi className="w-4 h-4 text-green-400" />
                                        Online
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-4 h-4 text-red-400" />
                                        Offline
                                    </>
                                )}
                            </span>
                            <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                                {isOnline ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        {/* Pending items */}
                        <div className="flex items-center justify-between">
                            <span className="text-dark-300">Pending changes</span>
                            <span className={`text-sm ${pendingCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {pendingCount} items
                            </span>
                        </div>

                        {/* Sync button */}
                        {pendingCount > 0 && (
                            <button
                                onClick={handleSync}
                                disabled={!isOnline || isSyncing}
                                className="btn-secondary w-full mt-2"
                            >
                                {isSyncing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Syncing...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Sync Now
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* App info */}
                <div className="card p-4">
                    <h3 className="text-sm font-medium text-dark-400 mb-3 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        App Info
                    </h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">Version</span>
                            <span className="text-dark-300">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">PWA</span>
                            <span className="text-dark-300">
                                {window.matchMedia('(display-mode: standalone)').matches ? 'Installed' : 'Browser'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PWA Install hint */}
                {!window.matchMedia('(display-mode: standalone)').matches && (
                    <div className="card p-4 bg-primary-600/10 border-primary-600/20">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-dark-200 font-medium">Install the app</p>
                                <p className="text-sm text-dark-400 mt-1">
                                    Tap the share button and select "Add to Home Screen" for the best experience.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sign out */}
                <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="btn w-full bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </main>
        </div>
    )
}
