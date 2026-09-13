import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Save, X, Upload, Loader2,
  Image as ImageIcon, Star, StarOff,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ADMIN_TID } from "@/constants/adminTestIds";

const MAX_IMAGES = 6;

const empty = {
  sku: "", name: "Pure Cow Ghee", variant: "", price: 0, mrp: 0,
  description: "", idealFor: "", image: "", images: [],
  bestSeller: false, available: true, displaySequence: 999, family: "ghee",
};

/** Ensure the product's `images` array is normalised (exactly one main image). */
function normalizeLocal(p) {
  const imgs = (p.images && p.images.length) ? p.images.map((i) => ({ ...i }))
    : (p.image ? [{ url: p.image, isMain: true }] : []);
  if (imgs.length && !imgs.some((i) => i.isMain)) imgs[0].isMain = true;
  const main = imgs.find((i) => i.isMain);
  return { ...p, images: imgs, image: main ? main.url : "" };
}

export default function AdminProductsPage() {
  const { client, API } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // full product being edited, or null
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const r = await client.get("/admin/products");
    setProducts((r.data.products || [])
      .map(normalizeLocal)
      .sort((a, b) => (a.displaySequence || 999) - (b.displaySequence || 999)));
  };

  useEffect(() => { load().catch(() => {}); }, []); // eslint-disable-line

  const startNew = () => { setEditing(normalizeLocal({ ...empty })); setIsNew(true); };
  const startEdit = (p) => { setEditing(normalizeLocal(p)); setIsNew(false); };
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
    if ((editing.images || []).length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images per product`);
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sku", editing.sku || "new");
      const r = await client.post("/admin/products/upload-image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditing((cur) => {
        const list = [...(cur.images || [])];
        const isFirst = list.length === 0;
        list.push({ url: r.data.url, isMain: isFirst });
        return normalizeLocal({ ...cur, images: list });
      });
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const setMainImage = (idx) => {
    setEditing((cur) => {
      const list = (cur.images || []).map((i, k) => ({ ...i, isMain: k === idx }));
      return normalizeLocal({ ...cur, images: list });
    });
  };

  const removeImage = async (idx) => {
    const target = editing.images?.[idx];
    if (!target) return;
    if (!window.confirm("Remove this image?")) return;
    // If product is not yet persisted (new), just drop locally
    if (isNew || !editing.sku) {
      setEditing((cur) => {
        const list = (cur.images || []).filter((_, k) => k !== idx);
        return normalizeLocal({ ...cur, images: list });
      });
      return;
    }
    try {
      const r = await client.post(`/admin/products/${editing.sku}/delete-image`, { url: target.url });
      const updated = normalizeLocal(r.data.product);
      setEditing((cur) => ({ ...cur, images: updated.images, image: updated.image }));
      toast.success("Image removed");
      // Also refresh list so table thumbnail updates
      load().catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.detail || "Remove failed");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const normalized = normalizeLocal(editing);
      const payload = {
        ...normalized,
        price: Number(normalized.price) || 0,
        mrp: Number(normalized.mrp) || 0,
        displaySequence: Number(normalized.displaySequence) || 999,
      };
      if (isNew) await client.post("/admin/products", payload);
      else await client.put(`/admin/products/${normalized.sku}`, payload);
      toast.success(isNew ? "Product created" : "Product updated");
      cancel();
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally { setSaving(false); }
  };

  const resolveUrl = (u) =>
    u && u.startsWith("/api/") ? `${API.replace(/\/api$/, "")}${u}` : u;

  return (
    <div data-testid={ADMIN_TID.productsPage}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl mb-1">Products</h1>
          <p className="text-sm text-[color:#6B5A46]">
            Catalog is stored in <code>products.json</code>. Each product can carry up to {MAX_IMAGES} images — the one marked as Main is used everywhere the storefront shows a single thumbnail.
          </p>
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
                    <div className="relative">
                      <img src={resolveUrl(p.image)} alt=""
                           className="w-14 h-16 object-contain rounded bg-[#F6F4EE]" />
                      {(p.images?.length || 0) > 1 && (
                        <span className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#174C2B] text-white">
                          {p.images.length}
                        </span>
                      )}
                    </div>
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

              <Field label={`Product Images (${(editing.images || []).length}/${MAX_IMAGES})`} className="sm:col-span-2">
                <div className="flex flex-wrap gap-3 mb-3">
                  {(editing.images || []).map((img, idx) => (
                    <div key={idx}
                         data-testid={ADMIN_TID.productImageThumb(idx)}
                         className={`relative w-24 h-28 rounded-lg overflow-hidden bg-[#F6F4EE] border-2 ${img.isMain ? "border-[#174C2B]" : "border-transparent"}`}>
                      <img src={resolveUrl(img.url)} alt="" className="w-full h-full object-contain" />
                      {img.isMain && (
                        <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#174C2B] text-white uppercase tracking-wider">
                          Main
                        </span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 flex">
                        {!img.isMain && (
                          <button type="button"
                                  data-testid={ADMIN_TID.productImageSetMain(idx)}
                                  onClick={() => setMainImage(idx)}
                                  className="flex-1 py-1 text-[10px] font-semibold text-white hover:bg-[#174C2B]"
                                  title="Mark as Main">
                            <Star className="w-3 h-3 inline" />
                          </button>
                        )}
                        {img.isMain && (
                          <span className="flex-1 py-1 text-[10px] font-semibold text-white/70 text-center">
                            <StarOff className="w-3 h-3 inline" />
                          </span>
                        )}
                        <button type="button"
                                data-testid={ADMIN_TID.productImageDelete(idx)}
                                onClick={() => removeImage(idx)}
                                className="flex-1 py-1 text-[10px] font-semibold text-white hover:bg-[#B22222]"
                                title="Remove image">
                          <Trash2 className="w-3 h-3 inline" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(editing.images || []).length < MAX_IMAGES && (
                    <label className="w-24 h-28 rounded-lg border-2 border-dashed border-[#EADFC7] flex flex-col items-center justify-center gap-1 text-[color:#6B5A46] cursor-pointer hover:border-[#174C2B] hover:text-[#174C2B]">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          <span className="text-[11px] font-semibold">Upload</span>
                        </>
                      )}
                      <input data-testid={ADMIN_TID.productImageUpload}
                             type="file" accept="image/*" className="hidden"
                             onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                    </label>
                  )}
                </div>
                <p className="text-xs text-[color:#6B5A46]">
                  PNG · JPG · WEBP · max 5 MB each. The image tagged <b>Main</b> is used as the primary storefront image.
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
