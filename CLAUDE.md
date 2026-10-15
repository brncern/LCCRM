# LawChat CRM — Claude için proje notları

## Ne bu?
LawChat'in sahibinin kendi pazarlamasını takip ettiği tek kullanıcılı CRM. Kullanıcıyla Türkçe konuş.
Dönüşüm tanımı: **ücretli abone** (kayıt değil, avukata yönlendirme değil).

## Kararlar
- Next.js App Router + TypeScript, Supabase (Postgres + giriş), Vercel'de yayın.
- Stil: düz CSS (`app/globals.css`), ek UI kütüphanesi yok. Tasarım dili macOS / iOS 27:
  buzlu cam pencere, Apple sistem fontu, sistem renkleri. Metin renkleri 4.5:1 kontrast için
  koyulaştırılmış (`--blue-text` vb.); dolgularda `--blue`, `--orange` vb. kullan.
- Erişilebilirlik: `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` desteklenir; koru.
- Veri katmanı `lib/data/index.ts`: Supabase yoksa ya da tablo boşsa örnek veri döner ve `sample: true` olur;
  ekranlar "Örnek veri" etiketini buna göre gösterir. Yeni veri kaynağı eklerken bu sözleşmeyi koru.
- Lead / müşteri sayıları CRM'deki `leads` tablosundan gelir, reklam platformunun saydığından değil.
- Güvenlik: tüm tablolarda RLS, sadece `app_admins` listesindeki e-postalar. Giriş e-posta bağlantısıyla,
  yeni hesap açılmaz. Service role anahtarı sadece sunucuda (senkron işleri, webhook'lar).

## Komutlar
- `npm run dev` — geliştirme sunucusu
- `npm run build` — üretim derlemesi (değişiklikten sonra çalıştır)
- `npm run typecheck` — tip kontrolü

## Yol haritası
1. [x] Temel: tasarım sistemi, 6 ekran, şema, giriş
2. [~] Reklamlar: Meta senkronu yazıldı (`lib/sync/meta.ts`, `/api/cron/sync`, "Şimdi güncelle" düğmesi). Vercel Hobby planında cron günde 1 kez (06:00 İstanbul). Google Ads bekliyor (developer token).
3. [ ] Gelen kutusu: Meta webhook'ları (Messenger, Instagram), WhatsApp Cloud API → `conversations`, `messages`; reklam id'sinden kampanya eşleme; buradan yanıt gönderme
4. [ ] Dönüşüm: ödeme sağlayıcısından `subscriptions`; UTM / click id ile lead ve kampanyaya bağlama
5. [ ] Sosyal medya (Meta sayfa/IG içgörüleri, LinkedIn) ve Grafana API

## Notlar
- Yayın: Vercel projesi `lccrm` (ekip law-chat), adres https://lccrm-law-chat.vercel.app. Supabase projesi `degrnyqtbwdzzpvhwzxj` (eu-west-2).
- Kullanıcı teknik değil: terminal/komut isteme, adımları tıklama düzeyinde anlat.
- 1. aşama npm erişimi olmayan bir ortamda yazıldı; ilk `npm install && npm run build` burada yapılmalı ve çıkan hatalar düzeltilmeli.
- Onaylanan tasarım bir Claude Design tuvalinde (macOS / iOS 27 sayfası); ekranlar ona birebir uymalı.
