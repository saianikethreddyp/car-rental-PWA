import { useInstallPrompt } from '../context/InstallPromptContext'
import { Download, X, Smartphone } from 'lucide-react'

export function InstallBanner() {
    const { showBanner, promptInstall, dismissBanner, isInstalled } = useInstallPrompt()

    if (!showBanner || isInstalled) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-slide-down safe-area-top">
            <div className="m-4 p-4 rounded-2xl bg-black text-white shadow-xl">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white">Install Dhanya Fleet</h3>
                        <p className="text-sm text-neutral-400 mt-0.5">
                            Add to home screen for quick access & offline support
                        </p>
                    </div>
                    <button
                        onClick={dismissBanner}
                        className="p-1 rounded-full hover:bg-neutral-800"
                    >
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={dismissBanner}
                        className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-white font-medium text-sm"
                    >
                        Not Now
                    </button>
                    <button
                        onClick={promptInstall}
                        className="flex-1 py-2.5 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2"
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="flex items-center gap-3 text-green-700 font-medium">
                    <Smartphone className="w-5 h-5" />
                    App Installed
                </span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">INSTALLED</span>
            </div>
        )
    }

    if (!isInstallable) {
        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100">
                <span className="flex items-center gap-3 text-neutral-500 font-medium">
                    <Smartphone className="w-5 h-5" />
                    Install App
                </span>
                <span className="text-xs text-neutral-400">Use browser menu</span>
            </div>
        )
    }

    return (
        <button
            onClick={promptInstall}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-black text-white hover:bg-neutral-800 transition-colors"
        >
            <span className="flex items-center gap-3 font-bold">
                <Download className="w-5 h-5" />
                Install App
            </span>
            <span className="text-xs text-neutral-400">Add to Home Screen</span>
        </button>
    )
}
