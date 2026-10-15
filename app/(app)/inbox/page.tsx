import { getConversations } from "@/lib/data";
import { InboxView } from "./inbox-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gelen Kutusu" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const [{ data, sample }, params] = await Promise.all([getConversations(), searchParams]);
  return <InboxView conversations={data} sample={sample} initialId={params.c ?? data[0]?.id ?? null} />;
}
