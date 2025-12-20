import { useInstallPrompt } from '../context/InstallPromptContext'
import { Download, X, Smartphone } from 'lucide-react'

export function InstallBanner() {
    const { showBanner, promptInstall, dismissBanner, isInstalled } = useInstallPrompt()

    if (!showBanner || isInstalled) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down safe-area-top">
            <div className="m-4 p-4 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 shadow-xl">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">Install Dhanya Fleet</h3>
                        <p className="text-sm text-white/80 mt-0.5">
                            Add to home screen for quick access & offline support
                        </p>
                    </div>
                    <button
                        onClick={dismissBanner}
                        className="p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5 text-white/70" />
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={dismissBanner}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-medium text-sm"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={promptInstall}
                        className="flex-1 py-2.5 rounded-xl bg-white text-primary-600 font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Install
                    </button>
                </div>
            </div>
        </div>
    )
}

// Button for Settings page
export function InstallButton() {
    const { isInstallable, isInstalled, promptInstall } = useInstallPrompt()

    if (isInstalled) {
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                <span className="flex items-center gap-3 text-green-400">
                    <Smartphone className="w-5 h-5" />
                    App Installed
                </span>
                <span className="text-xs text-green-400/70">✓</span>
            </div>
        )
    }

    if (!isInstallable) {
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-700/50">
                <span className="flex items-center gap-3 text-dark-400">
                    <Smartphone className="w-5 h-5" />
                    Install App
                </span>
                <span className="text-xs text-dark-500">Use browser menu</span>
            </div>
        )
    }

    return (
        <button
            onClick={promptInstall}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-600/20 border border-primary-600/30 hover:bg-primary-600/30 transition-colors"
        >
            <span className="flex items-center gap-3 text-primary-400">
                <Download className="w-5 h-5" />
                Install App
            </span>
            <span className="text-xs text-primary-400/70">Add to Home Screen</span>
        </button>
    )
}
