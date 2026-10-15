/**
 * Örnek veri — onaylanan tasarımdaki rakamlarla birebir.
 * Gerçek kaynak (Supabase) bağlı değilken ekranlar bunu gösterir ve "Örnek veri" etiketi çıkar.
 * Tarihler her zaman bugüne göre üretilir, böylece ekran güncel görünür.
 */
import type {
  Campaign,
  Conversation,
  DailySpend,
  Lead,
  MetricSeries,
  PlannedPost,
  SocialAccount,
  SystemStatus,
  TopPost,
} from "../types";

const DAY = 86_400_000;

function isoDay(offsetDays: number, now = new Date()): string {
  const d = new Date(now.getTime() - offsetDays * DAY);
  return d.toISOString().slice(0, 10);
}
function minutesAgo(mins: number, now = new Date()): string {
  return new Date(now.getTime() - mins * 60_000).toISOString();
}

const META_DAILY = [2100, 2250, 2400, 2180, 1950, 2300, 2500, 2350, 2200, 2150, 2400, 2280, 2190, 2150];
const GOOGLE_DAILY = [1150, 1200, 1250, 1100, 1050, 1180, 1300, 1250, 1200, 1180, 1260, 1220, 1300, 1210];

export function sampleDailySpend(): DailySpend[] {
  return META_DAILY.map((meta, i) => ({
    date: isoDay(META_DAILY.length - 1 - i),
    meta,
    google: GOOGLE_DAILY[i]!,
  }));
}

export const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: "c1", platform: "meta", name: "Kira Hukuku — Ekim", status: "active", spend: 13220, impressions: 128000, clicks: 3100, leads: 118, customers: 12 },
  { id: "c2", platform: "google", name: "Arama — avukata sor", status: "active", spend: 10950, impressions: 78000, clicks: 2460, leads: 74, customers: 8 },
  { id: "c3", platform: "meta", name: "İş Hukuku — Reels", status: "active", spend: 11800, impressions: 104000, clicks: 2240, leads: 69, customers: 5 },
  { id: "c4", platform: "google", name: "Arama — boşanma", status: "limited", spend: 5900, impressions: 41000, clicks: 1060, leads: 30, customers: 2 },
  { id: "c5", platform: "meta", name: "Retargeting — site", status: "active", spend: 6380, impressions: 61000, clicks: 980, leads: 21, customers: 0 },
];

/** Gösterim → tıklama kampanyalardan; mesaj sayısı reklam platformunda yok, gelen kutusundan gelir. */
export const SAMPLE_MESSAGES_FROM_ADS = 486;
export const SAMPLE_QUALIFIED = 94;

export function sampleConversations(now = new Date()): Conversation[] {
  const c = (
    id: string,
    name: string,
    channel: Conversation["channel"],
    topic: string,
    campaignName: string | null,
    adName: string | null,
    stage: Conversation["stage"],
    unread: boolean,
    firstMinsAgo: number,
    messages: Array<[boolean, string, number]>,
  ): Conversation => ({
    id,
    leadId: null,
    name,
    channel,
    topic,
    campaignName,
    adName,
    stage,
    unread,
    firstContactAt: minutesAgo(firstMinsAgo, now),
    lastMessageAt: minutesAgo(messages[messages.length - 1]![2], now),
    messages: messages.map(([fromMe, text, mins], i) => ({ id: `${id}-${i}`, fromMe, text, sentAt: minutesAgo(mins, now) })),
  });

  return [
    c("t1", "Ayşe K.", "instagram", "Kira hukuku", "Kira Hukuku — Ekim", "Kiran yasal sınırı aştı mı?", "new", true, 12, [
      [false, "Merhaba, ev sahibim kirayı %60 artırmak istiyor. İhtar çekmem gerekiyor mu?", 12],
    ]),
    c("t2", "Mehmet D.", "messenger", "Aile hukuku", "Arama — boşanma", "Anlaşmalı boşanma rehberi", "new", true, 38, [
      [false, "Selam, anlaşmalı boşanma ortalama ne kadar sürer?", 38],
    ]),
    c("t3", "Selin T.", "whatsapp", "İş hukuku", "İş Hukuku — Reels", "Kıdem tazminatını hesapla", "new", true, 65, [
      [false, "3 yıldır çalıştığım yerden çıkarıldım. Tazminat alabilir miyim?", 65],
    ]),
    c("t4", "Burak Y.", "instagram", "Sigorta / trafik", null, null, "new", true, 140, [
      [false, "Trafik kazası geçirdim, karşı tarafın sigortası hâlâ ödeme yapmadı.", 140],
    ]),
    c("t5", "Zeynep A.", "messenger", "Miras", "Kira Hukuku — Ekim", "Kiran yasal sınırı aştı mı?", "qualified", false, 1300, [
      [false, "Babamdan kalan ev için kardeşlerimle anlaşamıyoruz.", 1300],
      [true, "Anlıyorum. Ücretsiz ön görüşme için yarın 11:00 uygun mu?", 1292],
    ]),
    c("t6", "Can E.", "whatsapp", "Sözleşme", "Arama — avukata sor", "Avukata 5 dakikada sor", "proposal", false, 1720, [
      [true, "İnceleme ücretimiz 1.500 TL, 2 iş günü içinde dönüş yapıyoruz.", 1695],
      [false, "Teşekkürler, sözleşmeyi gönderiyorum.", 1683],
    ]),
  ];
}

export function sampleLeads(now = new Date()): Lead[] {
  let n = 0;
  const l = (
    name: string,
    topic: string,
    channel: Lead["channel"],
    source: Lead["source"],
    campaignName: string | null,
    stage: Lead["stage"],
    minsAgo: number,
  ): Lead => {
    n += 1;
    return {
      id: `l${n}`,
      name,
      topic,
      channel,
      source,
      campaignName,
      stage,
      createdAt: minutesAgo(minsAgo, now),
      updatedAt: minutesAgo(minsAgo, now),
    };
  };
  return [
    l("Ayşe K.", "Kira artışı, ihtar", "instagram", "meta", "Kira Hukuku — Ekim", "new", 12),
    l("Mehmet D.", "Anlaşmalı boşanma", "messenger", "google", "Arama — boşanma", "new", 38),
    l("Burak Y.", "Trafik kazası, sigorta", "instagram", "organic", null, "new", 140),
    l("Selin T.", "Kıdem tazminatı", "whatsapp", "meta", "İş Hukuku — Reels", "contacted", 1440),
    l("Okan P.", "Tapu iptali", null, "google", "Arama — avukata sor", "contacted", 2880),
    l("Derya M.", "Kira tespit davası", "instagram", "meta", "Kira Hukuku — Ekim", "contacted", 4320),
    l("Zeynep A.", "Miras paylaşımı", "messenger", "meta", "Kira Hukuku — Ekim", "qualified", 1440),
    l("Emre S.", "İşe iade", null, "google", "Arama — avukata sor", "qualified", 2880),
    l("Gizem O.", "Velayet", "whatsapp", "google", "Arama — boşanma", "qualified", 5760),
    l("Can E.", "Sözleşme incelemesi", "whatsapp", "google", "Arama — avukata sor", "proposal", 1440),
    l("Hakan B.", "Alacak davası", null, "google", "Arama — avukata sor", "proposal", 4320),
    l("Elif N.", "Tahliye", "instagram", "meta", "Kira Hukuku — Ekim", "proposal", 7200),
    l("Merve K.", "Kira tespit", "instagram", "meta", "Kira Hukuku — Ekim", "customer", 300),
    l("Tolga R.", "İş kazası", null, "google", "Arama — avukata sor", "customer", 1440),
    l("Seda U.", "Anlaşmalı boşanma", "messenger", "google", "Arama — boşanma", "customer", 1500),
  ];
}

/** Sütunlarda görünenlerin dışındaki toplamlar (tasarımdaki "N daha göster"). */
export const SAMPLE_STAGE_TOTALS = { new: 12, contacted: 9, qualified: 7, proposal: 6, customer: 27 } as const;
export const SAMPLE_LOST_REASONS = [
  { reason: "Yanıt vermedi", count: 22 },
  { reason: "Fiyat", count: 9 },
  { reason: "Başka avukat", count: 6 },
  { reason: "Kapsam dışı", count: 4 },
];

export const SAMPLE_SOCIAL: SocialAccount[] = [
  { network: "instagram", name: "Instagram", handle: "@lawchat", followers: 12400, dailyNewFollowers: [8, 12, 10, 15, 9, 22, 18, 11, 14, 13, 20, 16, 9, 9], reach: 58200, engagementRate: 0.041, posts: 9 },
  { network: "facebook", name: "Facebook", handle: "LawChat", followers: 5920, dailyNewFollowers: [2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 4, 2, 1, 1], reach: 19700, engagementRate: 0.018, posts: 6 },
  { network: "linkedin", name: "LinkedIn", handle: "LawChat", followers: 3210, dailyNewFollowers: [1, 3, 2, 5, 4, 2, 1, 3, 6, 4, 3, 4, 2, 2], reach: 8400, engagementRate: 0.032, posts: 4 },
];

export const SAMPLE_TOP_POSTS: TopPost[] = [
  { kind: "Reels", title: "Kira artışında yasal sınır nedir? 30 saniyede", network: "Instagram", date: "9 Eki", reach: 21400, messages: 38 },
  { kind: "Karusel", title: "Kıdem tazminatı alabilir misin? 5 soru", network: "Instagram", date: "6 Eki", reach: 12900, messages: 21 },
  { kind: "Gönderi", title: "Anlaşmalı boşanma kaç ayda biter?", network: "Facebook", date: "11 Eki", reach: 7300, messages: 9 },
  { kind: "Makale", title: "Yapay zekâ hukuki danışmanlığı nasıl değiştiriyor", network: "LinkedIn", date: "8 Eki", reach: 4100, messages: 3 },
];

export const SAMPLE_PLANNED: PlannedPost[] = [
  { when: "Cum 12:30", title: "Reels — Tahliye taahhütnamesi geçerli mi?", networks: "Instagram" },
  { when: "Cmt 10:00", title: "Karusel — Miras paylaşımında 4 yanlış", networks: "Instagram, Facebook" },
  { when: "Pzt 09:00", title: "Haftalık hukuk bülteni", networks: "LinkedIn" },
  { when: "Sal 19:00", title: "Canlı yayın — Kira soruları", networks: "Instagram" },
];

export const SAMPLE_SYSTEM: SystemStatus = {
  uptime: 0.9997,
  lastIncident: "6 gün önce, 4 dk",
  activeUsers: 1842,
  activeUsersDelta: 0.09,
  chatsToday: 4315,
  latencyP95: 2.4,
  latencyTarget: 2.0,
  errorRate: 0.004,
  errorThreshold: 0.01,
  paidShareFromAds: 0.38,
  retentionAds: 0.31,
  retentionOrganic: 0.44,
};

export const SAMPLE_SERIES: MetricSeries[] = [
  { key: "chats", title: "Günlük sohbet", source: "lawchat-prod · chats_total", values: [3200, 3350, 3100, 3500, 3650, 2900, 2800, 3700, 3850, 3900, 4050, 3600, 3500, 4315], color: "#007AFF" },
  { key: "latency", title: "Yanıt süresi p95 (sn)", source: "lawchat-prod · llm_latency_p95", unit: "sn", values: [1.8, 1.9, 1.7, 2.0, 2.1, 1.9, 1.8, 2.2, 2.3, 2.1, 2.5, 2.6, 2.3, 2.4], threshold: 2.0, color: "#FF9F0A" },
  { key: "signups", title: "Yeni kayıt", source: "lawchat-prod · signups_total", values: [61, 70, 58, 74, 80, 52, 49, 77, 83, 88, 91, 72, 69, 96], color: "#34C759" },
  { key: "errors", title: "Hata oranı (%)", source: "lawchat-prod · http_5xx_ratio", unit: "%", values: [0.3, 0.2, 0.4, 0.3, 0.2, 0.3, 0.9, 0.4, 0.3, 0.2, 0.3, 0.4, 0.3, 0.4], threshold: 1.0, color: "#AF52DE" },
];
