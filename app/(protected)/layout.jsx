import ProtectedShell from "@/components/ProtectedShell";
import SessionProvider from "@/context/SessionProvider";
import getCurrentSession from "@/lib/session";
import { SettingsProvider } from "@/context/SettingsProvider";
import { serializeDoc } from "@/utils/serialize";

async function ProtectedLayout({ children }) {
  let session = await getCurrentSession();
  session = serializeDoc(session);
  return (
    <SessionProvider initialSession={session}>
      <SettingsProvider initialSettings={session?.user?.settings || {}}>
        <ProtectedShell>{children}</ProtectedShell>
      </SettingsProvider>
    </SessionProvider>
  );
}

export default ProtectedLayout;
