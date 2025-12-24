import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSync } from '../context/SyncContext'
import { rentalsApi, carsApi } from '../api/client'
import { Header } from '../components/Header'
import { InstallButton } from '../components/InstallPrompt'
import {
    User,
    Moon,
    Sun,
    Download,
    Car,
    Users,
    Calendar,
    Wifi,
    WifiOff,
    RefreshCw,
    LogOut,
    Smartphone
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
    const { user, signOut } = useAuth()
    const { isOnline, pendingCount, syncPendingActions, isSyncing } = useSync()
    const [theme, setTheme] = useState('dark')
    const [exporting, setExporting] = useState(null)

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)
        toast.success(`Theme set to ${newTheme}`)
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

    const handleExport = async (type) => {
        setExporting(type)

        try {
            let data = []
            let filename = ''

            if (type === 'rentals') {
                const rentals = await rentalsApi.getAll()

                data = rentals.map(r => ({
                    'Customer Name': r.customer_name,
                    'Phone': r.customer_phone,
                    'Vehicle': `${r.cars?.make} ${r.cars?.model}`,
                    'License Plate': r.cars?.license_plate,
                    'Start Date': r.start_date,
                    'End Date': r.end_date,
                    'Total Amount': r.total_amount,
                    'Amount Paid': r.amount_paid,
                    'Status': r.status,
                    'Payment Status': r.payment_status
                }))
                filename = 'rentals_export.csv'
            } else if (type === 'cars') {
                const cars = await carsApi.getAll()

                data = cars.map(c => ({
                    'Make': c.make,
                    'Model': c.model,
                    'Year': c.year,
                    'License Plate': c.license_plate,
                    'Daily Rate': c.daily_rate,
                    'Status': c.status,
                    'Insurance Expiry': c.insurance_expiry_date,
                    'Insurance Provider': c.insurance_provider
                }))
                filename = 'fleet_export.csv'
            } else if (type === 'customers') {
                const rentals = await rentalsApi.getAll()

                const customerMap = new Map()
                rentals.forEach(r => {
                    const key = r.customer_phone
                    if (!customerMap.has(key)) {
                        customerMap.set(key, {
                            'Name': r.customer_name,
                            'Phone': r.customer_phone,
                            'Total Bookings': 0,
                            'Total Spent': 0
                        })
                    }
                    const customer = customerMap.get(key)
                    customer['Total Bookings']++
                    customer['Total Spent'] += r.total_amount || 0
                })

                data = Array.from(customerMap.values())
                filename = 'customers_export.csv'
            }

            // Convert to CSV
            if (data.length === 0) {
                toast.error('No data to export')
                return
            }

            const headers = Object.keys(data[0])
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
            ].join('\n')

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            a.click()
            window.URL.revokeObjectURL(url)

            toast.success(`${type} exported successfully!`)
        } catch (error) {
            toast.error('Export failed')
        } finally {
            setExporting(null)
        }
    }

    const handleSignOut = async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await signOut()
        }
    }

    return (
        <div className="flex-1 flex flex-col pb-20">
            <Header title="Settings" />

            <main className="flex-1 overflow-auto px-4 py-4 space-y-4">
                {/* Profile */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">Profile</h3>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-primary-600/20 flex items-center justify-center">
                            <User className="w-7 h-7 text-primary-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-dark-100">Administrator</p>
                            <p className="text-sm text-dark-400">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Install App */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">Install App</h3>
                    <InstallButton />
                </div>

                {/* Sync Status */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">Sync Status</h3>

                    <div className="space-y-3">
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

                        <div className="flex items-center justify-between">
                            <span className="text-dark-300">Pending changes</span>
                            <span className={`text-sm ${pendingCount > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {pendingCount} items
                            </span>
                        </div>

                        {pendingCount > 0 && (
                            <button
                                onClick={handleSync}
                                disabled={!isOnline || isSyncing}
                                className="btn-secondary w-full"
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

                {/* Theme */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">Appearance</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'dark'
                                ? 'bg-primary-600 text-white'
                                : 'bg-dark-700/50 text-dark-300'
                                }`}
                        >
                            <Moon className="w-4 h-4" />
                            Dark
                        </button>
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'light'
                                ? 'bg-primary-600 text-white'
                                : 'bg-dark-700/50 text-dark-300'
                                }`}
                        >
                            <Sun className="w-4 h-4" />
                            Light
                        </button>
                    </div>
                </div>

                {/* Export Data */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">Export Data</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => handleExport('rentals')}
                            disabled={exporting === 'rentals'}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-all"
                        >
                            <span className="flex items-center gap-3 text-dark-200">
                                <Calendar className="w-5 h-5 text-primary-400" />
                                Export Rentals
                            </span>
                            {exporting === 'rentals' ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-dark-400" />
                            ) : (
                                <Download className="w-4 h-4 text-dark-400" />
                            )}
                        </button>

                        <button
                            onClick={() => handleExport('customers')}
                            disabled={exporting === 'customers'}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-all"
                        >
                            <span className="flex items-center gap-3 text-dark-200">
                                <Users className="w-5 h-5 text-green-400" />
                                Export Customers
                            </span>
                            {exporting === 'customers' ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-dark-400" />
                            ) : (
                                <Download className="w-4 h-4 text-dark-400" />
                            )}
                        </button>

                        <button
                            onClick={() => handleExport('cars')}
                            disabled={exporting === 'cars'}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-dark-700/50 hover:bg-dark-700 transition-all"
                        >
                            <span className="flex items-center gap-3 text-dark-200">
                                <Car className="w-5 h-5 text-blue-400" />
                                Export Fleet
                            </span>
                            {exporting === 'cars' ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-dark-400" />
                            ) : (
                                <Download className="w-4 h-4 text-dark-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* App Info */}
                <div className="card p-4">
                    <h3 className="text-xs font-medium text-dark-400 mb-3">App Info</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">Version</span>
                            <span className="text-dark-300">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-dark-400">PWA Status</span>
                            <span className="text-dark-300">
                                {window.matchMedia('(display-mode: standalone)').matches ? 'Installed' : 'Browser'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sign Out */}
                <button
                    onClick={handleSignOut}
                    className="btn w-full bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </main>
        </div>
    )
}
