import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { offlineStorage, syncQueue } from '../utils/offlineStorage'
import toast from 'react-hot-toast'

const SyncContext = createContext({})

export const useSync = () => useContext(SyncContext)

export function SyncProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [isSyncing, setIsSyncing] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const [lastSyncTime, setLastSyncTime] = useState(null)

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true)
            toast.success('Back online!')
            syncPendingActions()
        }

        const handleOffline = () => {
            setIsOnline(false)
            toast('You are offline. Changes will sync when back online.', {
                icon: '📴',
                duration: 4000
            })
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Check pending items on mount
        checkPendingItems()

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const checkPendingItems = async () => {
        try {
            const count = await syncQueue.getPendingCount()
            setPendingCount(count)
        } catch (err) {
            console.error('Error checking pending items:', err)
        }
    }

    const syncPendingActions = useCallback(async () => {
        if (!navigator.onLine || isSyncing) return

        setIsSyncing(true)

        try {
            const pending = await syncQueue.getAll()

            for (const item of pending) {
                try {
                    await executeAction(item)
                    await syncQueue.remove(item.id)
                } catch (err) {
                    console.error('Failed to sync item:', item, err)
                    await syncQueue.markFailed(item.id, err.message)
                }
            }

            await checkPendingItems()
            setLastSyncTime(new Date())

            if (pending.length > 0) {
                toast.success(`Synced ${pending.length} pending actions`)
            }
        } catch (err) {
            console.error('Sync error:', err)
            toast.error('Failed to sync some actions')
        } finally {
            setIsSyncing(false)
        }
    }, [isSyncing])

    const executeAction = async (item) => {
        const { action, table, data } = item

        switch (action) {
            case 'INSERT':
                const { error: insertError } = await supabase
                    .from(table)
                    .insert(data)
                if (insertError) throw insertError
                break

            case 'UPDATE':
                const { id: updateId, ...updateData } = data
                const { error: updateError } = await supabase
                    .from(table)
                    .update(updateData)
                    .eq('id', updateId)
                if (updateError) throw updateError
                break

            case 'DELETE':
                const { error: deleteError } = await supabase
                    .from(table)
                    .delete()
                    .eq('id', data.id)
                if (deleteError) throw deleteError
                break

            default:
                throw new Error(`Unknown action: ${action}`)
        }
    }

    // Queue an action for sync
    const queueAction = async (action, table, data, options = {}) => {
        // If online, try to execute immediately
        if (navigator.onLine && !options.forceQueue) {
            try {
                await executeAction({ action, table, data })
                return { success: true, synced: true }
            } catch (err) {
                // If fails, queue it
                console.log('Online action failed, queuing:', err)
            }
        }

        // Queue the action for later sync
        await syncQueue.add({
            action,
            table,
            data,
            timestamp: Date.now()
        })

        await checkPendingItems()

        return { success: true, synced: false, queued: true }
    }

    // Cache data for offline use
    const cacheData = async (key, data) => {
        await offlineStorage.set(key, data)
    }

    const getCachedData = async (key) => {
        return await offlineStorage.get(key)
    }

    const value = {
        isOnline,
        isSyncing,
        pendingCount,
        lastSyncTime,
        queueAction,
        syncPendingActions,
        cacheData,
        getCachedData
    }

    return (
        <SyncContext.Provider value={value}>
            {children}
        </SyncContext.Provider>
    )
}
