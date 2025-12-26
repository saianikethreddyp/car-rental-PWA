import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Car, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { InstallBanner } from '../components/InstallPrompt'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) return

        setIsLoading(true)
        const result = await signIn(email, password)
        setIsLoading(false)

        if (result.success) {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
            {/* PWA Install Banner for new users */}
            <InstallBanner />
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-10">
                    <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center mb-6 shadow-xl shadow-neutral-200">
                        <Car className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-black tracking-tight mb-2">Welcome back</h1>
                    <p className="text-neutral-500 text-lg">Sign in to continue</p>
                </div>

                {/* Login form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-neutral-900 ml-1">Email</label>
                        <input
                            type="email"
                            className="w-full bg-neutral-100 border-none rounded-xl p-4 text-lg font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-black/5 transition-all text-black"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-neutral-900 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-neutral-100 border-none rounded-xl p-4 pr-12 text-lg font-medium placeholder:text-neutral-400 focus:ring-2 focus:ring-black/5 transition-all text-black"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-black transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !password}
                        className="w-full bg-black text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 mt-4"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-neutral-400 text-sm">
                        Don't have an account? <span className="text-black font-semibold">Contact Admin</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
