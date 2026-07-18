import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

const empty = {
  sku: "", name: "Pure Cow Ghee", variant: "", price: 0, mrp: 0,
  description: "", idealFor: "", image: "",
  bestSeller: false, available: true, displaySequence: 999, family: "ghee",
};

export default function AdminProductsPage() {
  const { client, API } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // full product being edited, or null
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await client.get("/admin/products");
    setProducts((r.data.products || []).sort((a, b) => (a.displaySequence || 999) - (b.displaySequence || 999)));
  };

  useEffect(() => { load().catch(() => {}); }, []); // eslint-disable-line

  const startNew = () => { setEditing({ ...empty }); setIsNew(true); };
  const startEdit = (p) => { setEditing({ ...p }); setIsNew(false); };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const remove = async (sku) => {
    if (!window.confirm(`Delete product ${sku}? This cannot be undone.`)) return;
    try {
      await client.delete(`/admin/products/${sku}`);
      toast.success(`Deleted ${sku}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Delete failed");
    }
  };

  const uploadImage = async (file) => {
    if (!editing) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sku", editing.sku || "new");
      const r = await client.post("/admin/products/upload-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditing((cur) => ({ ...cur, image: r.data.url }));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      // coerce numeric fields
      const payload = {
        ...editing,
        price: Number(editing.price) || 0,
        mrp: Number(editing.mrp) || 0,
        displaySequence: Number(editing.displaySequence) || 999,
      };
      if (isNew) await client.post("/admin/products", payload);
      else await client.put(`/admin/products/${editing.sku}`, payload);
      toast.success(isNew ? "Product created" : "Product updated");
      cancel();
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div data-testid={ADMIN_TID.productsPage}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Products</h1>
          <p className="text-sm text-[color:#6B5A46]">Catalog is stored in <code>products.json</code>. Changes reflect immediately on the storefront.</p>
        </div>
        <button data-testid={ADMIN_TID.productsAddBtn}
                onClick={startNew}
                className="admin-btn admin-btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Name / Variant</th>
              <th>Price / MRP</th>
              <th>Best</th>
              <th>Available</th>
              <th>Seq</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.sku} data-testid={ADMIN_TID.productRow(p.sku)}>
                <td>
                  {p.image ? (
                    <img src={p.image.startsWith("/api/") ? `${API.replace(/\/api$/, "")}${p.image}` : p.image}
                         alt="" className="w-14 h-16 object-contain rounded bg-[#F6F4EE]" />
                  ) : (
                    <span className="w-14 h-16 rounded bg-[#F6F4EE] flex items-center justify-center text-[color:#B5A98A]">
                      <ImageIcon className="w-5 h-5" />
                    </span>
                  )}
                </td>
                <td className="font-mono text-[12px]">{p.sku}</td>
                <td>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-[color:#6B5A46]">{p.variant} — {p.idealFor}</div>
                </td>
                <td>
                  <div className="font-semibold">₹{p.price}</div>
                  {p.mrp > p.price && <div className="text-xs line-through text-[color:#6B5A46]">₹{p.mrp}</div>}
                </td>
                <td>{p.bestSeller ? <span className="admin-badge badge-shipped">Best</span> : "—"}</td>
                <td>
                  <span className={`admin-badge ${p.available ? "badge-paid" : "badge-pending"}`}>
                    {p.available ? "Live" : "Hidden"}
                  </span>
                </td>
                <td>{p.displaySequence}</td>
                <td className="text-right whitespace-nowrap">
                  <button data-testid={ADMIN_TID.productEdit(p.sku)}
                          onClick={() => startEdit(p)}
                          className="admin-btn admin-btn-ghost admin-btn-sm mr-1">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button data-testid={ADMIN_TID.productDelete(p.sku)}
                          onClick={() => remove(p.sku)}
                          className="admin-btn admin-btn-danger admin-btn-sm">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-[color:#6B5A46]">No products yet. Click "Add Product".</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
             onClick={(e) => e.target === e.currentTarget && cancel()}>
          <div data-testid={ADMIN_TID.productForm}
               className="admin-card w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">{isNew ? "Add Product" : `Edit ${editing.sku}`}</h2>
              <button onClick={cancel} className="admin-btn admin-btn-ghost admin-btn-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="SKU *">
                <input className="admin-input" value={editing.sku}
                       disabled={!isNew}
                       onChange={(e) => setEditing({ ...editing, sku: e.target.value.toUpperCase() })} />
              </Field>
              <Field label="Family">
                <input className="admin-input" value={editing.family}
                       onChange={(e) => setEditing({ ...editing, family: e.target.value })} />
              </Field>
              <Field label="Name *">
                <input className="admin-input" value={editing.name}
                       onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Variant *">
                <input className="admin-input" value={editing.variant}
                       placeholder="500 ml"
                       onChange={(e) => setEditing({ ...editing, variant: e.target.value })} />
              </Field>
              <Field label="Price ₹ *">
                <input className="admin-input" type="number" value={editing.price}
                       onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
              </Field>
              <Field label="MRP ₹">
                <input className="admin-input" type="number" value={editing.mrp}
                       onChange={(e) => setEditing({ ...editing, mrp: e.target.value })} />
              </Field>
              <Field label="Ideal for" className="sm:col-span-2">
                <input className="admin-input" value={editing.idealFor}
                       placeholder="Small Families"
                       onChange={(e) => setEditing({ ...editing, idealFor: e.target.value })} />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea className="admin-textarea" rows={2} value={editing.description}
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </Field>
              <Field label="Display Sequence">
                <input className="admin-input" type="number" value={editing.displaySequence}
                       onChange={(e) => setEditing({ ...editing, displaySequence: e.target.value })} />
              </Field>
              <Field label="Flags">
                <div className="flex items-center gap-4 pt-2">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editing.bestSeller}
                           onChange={(e) => setEditing({ ...editing, bestSeller: e.target.checked })} />
                    Best Seller
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={editing.available}
                           onChange={(e) => setEditing({ ...editing, available: e.target.checked })} />
                    Available
                  </label>
                </div>
              </Field>

              <Field label="Product Image" className="sm:col-span-2">
                <div className="flex items-center gap-3">
                  {editing.image ? (
                    <img src={editing.image.startsWith("/api/") ? `${API.replace(/\/api$/, "")}${editing.image}` : editing.image}
                         alt="" className="w-20 h-24 object-contain rounded bg-[#F6F4EE]" />
                  ) : (
                    <span className="w-20 h-24 rounded bg-[#F6F4EE] flex items-center justify-center text-[color:#B5A98A]">
                      <ImageIcon className="w-6 h-6" />
                    </span>
                  )}
                  <label className="admin-btn admin-btn-ghost cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading…" : "Upload Image"}
                    <input data-testid={ADMIN_TID.productImageUpload}
                           type="file" accept="image/*" className="hidden"
                           onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  </label>
                  <input className="admin-input flex-1" placeholder="or paste image URL / path"
                         value={editing.image}
                         onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                </div>
                <p className="text-xs text-[color:#6B5A46] mt-1">
                  Files stored at <code>/app/backend/uploads/products/</code>. Max 5MB.
                </p>
              </Field>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button data-testid={ADMIN_TID.productFormCancel}
                      onClick={cancel} className="admin-btn admin-btn-ghost">Cancel</button>
              <button data-testid={ADMIN_TID.productFormSave}
                      onClick={save}
                      disabled={saving || !editing.sku || !editing.name || !editing.variant}
                      className="admin-btn admin-btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[color:#6B5A46]">
        {label}
      </span>
      {children}
    </label>
  );
}
