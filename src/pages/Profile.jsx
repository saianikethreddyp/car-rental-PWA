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
    Info,
    ChevronRight,
    Settings,
    Bell,
    Shield,
    Upload
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
        <div className="flex-1 flex flex-col pb-safe-pb bg-white h-full">
            <Header title="Account" />

            <main className="flex-1 overflow-auto pb-24">
                {/* User Header */}
                <div className="px-6 py-8 flex items-center gap-5 border-b border-neutral-100">
                    <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-neutral-200">
                        {userRole?.name ? userRole.name.charAt(0).toUpperCase() : <User />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-black">
                            {userRole?.name || 'Worker'}
                        </h1>
                        <p className="text-neutral-500 font-medium">{user?.email}</p>
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200">
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                                {userRole?.role || 'worker'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats / Sync Status */}
                <div className="px-6 py-6">
                    <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-black flex items-center gap-2">
                                <Cloud className="w-5 h-5" />
                                Sync Status
                            </h3>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isOnline ? (
                                    <>
                                        <Wifi className="w-3 h-3" />
                                        ONLINE
                                    </>
                                ) : (
                                    <>
                                        <WifiOff className="w-3 h-3" />
                                        OFFLINE
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-neutral-500 font-medium">Pending Changes</span>
                            <span className={`text-lg font-bold ${pendingCount > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                                {pendingCount}
                            </span>
                        </div>

                        {pendingCount > 0 && (
                            <button
                                onClick={handleSync}
                                disabled={!isOnline || isSyncing}
                                className="w-full mt-4 bg-black text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {isSyncing ? 'Syncing...' : 'Sync Now'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Menu List */}
                <div className="px-6 space-y-2">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-all border border-transparent hover:border-neutral-100">
                        <div className="flex items-center gap-4">
                            <Bell className="w-6 h-6 text-black" />
                            <span className="font-bold text-black text-lg">Notifications</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-all border border-transparent hover:border-neutral-100">
                        <div className="flex items-center gap-4">
                            <Settings className="w-6 h-6 text-black" />
                            <span className="font-bold text-black text-lg">Settings</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 active:bg-neutral-100 transition-all border border-transparent hover:border-neutral-100">
                        <div className="flex items-center gap-4">
                            <Shield className="w-6 h-6 text-black" />
                            <span className="font-bold text-black text-lg">Privacy & Security</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </button>

                    <div className="h-px bg-neutral-100 my-4" />

                    <div className="px-4 py-2">
                        <div className="flex items-center justify-between text-sm text-neutral-500 mb-2">
                            <span>App Version</span>
                            <span className="font-medium text-black">1.1.0</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-neutral-500">
                            <span>Mode</span>
                            <span className="font-medium text-black">
                                {window.matchMedia('(display-mode: standalone)').matches ? 'App' : 'Browser'}
                            </span>
                        </div>
                    </div>

                    {!window.matchMedia('(display-mode: standalone)').matches && (
                        <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-blue-900">Install App</p>
                                <p className="text-sm text-blue-700 leading-relaxed mt-1">
                                    Add to your home screen for the best experience and offline access.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            onClick={handleSignOut}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-neutral-100 text-neutral-900 font-bold text-lg hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Log Out
                        </button>
                        <p className="text-center text-xs text-neutral-400 mt-4">
                            Dhanya Rentals Worker App • {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
