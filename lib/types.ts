export type Platform = "meta" | "google";
export type Channel = "instagram" | "messenger" | "whatsapp";
export type LeadSource = "meta" | "google" | "organic";

export const LEAD_STAGES = ["new", "contacted", "qualified", "proposal", "customer", "lost"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const STAGE_LABEL: Record<LeadStage, string> = {
  new: "Yeni",
  contacted: "İletişimde",
  qualified: "Nitelikli",
  proposal: "Teklif",
  customer: "Müşteri",
  lost: "Kaybedildi",
};

export type DailySpend = { date: string; meta: number; google: number };

export type Campaign = {
  id: string;
  platform: Platform;
  name: string;
  status: "active" | "limited" | "paused";
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  customers: number;
};

export type Lead = {
  id: string;
  name: string;
  topic: string;
  channel: Channel | null;
  source: LeadSource;
  campaignName: string | null;
  stage: LeadStage;
  createdAt: string;
  updatedAt: string;
  lostReason?: string | null;
};

export type Message = { id: string; fromMe: boolean; text: string; sentAt: string };

export type Conversation = {
  id: string;
  leadId: string | null;
  name: string;
  channel: Channel;
  topic: string;
  campaignName: string | null;
  adName: string | null;
  stage: LeadStage;
  unread: boolean;
  firstContactAt: string;
  lastMessageAt: string;
  messages: Message[];
};

export type FunnelStep = { label: string; value: number };

export type SocialAccount = {
  network: "instagram" | "facebook" | "linkedin";
  name: string;
  handle: string;
  followers: number;
  dailyNewFollowers: number[];
  reach: number;
  engagementRate: number;
  posts: number;
};

export type TopPost = { kind: string; title: string; network: string; date: string; reach: number; messages: number };
export type PlannedPost = { when: string; title: string; networks: string };

export type MetricSeries = {
  key: string;
  title: string;
  source: string;
  unit?: string;
  values: number[];
  threshold?: number;
  color: string;
};

export type SystemStatus = {
  uptime: number;
  lastIncident: string;
  activeUsers: number;
  activeUsersDelta: number;
  chatsToday: number;
  latencyP95: number;
  latencyTarget: number;
  errorRate: number;
  errorThreshold: number;
  paidShareFromAds: number;
  retentionAds: number;
  retentionOrganic: number;
};

/** Bir ekranın verisi + gerçek mi örnek mi olduğu. */
export type Loaded<T> = { data: T; sample: boolean };
