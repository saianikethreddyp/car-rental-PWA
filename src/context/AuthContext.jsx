import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                // For now, all users are treated as admins (full access)
                setUserRole({ role: 'admin', name: 'Administrator' })
            }
            setLoading(false)
        }).catch(err => {
            console.error('Session error:', err)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    // For now, all users are treated as admins (full access)
                    setUserRole({ role: 'admin', name: 'Administrator' })
                } else {
                    setUserRole(null)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        try {
            setLoading(true)
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            toast.success('Logged in successfully!')
            return { success: true }
        } catch (error) {
            toast.error(error.message || 'Failed to sign in')
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setUserRole(null)
            toast.success('Logged out')
        } catch (error) {
            toast.error('Failed to sign out')
        }
    }

    const value = {
        user,
        userRole,
        loading,
        signIn,
        signOut,
        isAdmin: true, // All users have full access
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
