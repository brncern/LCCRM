# LawChat CRM

LawChat'in pazarlamasını tek ekrandan takip etmek için kişisel CRM: Meta ve Google reklamları, Messenger / Instagram / WhatsApp gelen kutusu, lead hattı, sosyal medya özeti ve Grafana'daki ürün metrikleri. Dönüşüm = **ücretli abone**.

Tasarım dili macOS / iOS 27: buzlu cam pencere, Apple sistem fontu, sistem renkleri.

## Hızlı başlangıç (örnek veriyle)

```bash
npm install
npm run dev
```

`http://localhost:3000` adresini aç. `.env.local` yoksa uygulama **örnek veri modunda** girişsiz çalışır; her ekranda "Örnek veri" etiketi görünür.

## Gerçek veriye geçiş

### 1. Supabase

1. [supabase.com](https://supabase.com) üzerinde yeni bir proje aç.
2. **SQL Editor**'da `supabase/migrations/0001_init.sql` dosyasının içeriğini çalıştır.
3. Aynı yerde kendi e-postanı yetkili olarak ekle:
   ```sql
   insert into app_admins (email) values ('sen@ornek.com');
   ```
4. **Authentication → URL Configuration**'da Site URL'yi uygulamanın adresine, Redirect URL'lere `https://<adres>/auth/callback` ekle.
5. `.env.example` dosyasını `.env.local` olarak kopyala ve Supabase değerlerini doldur:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_EMAILS`, `NEXT_PUBLIC_SITE_URL`.

Supabase ayarlanınca giriş zorunlu olur. Tablolar boşken ekranlar örnek veriyi göstermeye devam eder, veri geldikçe gerçek rakamlar görünür.

### 2. Vercel'e yayın

1. [vercel.com](https://vercel.com) → **Add New Project** → bu repoyu seç.
2. Ortam değişkenlerini (`.env.local` içindekiler) Vercel'e de gir.
3. Deploy. Sonra Supabase'deki Site URL'yi Vercel adresiyle güncelle.

## Yapı

```
app/
  (app)/            Pencere + kenar çubuğu olan ekranlar
    page.tsx        Genel Bakış
    inbox/          Gelen Kutusu
    leads/          Lead Hattı
    ads/            Reklamlar
    social/         Sosyal Medya
    system/         Sistem (Grafana)
  login/            Giriş (e-posta bağlantısı)
  auth/callback/    Giriş dönüşü
  actions.ts        Sunucu işlemleri (lead aşaması, okundu)
components/         Kenar çubuğu, kartlar, grafikler, ikonlar
lib/
  data/index.ts     Veri katmanı (Supabase yoksa örnek veri)
  data/sample.ts    Örnek veri
  supabase/         Supabase istemcileri
supabase/migrations Veritabanı şeması
middleware.ts       Giriş kontrolü
```

## Yol haritası

- [x] **1. Temel** — tasarım sistemi, tüm ekranlar, veritabanı şeması, giriş
- [ ] **2. Reklamlar** — Meta Marketing API ve Google Ads API'den saatlik senkron
- [ ] **3. Gelen kutusu** — Meta webhook'ları (Messenger, Instagram), WhatsApp Cloud API, buradan yanıt verme
- [ ] **4. Dönüşüm** — ödeme sisteminden ücretli abonelikler, reklam tıklamasıyla eşleştirme
- [ ] **5. Sosyal medya ve Grafana** — sayfa/hesap metrikleri, Grafana panelleri

## Gerekecek erişimler

| Aşama | Ne lazım |
| --- | --- |
| 2 | Google Ads API developer token (onay birkaç gün sürebilir), OAuth istemcisi; Meta uygulaması ve reklam hesabı erişimi |
| 3 | Meta uygulama incelemesi: Messenger ve Instagram mesaj izinleri; WhatsApp Business Cloud API |
| 4 | Ödeme sağlayıcısı (Stripe / iyzico / App Store / Google Play) erişimi |
| 5 | Grafana adresi ve servis hesabı anahtarı |
