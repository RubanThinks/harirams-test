import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Save, RefreshCw, Download, Upload as UploadIcon, Loader2, FileJson, FileText, Search
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminConfigFilesPage() {
  const { client, token, API } = useAdminAuth();
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null); // relative path
  const [meta, setMeta] = useState(null);
  const [text, setText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const loadList = async () => {
    try {
      const r = await client.get("/admin/config");
      setFiles(r.data.files || []);
      if (!selected && r.data.files?.length) selectFile(r.data.files[0].path);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Load failed");
    }
  };

  const selectFile = async (path) => {
    setSelected(path);
    setErr("");
    setDirty(false);
    try {
      const r = await client.get("/admin/config/read", { params: { path } });
      setMeta({ path: r.data.path, type: r.data.type, size: r.data.size });
      const initial = r.data.type === "json" && r.data.parsed !== null
        ? JSON.stringify(r.data.parsed, null, 2)
        : r.data.raw;
      setText(initial);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Read failed");
    }
  };

  const save = async () => {
    if (!meta) return;
    setErr("");
    let payload;
    if (meta.type === "json") {
      try { payload = { content: JSON.parse(text), kind: "json" }; }
      catch (e) { setErr("Invalid JSON: " + e.message); return; }
    } else {
      payload = { content: text, kind: "text" };
    }
    setSaving(true);
    try {
      await client.put("/admin/config/save", payload, { params: { path: meta.path } });
      toast.success(`Saved ${meta.path}`);
      setDirty(false);
    } catch (e) {
      setErr(e.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  const download = async () => {
    if (!meta) return;
    try {
      const r = await fetch(`${API}/admin/config/download?path=${encodeURIComponent(meta.path)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = meta.path.split("/").pop();
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { toast.error("Download failed"); }
  };

  const upload = async (file) => {
    if (!meta) return;
    // Client-side: read file text then PUT via /save (validates + writes)
    const raw = await file.text();
    let content;
    if (meta.type === "json") {
      try { content = JSON.parse(raw); }
      catch (e) { toast.error("Invalid JSON in file"); return; }
    } else {
      content = raw;
    }
    try {
      await client.put("/admin/config/save",
        { content, kind: meta.type === "json" ? "json" : "text" },
        { params: { path: meta.path } });
      toast.success("Uploaded");
      selectFile(meta.path);  // reload
    } catch (e) { toast.error(e.response?.data?.detail || "Upload failed"); }
  };

  useEffect(() => { loadList(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return files;
    return files.filter((f) => f.path.toLowerCase().includes(t));
  }, [q, files]);

  return (
    <div data-testid="admin-config-page">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Config Files</h1>
          <p className="text-sm text-[color:#6B5A46]">
            Edit ANY config file (JSON or Markdown) under <code>/app/backend/config/</code>. Changes reflect immediately on the site.
          </p>
        </div>
        <button onClick={loadList} className="admin-btn admin-btn-ghost">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* File list */}
        <aside className="admin-card lg:sticky lg:top-24 h-fit">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:#B5A98A]" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Filter…"
                   className="admin-input pl-8" />
          </div>
          <ul className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.map((f) => {
              const isActive = selected === f.path;
              const Icon = f.type === "json" ? FileJson : FileText;
              return (
                <li key={f.path}>
                  <button
                    data-testid={`admin-config-file-${f.path.replace(/[\/.]/g, "_")}`}
                    onClick={() => selectFile(f.path)}
                    className={`w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-lg text-[13px] ${
                      isActive ? "bg-[#174C2B] text-white" : "hover:bg-[#F6F4EE]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="flex-1 truncate font-mono">{f.path}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase ${
                      isActive ? "bg-white/20" : "bg-[#F6F4EE] text-[color:#6B5A46]"
                    }`}>{f.type}</span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-sm text-[color:#6B5A46] p-2">No files match "{q}".</li>
            )}
          </ul>
        </aside>

        {/* Editor */}
        <section className="lg:col-span-3 admin-card">
          {!meta ? (
            <div className="py-16 text-center text-[color:#6B5A46]">Select a file to edit…</div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[color:#6B5A46]">Editing</div>
                  <div className="font-mono font-bold text-[color:#174C2B]">{meta.path}</div>
                  <div className="text-[11px] text-[color:#6B5A46] mt-0.5">
                    {meta.type.toUpperCase()} · {meta.size} bytes
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={download} className="admin-btn admin-btn-ghost admin-btn-sm">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <label className="admin-btn admin-btn-ghost admin-btn-sm cursor-pointer">
                    <UploadIcon className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept={meta.type === "json" ? ".json,application/json" : ".md,text/markdown,text/plain"}
                           className="hidden"
                           onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                  </label>
                  <button onClick={() => selectFile(meta.path)} className="admin-btn admin-btn-ghost admin-btn-sm">
                    <RefreshCw className="w-3.5 h-3.5" /> Reload
                  </button>
                </div>
              </div>

              <textarea
                data-testid="admin-config-editor"
                className="admin-textarea font-mono text-[13px]"
                rows={26}
                value={text}
                onChange={(e) => { setText(e.target.value); setDirty(true); }}
                spellCheck={false}
              />
              {err && (
                <div className="mt-3 text-sm rounded-lg px-3 py-2"
                     style={{ background: "rgba(178,34,34,0.10)", color: "#B22222" }}>{err}</div>
              )}
              <div className="flex justify-end mt-4">
                <button data-testid="admin-config-save"
                        onClick={save} disabled={saving || !dirty}
                        className="admin-btn admin-btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
