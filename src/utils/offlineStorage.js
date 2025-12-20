import { openDB } from 'idb'

const DB_NAME = 'dhanya-worker-pwa'
const DB_VERSION = 1

// Initialize IndexedDB
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store for cached data (cars, rentals, etc.)
            if (!db.objectStoreNames.contains('cache')) {
                db.createObjectStore('cache')
            }

            // Store for pending sync actions
            if (!db.objectStoreNames.contains('syncQueue')) {
                const store = db.createObjectStore('syncQueue', {
                    keyPath: 'id',
                    autoIncrement: true
                })
                store.createIndex('timestamp', 'timestamp')
                store.createIndex('status', 'status')
            }
        }
    })
}

// Offline data storage
export const offlineStorage = {
    async get(key) {
        const db = await getDB()
        return db.get('cache', key)
    },

    async set(key, value) {
        const db = await getDB()
        const data = {
            value,
            timestamp: Date.now()
        }
        return db.put('cache', data, key)
    },

    async delete(key) {
        const db = await getDB()
        return db.delete('cache', key)
    },

    async clear() {
        const db = await getDB()
        return db.clear('cache')
    },

    // Get cached data with freshness check
    async getIfFresh(key, maxAgeMs = 5 * 60 * 1000) {
        const data = await this.get(key)
        if (!data) return null

        const age = Date.now() - data.timestamp
        if (age > maxAgeMs) return null

        return data.value
    }
}

// Sync queue for offline actions
export const syncQueue = {
    async add(item) {
        const db = await getDB()
        const queueItem = {
            ...item,
            status: 'pending',
            createdAt: Date.now(),
            attempts: 0
        }
        return db.add('syncQueue', queueItem)
    },

    async getAll() {
        const db = await getDB()
        const all = await db.getAll('syncQueue')
        return all.filter(item => item.status === 'pending')
    },

    async getPendingCount() {
        const db = await getDB()
        const all = await db.getAll('syncQueue')
        return all.filter(item => item.status === 'pending').length
    },

    async remove(id) {
        const db = await getDB()
        return db.delete('syncQueue', id)
    },

    async markFailed(id, errorMessage) {
        const db = await getDB()
        const item = await db.get('syncQueue', id)
        if (item) {
            item.status = 'failed'
            item.error = errorMessage
            item.attempts = (item.attempts || 0) + 1
            await db.put('syncQueue', item)
        }
    },

    async retry(id) {
        const db = await getDB()
        const item = await db.get('syncQueue', id)
        if (item) {
            item.status = 'pending'
            await db.put('syncQueue', item)
        }
    },

    async clear() {
        const db = await getDB()
        return db.clear('syncQueue')
    }
}

// Helper to wrap Supabase calls with offline support
export async function fetchWithCache(key, fetchFn, maxAgeMs = 5 * 60 * 1000) {
    // Try to get from cache first if offline
    if (!navigator.onLine) {
        const cached = await offlineStorage.get(key)
        if (cached) {
            return { data: cached.value, fromCache: true }
        }
        throw new Error('No cached data available offline')
    }

    // Online: fetch fresh data
    try {
        const data = await fetchFn()
        await offlineStorage.set(key, data)
        return { data, fromCache: false }
    } catch (error) {
        // On error, try cache as fallback
        const cached = await offlineStorage.get(key)
        if (cached) {
            return { data: cached.value, fromCache: true }
        }
        throw error
    }
}
