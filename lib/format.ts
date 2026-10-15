const LOCALE = "tr-TR";
/** Sunucu UTC çalışır; tüm saat/tarih gösterimleri İstanbul saatiyle. */
const TZ = "Europe/Istanbul";

export function money(value: number, fractionDigits = 0): string {
  return (
    "₺" +
    value.toLocaleString(LOCALE, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  );
}

export function num(value: number, fractionDigits = 0): string {
  return value.toLocaleString(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** 0.087 -> "%8,7" */
export function pct(ratio: number, fractionDigits = 1): string {
  return "%" + num(ratio * 100, fractionDigits);
}

/** a / b, b sıfırsa null */
export function ratio(a: number, b: number): number | null {
  return b === 0 ? null : a / b;
}

export function dayOfMonth(isoDate: string): string {
  return String(new Date(isoDate + "T00:00:00").getDate());
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(LOCALE, { day: "numeric", month: "short", timeZone: TZ });
}

export function dateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

/** "12 dk", "1 sa", "Dün", "3 gün" */
export function since(iso: string, now: Date = new Date()): string {
  const mins = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} dk`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} sa`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Dün" : `${days} gün`;
}

/** Bekleme süresine göre renk sınıfı: 1 saatten uzun turuncu, 2 saatten uzun kırmızı. */
export function waitTone(iso: string, now: Date = new Date()): "neutral" | "warn" | "down" {
  const mins = (now.getTime() - new Date(iso).getTime()) / 60000;
  if (mins >= 120) return "down";
  if (mins >= 60) return "warn";
  return "neutral";
}

export function longToday(now: Date = new Date()): string {
  return now.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}
