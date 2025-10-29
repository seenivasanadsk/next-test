// context\SessionProvider.jsx
"use client";
import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export default function SessionProvider({ initialSession, children }) {
  const [session, setSession] = useState(initialSession);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
