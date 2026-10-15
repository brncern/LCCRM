import { Sidebar } from "@/components/sidebar";
import { connectionStatus, getConversations, waitingOf } from "@/lib/data";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations();
  const unread = waitingOf(conversations.data).length;

  return (
    <div className="desktop">
      <div className="window">
        <Sidebar unread={unread} connections={connectionStatus()} />
        {children}
      </div>
    </div>
  );
}
