import ProtectedShell from "@/components/ProtectedShell";
import SessionProvider from "@/context/SessionProvider";
import getCurrentSession from "@/lib/session";

async function ProtectedLayout({ children }) {
  const session = await getCurrentSession();
  return (
    <SessionProvider initialSession={session}>
      <ProtectedShell>{children}</ProtectedShell>
    </SessionProvider>
  );
}

export default ProtectedLayout;
