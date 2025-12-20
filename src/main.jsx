import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { SyncProvider } from './context/SyncContext.jsx'
import { InstallPromptProvider } from './context/InstallPromptContext.jsx'
import { Toaster } from 'react-hot-toast'
import { registerSW } from 'virtual:pwa-register'

// Register service worker for PWA
const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New version available! Reload to update?')) {
            updateSW(true)
        }
    },
    onOfflineReady() {
        console.log('App ready for offline use')
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <InstallPromptProvider>
                <AuthProvider>
                    <SyncProvider>
                        <App />
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: '#1e293b',
                                    color: '#f1f5f9',
                                    border: '1px solid rgba(148, 163, 184, 0.1)',
                                    borderRadius: '12px',
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#22c55e',
                                        secondary: '#f1f5f9',
                                    },
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#ef4444',
                                        secondary: '#f1f5f9',
                                    },
                                },
                            }}
                        />
                    </SyncProvider>
                </AuthProvider>
            </InstallPromptProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
