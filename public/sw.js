// Service Worker versiyonu
const CACHE_NAME = 'weather-app-v1'

console.log('Service Worker yükleniyor...')

// Önbelleğe alınacak dosyalar
const urlsToCache = [
  '/',
  '/manifest.json'
]

// İsteğin önbelleğe alınabilir olup olmadığını kontrol et
const isRequestCacheable = (request) => {
  const url = new URL(request.url)
  return (
    // Sadece HTTP ve HTTPS isteklerini önbelleğe al
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    // GET isteklerini önbelleğe al
    request.method === 'GET' &&
    // API isteklerini önbelleğe alma
    !url.pathname.startsWith('/api/')
  )
}

// Service Worker'ı hemen aktif et
self.addEventListener('install', (event) => {
  console.log('Service Worker kurulum aşamasında')
  event.waitUntil(
    Promise.all([
      self.skipWaiting().then(() => {
        console.log('skipWaiting tamamlandı')
      }),
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log('Cache açıldı')
        try {
          await cache.addAll(urlsToCache)
          console.log('Tüm dosyalar cache\'e eklendi')
        } catch (error) {
          console.error('Cache ekleme hatası:', error)
        }
      })
    ])
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker aktifleştiriliyor')
  event.waitUntil(
    Promise.all([
      self.clients.claim().then(() => {
        console.log('clients.claim() tamamlandı')
      }),
      // Eski cache'leri temizle
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Eski cache siliniyor:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
    ]).then(() => {
      console.log('Service Worker tamamen aktif!')
    })
  )
})

// Ağ isteklerini yakalama
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini ve HTTP/HTTPS protokollerini işle
  if (!isRequestCacheable(event.request)) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Önbellekte varsa, önbellekten döndür
      if (response) {
        return response
      }

      // Önbellekte yoksa, ağdan al
      return fetch(event.request).then((response) => {
        // Geçersiz yanıtları önbelleğe alma
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        try {
          // Yanıtı önbelleğe al
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
            console.log('İstek önbelleğe alındı:', event.request.url)
          })
        } catch (error) {
          console.error('Önbelleğe alma hatası:', error)
        }

        return response
      })
    })
  )
})

// Push notification olayını dinle
self.addEventListener('push', (event) => {
  console.log('Push event alındı:', event)
  const options = {
    body: event.data ? event.data.text() : 'Yeni bir bildirim!',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  }

  event.waitUntil(
    self.registration.showNotification('Hava Durumu Bildirimi', options)
      .then(() => {
        console.log('Bildirim başarıyla gösterildi')
      })
      .catch((error) => {
        console.error('Bildirim gösterilirken hata:', error)
      })
  )
})

// Bildirime tıklanma olayını dinle
self.addEventListener('notificationclick', (event) => {
  console.log('Bildirime tıklandı')
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
      .then(() => {
        console.log('Sayfa açıldı')
      })
  )
}) 