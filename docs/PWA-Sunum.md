# Next.js ile PWA ve Push Notifications

## 1. Progressive Web Apps (PWA) Nedir?

PWA, web uygulamalarını native (yerel) uygulama deneyimine yaklaştıran modern web teknolojisidir.

### PWA'nın Temel Özellikleri:
- 📱 Yüklenebilir
- 🔄 Çevrimdışı Çalışabilir
- 🔔 Push Bildirimler
- 🚀 Hızlı Yükleme
- 🔒 Güvenli (HTTPS)

## 2. Service Worker Nedir?

Service Worker, PWA'ların temel yapı taşıdır ve arka planda çalışan bir JavaScript dosyasıdır.

### Service Worker'ın Görevleri:
- Önbellekleme (Caching)
- Push Bildirimleri
- Arka Plan Senkronizasyonu
- Çevrimdışı Çalışma

### Service Worker Yaşam Döngüsü:
1. **Kayıt (Register)**
   ```javascript
   navigator.serviceWorker.register('/sw.js')
   ```

2. **Yükleme (Install)**
   ```javascript
   self.addEventListener('install', (event) => {
     // Önbelleğe alma işlemleri
   })
   ```

3. **Aktifleştirme (Activate)**
   ```javascript
   self.addEventListener('activate', (event) => {
     // Eski önbellekleri temizleme
   })
   ```

## 3. Push Notifications Nasıl Çalışır?

### Adım 1: İzin Alma
```javascript
Notification.requestPermission()
  .then((permission) => {
    if (permission === 'granted') {
      // Bildirim gösterebiliriz
    }
  })
```

### Adım 2: Service Worker Kaydetme
```javascript
navigator.serviceWorker.register('/sw.js')
  .then((registration) => {
    // Service Worker hazır
  })
```

### Adım 3: Bildirim Gönderme
```javascript
registration.showNotification('Başlık', {
  body: 'Bildirim içeriği'
})
```

## 4. Örnek Uygulamamızın Yapısı

### Temel Bileşenler:
1. **manifest.json**
   - Uygulama meta verileri
   - İkonlar
   - Başlangıç URL'i

2. **sw.js (Service Worker)**
   - Önbellekleme stratejisi
   - Push notification yönetimi
   - Çevrimdışı çalışma mantığı

3. **Next.js Konfigürasyonu**
   ```javascript
   // next.config.mjs
   import withPWA from '@ducanh2912/next-pwa'

   export default withPWA({
     dest: 'public',
     register: true,
     skipWaiting: true
   })(config)
   ```

## 5. Best Practices

### PWA Geliştirirken Dikkat Edilecekler:
- ✅ Service Worker scope'unu doğru ayarlama
- ✅ Önbellek stratejisini belirleme
- ✅ Bildirim izinlerini doğru yönetme
- ✅ Hata durumlarını ele alma
- ✅ Kullanıcı deneyimini optimize etme

### Yaygın Hatalar:
- ❌ Service Worker'ı yanlış konumlandırma
- ❌ Gereksiz önbellekleme yapma
- ❌ Bildirim izinlerini zorla isteme
- ❌ Hata yönetimini ihmal etme

## 6. Demo Uygulamamızın Özellikleri

### Hava Durumu PWA:
1. **Yüklenebilir Uygulama**
   - Masaüstüne eklenebilir
   - App launcher'da görünür

2. **Push Notifications**
   - Hava durumu güncellemeleri
   - Test bildirimleri

3. **Çevrimdışı Çalışma**
   - Temel verileri önbellekleme
   - Bağlantı koptuğunda çalışmaya devam etme

## 7. Kaynaklar ve İleri Okuma

- [Next.js PWA Dokümantasyonu](https://nextjs.org/docs)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [PWA Checklist](https://web.dev/pwa-checklist/) 