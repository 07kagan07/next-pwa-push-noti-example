'use client'

import { useState, useEffect } from 'react'
import { useWeather } from './hooks/useWeather'
import { useNotification } from './hooks/useNotification'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" />
    </div>
  )
}

function ErrorDisplay({ message }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-red-600">{message}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const { weather, loading, error } = useWeather()
  const { requestNotificationPermission, sendTestNotification } = useNotification()
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    setMounted(true)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
    }
  }

  // İlk render'da boş div döndür
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600" />
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">Hava Durumu</h1>
            <div className="flex flex-wrap gap-2 justify-center">
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Uygulamayı Yükle
                </button>
              )}
              <button
                onClick={requestNotificationPermission}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Bildirimleri Aç
              </button>
              <button
                onClick={sendTestNotification}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Test Bildirimi
              </button>
            </div>
          </div>

          {weather && (
            <div className="text-center">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                {Math.round(weather.main.temp)}°C
              </h2>
              <p className="text-2xl text-gray-600 mb-8 capitalize">
                {weather.weather[0].description}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-2">Nem</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {weather.main.humidity}%
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-2">Rüzgar</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {weather.wind.speed} m/s
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
