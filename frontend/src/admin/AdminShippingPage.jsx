import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Save, Download, Upload, Loader2, RefreshCw } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

export default function AdminShippingPage() {
  const { client, token, API } = useAdminAuth();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const r = await client.get("/admin/shipping-rates");
      setText(JSON.stringify(r.data, null, 2));
      setDirty(false);
      setErr("");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Load failed");
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const save = async () => {
    setErr("");
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setErr("Invalid JSON: " + e.message);
      return;
    }
    setSaving(true);
    try {
      await client.put("/admin/shipping-rates", parsed);
      toast.success("Shipping rates saved");
      setDirty(false);
    } catch (e) {
      const d = e.response?.data?.detail || "Save failed";
      setErr(typeof d === "string" ? d : "Save failed");
    } finally { setSaving(false); }
  };

  const download = async () => {
    // Use fetch with token to trigger download
    try {
      const r = await fetch(`${API}/admin/shipping-rates/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("Download failed");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "shipping_rates.json";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Download failed");
    }
  };

  const upload = async (file) => {
    const form = new FormData();
    form.append("file", file);
    try {
      await client.post("/admin/shipping-rates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Uploaded. Refreshing…");
      await load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    }
  };

  return (
    <div data-testid={ADMIN_TID.shippingPage}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Shipping Rates</h1>
          <p className="text-sm text-[color:#6B5A46]">
            Edit rules in the JSON editor OR download the file, edit locally and upload back.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load} className="admin-btn admin-btn-ghost">
            <RefreshCw className="w-4 h-4" /> Reload
          </button>
          <button data-testid={ADMIN_TID.shippingDownload} onClick={download} className="admin-btn admin-btn-ghost">
            <Download className="w-4 h-4" /> Download JSON
          </button>
          <button data-testid={ADMIN_TID.shippingUpload}
                  onClick={() => fileRef.current?.click()}
                  className="admin-btn admin-btn-ghost">
            <Upload className="w-4 h-4" /> Upload JSON
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
                 onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>

      <div className="admin-card">
        <div className="mb-3 text-xs text-[color:#6B5A46]">
          Rule types: <code>CITY</code>, <code>STATE</code>, <code>PINCODE</code>, <code>DEFAULT</code>.
          Lower <code>priority</code> = evaluated first. Set <code>freeShippingAbove</code> to a cart-subtotal threshold in ₹.
        </div>
        <textarea
          data-testid={ADMIN_TID.shippingEditor}
          className="admin-textarea font-mono text-[13px]"
          rows={22}
          value={text}
          onChange={(e) => { setText(e.target.value); setDirty(true); }}
          spellCheck={false}
        />
        {err && (
          <div className="mt-3 text-sm rounded-lg px-3 py-2"
               style={{ background: "rgba(178,34,34,0.10)", color: "#B22222" }}>{err}</div>
        )}
        <div className="flex justify-end mt-4">
          <button data-testid={ADMIN_TID.shippingSave}
                  onClick={save} disabled={saving || !dirty}
                  className="admin-btn admin-btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}
