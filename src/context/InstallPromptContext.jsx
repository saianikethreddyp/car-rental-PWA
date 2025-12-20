import { useState, useEffect, createContext, useContext } from 'react'

const InstallPromptContext = createContext({})

export const useInstallPrompt = () => useContext(InstallPromptContext)

export function InstallPromptProvider({ children }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true

        if (isStandalone) {
            setIsInstalled(true)
            return
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstall = (e) => {
            // Prevent Chrome 67+ from automatically showing the prompt
            e.preventDefault()
            // Save the event for later
            setDeferredPrompt(e)
            setIsInstallable(true)

            // Show banner after a short delay (not immediately on load)
            setTimeout(() => {
                // Only show if user hasn't dismissed before
                const dismissed = localStorage.getItem('pwa-install-dismissed')
                if (!dismissed) {
                    setShowBanner(true)
                }
            }, 3000)
        }

        // Listen for successful install
        const handleAppInstalled = () => {
            setIsInstalled(true)
            setIsInstallable(false)
            setShowBanner(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const promptInstall = async () => {
        if (!deferredPrompt) return false

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice

        // Clear the deferred prompt
        setDeferredPrompt(null)
        setShowBanner(false)

        return outcome === 'accepted'
    }

    const dismissBanner = () => {
        setShowBanner(false)
        localStorage.setItem('pwa-install-dismissed', 'true')
    }

    const value = {
        isInstallable,
        isInstalled,
        showBanner,
        promptInstall,
        dismissBanner
    }

    return (
        <InstallPromptContext.Provider value={value}>
            {children}
        </InstallPromptContext.Provider>
    )
}
