import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { Camera, Upload, X, Check, RefreshCw } from 'lucide-react'

/**
 * DocumentUpload - Mobile-optimized document capture component
 * Supports file upload and camera capture for PAN, Aadhar, License
 */
export function DocumentUpload({
    label,
    docType, // 'pan' | 'aadhar' | 'license'
    onUpload, // callback with uploaded URL
    existingUrl = null
}) {
    const [preview, setPreview] = useState(existingUrl)
    const [uploading, setUploading] = useState(false)
    const [cameraActive, setCameraActive] = useState(false)

    const fileInputRef = useRef(null)
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const streamRef = useRef(null)

    // Start camera
    const startCamera = async () => {
        try {
            setCameraActive(true)

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            })

            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
            console.error('Camera access error:', err)
            alert('Unable to access camera. Please check permissions or use file upload.')
            setCameraActive(false)
        }
    }

    // Stop camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        setCameraActive(false)
    }

    // Capture photo from camera
    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current
            const canvas = canvasRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0)

            canvas.toBlob(async (blob) => {
                if (blob) {
                    await uploadToSupabase(blob)
                }
            }, 'image/jpeg', 0.8)

            stopCamera()
        }
    }

    // Handle file selection
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (file) {
            await uploadToSupabase(file)
        }
    }

    // Upload to Supabase Storage
    const uploadToSupabase = async (fileOrBlob) => {
        try {
            setUploading(true)

            const fileName = `${docType}_${Date.now()}.jpg`
            const filePath = `rentals/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, fileOrBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onUpload(publicUrl)

        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload document. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    // Remove uploaded document
    const removeDocument = () => {
        setPreview(null)
        onUpload(null)
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-dark-300">{label}</label>

            {/* Preview Mode */}
            {preview && !cameraActive && (
                <div className="relative rounded-xl overflow-hidden border border-dark-600">
                    <img
                        src={preview}
                        alt={label}
                        className="w-full h-32 object-cover bg-dark-700"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 active:opacity-100 flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setPreview(null)
                                startCamera()
                            }}
                            className="p-2 rounded-full bg-dark-700/80 text-white"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={removeDocument}
                            className="p-2 rounded-full bg-red-600/80 text-white"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check size={12} />
                    </div>
                </div>
            )}

            {/* Camera Mode */}
            {cameraActive && (
                <div className="relative rounded-xl overflow-hidden border border-dark-600">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-48 object-cover bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                        <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-2 rounded-full bg-white text-black font-medium flex items-center gap-2"
                        >
                            <Camera size={16} />
                            Capture
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 rounded-full bg-dark-700 text-white font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Initial State - Choose Mode */}
            {!preview && !cameraActive && (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={startCamera}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 active:border-primary-500 active:bg-primary-500/10 transition-colors"
                    >
                        <Camera size={18} />
                        <span className="text-sm">Camera</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-dark-600 rounded-xl text-dark-400 active:border-primary-500 active:bg-primary-500/10 transition-colors"
                    >
                        <Upload size={18} />
                        <span className="text-sm">{uploading ? 'Uploading...' : 'Upload'}</span>
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>
            )}
        </div>
    )
}
