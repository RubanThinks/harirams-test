import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

const KEY = "hariram_admin_token";
const AdminAuthContext = createContext(null);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/** Axios instance that always attaches admin bearer token. */
export function makeAdminClient(getToken) {
  const client = axios.create({
    baseURL: API,
    timeout: 30000,
  });
  client.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });
  return client;
}

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(KEY) || null);

  useEffect(() => {
    if (token) localStorage.setItem(KEY, token);
    else localStorage.removeItem(KEY);
  }, [token]);

  const client = useMemo(() => makeAdminClient(() => token), [token]);

  const login = async (username, password) => {
    const r = await client.post("/admin/auth/login", { username, password });
    setToken(r.data.token);
    return r.data;
  };

  const logout = () => setToken(null);

  return (
    <AdminAuthContext.Provider value={{ token, isAuthed: !!token, login, logout, client, API }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
