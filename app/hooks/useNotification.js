'use client'

import { useState, useEffect } from 'react'

export function useNotification() {
  const [permission, setPermission] = useState('default')
  const [swRegistration, setSwRegistration] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let timeoutId;

    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('Service Worker kaydı başlatılıyor...')
          
          // Önce mevcut Service Worker'ları temizle
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (let registration of registrations) {
            await registration.unregister()
            console.log('Eski Service Worker kaldırıldı')
          }

          // Yeni Service Worker'ı kaydet
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker kaydedildi, durum:', registration.active ? 'aktif' : 'aktif değil')

          // Service Worker durumunu kontrol et
          if (registration.installing) {
            console.log('Service Worker yükleniyor...')
            registration.installing.addEventListener('statechange', (e) => {
              console.log('Service Worker durumu:', e.target.state)
              if (e.target.state === 'activated') {
                console.log('Service Worker aktif hale geldi!')
                setSwRegistration(registration)
                setIsReady(true)
              }
            })
          } else if (registration.waiting) {
            console.log('Service Worker beklemede...')
          } else if (registration.active) {
            console.log('Service Worker zaten aktif!')
            setSwRegistration(registration)
            setIsReady(true)
          }

          // Service Worker aktivasyonunu bekle
          navigator.serviceWorker.ready.then((registration) => {
            console.log('Service Worker hazır!')
            setSwRegistration(registration)
            setIsReady(true)
          })

        } catch (error) {
          console.error('Service Worker kaydı başarısız:', error)
        }
      } else {
        console.log('Service Worker bu tarayıcıda desteklenmiyor')
      }
    }

    // Sayfa yüklendiğinde Service Worker'ı kaydet
    registerSW()

    // Component unmount olduğunda
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (swRegistration) {
        swRegistration.unregister().then(() => {
          console.log('Service Worker kaldırıldı')
        })
      }
    }
  }, [])

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      console.log('Mevcut bildirim izni:', Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirim desteği sunmuyor')
      return
    }

    try {
      console.log('Bildirim izni isteniyor...')
      const permission = await Notification.requestPermission()
      console.log('Bildirim izni sonucu:', permission)
      setPermission(permission)

      if (permission === 'granted') {
        console.log('Bildirim izni verildi, Service Worker kontrolü yapılıyor...')
        if (!isReady) {
          console.log('Service Worker henüz hazır değil, lütfen bekleyin...')
        }
      }
    } catch (error) {
      console.error('Bildirim izni alınamadı:', error)
    }
  }

  const sendTestNotification = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service Worker desteklenmiyor')
      return
    }

    if (!isReady) {
      alert('Service Worker henüz hazır değil. Lütfen birkaç saniye bekleyin.')
      console.log('Service Worker durumu:', swRegistration ? 'kayıtlı ama hazır değil' : 'kayıtlı değil')
      return
    }

    try {
      if (!swRegistration) {
        throw new Error('Service Worker kaydı bulunamadı')
      }

      console.log('Test bildirimi gönderiliyor...')
      await swRegistration.showNotification('Test Bildirimi', {
        body: 'Bu bir test bildirimidir!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '1'
        }
      })
      console.log('Test bildirimi gönderildi!')
    } catch (error) {
      console.error('Test bildirimi gönderilemedi:', error)
      alert('Bildirim gönderilemedi: ' + error.message)
    }
  }

  const sendNotification = async (title, options = {}) => {
    if (!('Notification' in window) || permission !== 'granted' || !isReady) {
      console.log('Bildirim gönderilemedi:', {
        notificationSupport: 'Notification' in window,
        permission,
        isReady
      })
      return
    }

    try {
      if (swRegistration) {
        await swRegistration.showNotification(title, {
          icon: '/icons/icon-192x192.png',
          ...options,
        })
      }
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error)
    }
  }

  return {
    permission,
    requestNotificationPermission,
    sendNotification,
    sendTestNotification,
    isReady
  }
} 