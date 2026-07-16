import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

const cache = new Map();

/** Load a single config JSON (cached in-memory). */
export function useConfig(name) {
  const [data, setData] = useState(cache.get(name) ?? null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache.has(name)) { setData(cache.get(name)); return; }
    let alive = true;
    apiClient
      .get(`/config/${name}`)
      .then((r) => { if (alive) { cache.set(name, r.data); setData(r.data); } })
      .catch((e) => { if (alive) setError(e); });
    return () => { alive = false; };
  }, [name]);

  return { data, error, loading: !data && !error };
}
