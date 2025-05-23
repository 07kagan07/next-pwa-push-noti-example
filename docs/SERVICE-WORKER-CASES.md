# Service Worker ve Push Notifications - Detaylı Analiz

## 1. Service Worker Yaşam Döngüsü

### 1.1 Kayıt Süreci
```javascript
// useNotification.js'den
const registerSW = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
  }
}
```

**Senaryolar:**
- ✅ Başarılı Kayıt: Service Worker başarıyla kaydedilir
- ❌ Kayıt Hatası: Tarayıcı desteklemiyor veya HTTPS gerekiyor
- 🔄 Güncelleme: Mevcut SW varsa, yeni versiyon kontrolü

### 1.2 Kurulum Aşaması
```javascript
// sw.js'den
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      self.skipWaiting(),
      caches.open(CACHE_NAME).then(async (cache) => {
        await cache.addAll(urlsToCache)
      })
    ])
  )
})
```

**Senaryolar:**
- ✅ Önbellek Başarılı: Tüm dosyalar cache'e eklenir
- ❌ Önbellek Hatası: Dosyalar bulunamadı veya ağ hatası
- 🔄 Versiyon Değişimi: Yeni SW beklemeden aktif olur

### 1.3 Aktivasyon Aşaması
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Eski cache'leri temizle
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      })
    ])
  )
})
```

**Senaryolar:**
- ✅ Temiz Aktivasyon: Eski cache'ler temizlenir
- ❌ Cache Temizleme Hatası: Eski veriler kalabilir
- 🔄 Sayfa Kontrolü: Tüm açık sayfalar yeni SW'ye bağlanır

## 2. Önbellekleme Stratejileri

### 2.1 İstek Kontrolü
```javascript
const isRequestCacheable = (request) => {
  const url = new URL(request.url)
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    request.method === 'GET' &&
    !url.pathname.startsWith('/api/')
  )
}
```

**Senaryolar:**
- ✅ Cache'lenebilir İstek: HTTP/HTTPS GET istekleri
- ❌ Cache'lenemeyen İstek: API çağrıları, POST istekleri
- 🔄 Protokol Kontrolü: Sadece güvenli istekler

### 2.2 Fetch Stratejisi
```javascript
self.addEventListener('fetch', (event) => {
  if (!isRequestCacheable(event.request)) return

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response // Cache Hit
      
      return fetch(event.request).then((response) => {
        // Cache Miss -> Ağdan Al ve Cache'e Ekle
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      })
    })
  )
})
```

**Senaryolar:**
- ✅ Cache Hit: İstek önbellekte bulunur
- ❌ Cache Miss: Ağdan yeni veri çekilir
- 🔄 Önbellek Güncelleme: Yeni veri önbelleğe alınır

## 3. Push Notifications

### 3.1 İzin Yönetimi
```javascript
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('Bu tarayıcı bildirim desteği sunmuyor')
    return
  }

  try {
    const permission = await Notification.requestPermission()
    setPermission(permission)
  } catch (error) {
    console.error('Bildirim izni alınamadı:', error)
  }
}
```

**Senaryolar:**
- ✅ İzin Verildi: Bildirimler gösterilebilir
- ❌ İzin Reddedildi: Bildirim gösterilemez
- 🔄 Beklemede: Kullanıcı henüz karar vermedi

### 3.2 Bildirim Gönderme
```javascript
const sendTestNotification = async () => {
  if (!swRegistration) {
    throw new Error('Service Worker kaydı bulunamadı')
  }

  await swRegistration.showNotification('Test Bildirimi', {
    body: 'Bu bir test bildirimidir!',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  })
}
```

**Senaryolar:**
- ✅ Bildirim Gösterildi: Kullanıcı bildirimi görür
- ❌ Gösterim Hatası: SW kaydı yok veya izin yok
- 🔄 Etkileşim: Kullanıcı bildirime tıklar

### 3.3 Bildirim Etkileşimi
```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})
```

**Senaryolar:**
- ✅ Tıklama İşlemi: Uygulama açılır
- ❌ Kapatma: Bildirim kapatılır
- 🔄 Yönlendirme: İlgili sayfaya gidilir

## 4. Hata Durumları ve Çözümleri

### 4.1 Service Worker Hataları
- 🔴 **SW Kayıt Hatası**
  - Sebep: HTTPS gereksinimi
  - Çözüm: Localhost veya HTTPS kullan

- 🔴 **Cache Hatası**
  - Sebep: Dosya bulunamadı
  - Çözüm: URL'leri kontrol et

- 🔴 **Aktivasyon Hatası**
  - Sebep: Eski SW aktif
  - Çözüm: skipWaiting() kullan

### 4.2 Push Notification Hataları
- 🔴 **İzin Hatası**
  - Sebep: Kullanıcı reddetmiş
  - Çözüm: Tekrar izin isteme stratejisi

- 🔴 **Gösterim Hatası**
  - Sebep: SW kaydı eksik
  - Çözüm: SW durumunu kontrol et

- 🔴 **Etkileşim Hatası**
  - Sebep: URL açılamadı
  - Çözüm: Fallback URL tanımla

## 5. Best Practices

### 5.1 Service Worker
- ✅ Versiyon kontrolü yap
- ✅ Önbellek stratejisini belirle
- ✅ Hata yönetimini implement et
- ✅ Gereksiz cache'leri temizle
- ✅ Performance monitoring ekle

### 5.2 Push Notifications
- ✅ Kullanıcı dostu izin isteme
- ✅ Bildirim içeriği özelleştirme
- ✅ Etkileşim takibi
- ✅ Zamanlama stratejisi
- ✅ Fallback mekanizması 