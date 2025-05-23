'use client'

import { useState, useEffect } from 'react'

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // İstanbul için hava durumu verisi
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Istanbul&units=metric&lang=tr&appid=${process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY}`
        )
        
        if (!response.ok) {
          throw new Error('Hava durumu verileri alınamadı')
        }

        const data = await response.json()
        setWeather(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchWeather()
    // Her 30 dakikada bir güncelle
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { weather, loading, error }
} 