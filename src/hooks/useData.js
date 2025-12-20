import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { offlineStorage } from '../utils/offlineStorage'
import { useSync } from '../context/SyncContext'

// Hook for fetching cars with realtime updates
export function useCars() {
    const [cars, setCars] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { cacheData, getCachedData, isOnline } = useSync()

    const fetchCars = useCallback(async () => {
        try {
            setLoading(true)

            if (!navigator.onLine) {
                const cached = await getCachedData('cars')
                if (cached?.value) {
                    setCars(cached.value)
                    return
                }
            }

            const { data, error } = await supabase
                .from('cars')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            setCars(data || [])
            await cacheData('cars', data)
        } catch (err) {
            setError(err.message)
            // Try to load from cache on error
            const cached = await getCachedData('cars')
            if (cached?.value) {
                setCars(cached.value)
            }
        } finally {
            setLoading(false)
        }
    }, [cacheData, getCachedData])

    useEffect(() => {
        fetchCars()

        // Set up realtime subscription
        const channel = supabase
            .channel('cars-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'cars' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setCars(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setCars(prev => prev.map(car =>
                            car.id === payload.new.id ? payload.new : car
                        ))
                    } else if (payload.eventType === 'DELETE') {
                        setCars(prev => prev.filter(car => car.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchCars])

    // Get available cars only
    const availableCars = cars.filter(car => car.status === 'available')

    return {
        cars,
        availableCars,
        loading,
        error,
        refetch: fetchCars
    }
}

// Hook for fetching rentals with realtime updates
export function useRentals(options = {}) {
    const { todayOnly = false } = options
    const [rentals, setRentals] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { cacheData, getCachedData } = useSync()

    const fetchRentals = useCallback(async () => {
        try {
            setLoading(true)

            if (!navigator.onLine) {
                const cached = await getCachedData('rentals')
                if (cached?.value) {
                    setRentals(filterRentals(cached.value))
                    return
                }
            }

            let query = supabase
                .from('rentals')
                .select(`
          *,
          cars (id, make, model, license_plate)
        `)
                .order('created_at', { ascending: false })

            if (todayOnly) {
                const today = new Date().toISOString().split('T')[0]
                query = query.or(`start_date.eq.${today},end_date.eq.${today}`)
            }

            const { data, error } = await query

            if (error) throw error

            setRentals(data || [])
            await cacheData('rentals', data)
        } catch (err) {
            setError(err.message)
            const cached = await getCachedData('rentals')
            if (cached?.value) {
                setRentals(filterRentals(cached.value))
            }
        } finally {
            setLoading(false)
        }
    }, [cacheData, getCachedData, todayOnly])

    const filterRentals = (data) => {
        if (!todayOnly) return data
        const today = new Date().toISOString().split('T')[0]
        return data.filter(r => r.start_date === today || r.end_date === today)
    }

    useEffect(() => {
        fetchRentals()

        // Set up realtime subscription
        const channel = supabase
            .channel('rentals-realtime')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'rentals' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setRentals(prev => [payload.new, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setRentals(prev => prev.map(rental =>
                            rental.id === payload.new.id ? payload.new : rental
                        ))
                    } else if (payload.eventType === 'DELETE') {
                        setRentals(prev => prev.filter(rental => rental.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchRentals])

    // Categorize rentals
    const activeRentals = rentals.filter(r => r.status === 'active')
    const todayPickups = rentals.filter(r => {
        const today = new Date().toISOString().split('T')[0]
        return r.start_date === today && r.status === 'active'
    })
    const todayReturns = rentals.filter(r => {
        const today = new Date().toISOString().split('T')[0]
        return r.end_date === today && r.status === 'active'
    })

    return {
        rentals,
        activeRentals,
        todayPickups,
        todayReturns,
        loading,
        error,
        refetch: fetchRentals
    }
}

// Hook for today's schedule
export function useTodaySchedule() {
    const { rentals, todayPickups, todayReturns, loading, error, refetch } = useRentals({ todayOnly: true })

    const schedule = [
        ...todayPickups.map(r => ({ ...r, type: 'pickup' })),
        ...todayReturns.map(r => ({ ...r, type: 'return' }))
    ].sort((a, b) => {
        const timeA = a.type === 'pickup' ? a.start_time : a.end_time
        const timeB = b.type === 'pickup' ? b.start_time : b.end_time
        return (timeA || '00:00').localeCompare(timeB || '00:00')
    })

    return {
        schedule,
        pickupCount: todayPickups.length,
        returnCount: todayReturns.length,
        loading,
        error,
        refetch
    }
}

// Hook for customers
export function useCustomers() {
    const [customers, setCustomers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { cacheData, getCachedData } = useSync()

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true)

            if (!navigator.onLine) {
                const cached = await getCachedData('customers')
                if (cached?.value) {
                    setCustomers(cached.value)
                    return
                }
            }

            // Get unique customers from rentals with their stats
            const { data, error } = await supabase
                .from('rentals')
                .select('customer_name, customer_phone, total_amount, status, created_at')
                .order('created_at', { ascending: false })

            if (error) throw error

            // Aggregate customer data
            const customerMap = new Map()
            data?.forEach(rental => {
                const key = rental.customer_phone
                if (!customerMap.has(key)) {
                    customerMap.set(key, {
                        name: rental.customer_name,
                        phone: rental.customer_phone,
                        totalBookings: 0,
                        totalSpent: 0,
                        activeRentals: 0,
                        lastRental: rental.created_at
                    })
                }
                const customer = customerMap.get(key)
                customer.totalBookings++
                customer.totalSpent += rental.total_amount || 0
                if (rental.status === 'active') {
                    customer.activeRentals++
                }
            })

            const customerList = Array.from(customerMap.values())
                .sort((a, b) => b.totalBookings - a.totalBookings)

            setCustomers(customerList)
            await cacheData('customers', customerList)
        } catch (err) {
            setError(err.message)
            const cached = await getCachedData('customers')
            if (cached?.value) {
                setCustomers(cached.value)
            }
        } finally {
            setLoading(false)
        }
    }, [cacheData, getCachedData])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    return {
        customers,
        loading,
        error,
        refetch: fetchCustomers
    }
}

// Hook for dashboard stats
export function useDashboardStats() {
    const [stats, setStats] = useState({
        availableCars: 0,
        activeRentals: 0,
        monthlyRevenue: 0,
        totalCustomers: 0
    })
    const [loading, setLoading] = useState(true)
    const { cacheData, getCachedData } = useSync()

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)

            if (!navigator.onLine) {
                const cached = await getCachedData('dashboardStats')
                if (cached?.value) {
                    setStats(cached.value)
                    return
                }
            }

            // Fetch available cars count
            const { count: availableCars } = await supabase
                .from('cars')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'available')

            // Fetch active rentals count
            const { count: activeRentals } = await supabase
                .from('rentals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')

            // Fetch monthly revenue
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { data: monthlyRentals } = await supabase
                .from('rentals')
                .select('total_amount')
                .gte('created_at', startOfMonth.toISOString())

            const monthlyRevenue = monthlyRentals?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

            // Fetch unique customers count
            const { data: allRentals } = await supabase
                .from('rentals')
                .select('customer_phone')

            const uniqueCustomers = new Set(allRentals?.map(r => r.customer_phone))
            const totalCustomers = uniqueCustomers.size

            const newStats = {
                availableCars: availableCars || 0,
                activeRentals: activeRentals || 0,
                monthlyRevenue,
                totalCustomers
            }

            setStats(newStats)
            await cacheData('dashboardStats', newStats)
        } catch (err) {
            console.error('Error fetching stats:', err)
            const cached = await getCachedData('dashboardStats')
            if (cached?.value) {
                setStats(cached.value)
            }
        } finally {
            setLoading(false)
        }
    }, [cacheData, getCachedData])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        loading,
        refetch: fetchStats
    }
}

// Hook for payments/rentals with payment info
export function usePayments() {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalBilled: 0,
        collected: 0,
        outstanding: 0,
        paidCount: 0
    })
    const { cacheData, getCachedData } = useSync()

    const fetchPayments = useCallback(async () => {
        try {
            setLoading(true)

            if (!navigator.onLine) {
                const cached = await getCachedData('payments')
                if (cached?.value) {
                    setPayments(cached.value.payments)
                    setStats(cached.value.stats)
                    return
                }
            }

            const { data, error } = await supabase
                .from('rentals')
                .select(`
                    *,
                    cars (id, make, model, license_plate)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Calculate stats
            let totalBilled = 0
            let collected = 0
            let paidCount = 0

            data?.forEach(rental => {
                totalBilled += rental.total_amount || 0
                collected += rental.amount_paid || 0
                if (rental.payment_status === 'paid') paidCount++
            })

            const newStats = {
                totalBilled,
                collected,
                outstanding: totalBilled - collected,
                paidCount
            }

            setPayments(data || [])
            setStats(newStats)
            await cacheData('payments', { payments: data, stats: newStats })
        } catch (err) {
            console.error('Error fetching payments:', err)
            const cached = await getCachedData('payments')
            if (cached?.value) {
                setPayments(cached.value.payments)
                setStats(cached.value.stats)
            }
        } finally {
            setLoading(false)
        }
    }, [cacheData, getCachedData])

    useEffect(() => {
        fetchPayments()
    }, [fetchPayments])

    return {
        payments,
        stats,
        loading,
        refetch: fetchPayments
    }
}

