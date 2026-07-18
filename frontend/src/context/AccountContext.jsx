import React, { createContext, useContext, useEffect, useState } from "react";

const AccountContext = createContext(null);
const KEY = "hariram_account_phone";

export function AccountProvider({ children }) {
  const [phone, setPhone] = useState(() => localStorage.getItem(KEY) || null);

  useEffect(() => {
    if (phone) localStorage.setItem(KEY, phone);
    else localStorage.removeItem(KEY);
  }, [phone]);

  const login = (p) => setPhone(p);
  const logout = () => setPhone(null);

  return (
    <AccountContext.Provider value={{ phone, login, logout, isAuthed: !!phone }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
