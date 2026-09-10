"use client";

import { Plus } from "lucide-react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, formatPrice, slugify, type Category, type Product, type ProductInput, type Vendor } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Wordmark } from "@/components/Wordmark";

type FormState = {
  title: string; shortTitle: string; categoryId: string; price: string; vendorId: string;
  imageUrl: string; externalUrl: string; description: string; shortDescription: string;
  availability: Product["availability"];
};
const emptyForm: FormState = { title: "", shortTitle: "", categoryId: "", price: "", vendorId: "", imageUrl: "", externalUrl: "", description: "", shortDescription: "", availability: "IN_STOCK" };

export default function AdminPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;
    const [productData, vendorData, categoryData] = await Promise.all([
      apiRequest<Product[]>("/products?limit=100", { token }),
      apiRequest<Vendor[]>("/vendors", { token }),
      apiRequest<Category[]>("/categories", { token })
    ]);
    setProducts(productData); setVendors(vendorData); setCategories(categoryData);
    setForm((current) => ({ ...current, vendorId: current.vendorId || vendorData[0]?.id || "", categoryId: current.categoryId || categoryData[0]?.id || "" }));
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    if (user.role !== "ADMIN") { router.replace("/products"); return; }
    loadData().catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load admin data"));
  }, [authLoading, loadData, router, user]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) { setForm((current) => ({ ...current, [key]: value })); }
  function resetForm() { setEditingId(null); setForm({ ...emptyForm, vendorId: vendors[0]?.id || "", categoryId: categories[0]?.id || "" }); }
  function beginEdit(product: Product) {
    setEditingId(product.id);
    setForm({ title: product.title, shortTitle: product.shortTitle, categoryId: product.categoryId, price: product.price, vendorId: product.vendorId, imageUrl: product.imageUrl ?? "", externalUrl: product.externalUrl, description: product.description, shortDescription: product.shortDescription, availability: product.availability });
    setStatus(""); setError(""); formRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token) return;
    setPending(true); setError(""); setStatus("");
    const input: ProductInput = {
      slug: slugify(form.title), title: form.title, shortTitle: form.shortTitle || form.title.slice(0, 100),
      description: form.description, shortDescription: form.shortDescription || form.description.slice(0, 500),
      price: Number(form.price), currency: "GBP", availability: form.availability,
      imageUrl: form.imageUrl || null, externalUrl: form.externalUrl, vendorId: form.vendorId, categoryId: form.categoryId
    };
    try {
      await apiRequest<Product>(editingId ? `/products/${editingId}` : "/products", { method: editingId ? "PATCH" : "POST", token, body: JSON.stringify(input) });
      setStatus(editingId ? "Product updated." : "Product created."); resetForm(); await loadData();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save product"); }
    finally { setPending(false); }
  }

  async function remove(product: Product) {
    if (!token || !window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return;
    setError(""); setStatus("");
    try { await apiRequest<void>(`/products/${product.id}`, { method: "DELETE", token }); setProducts((items) => items.filter((item) => item.id !== product.id)); setStatus("Product deleted."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete product"); }
  }

  function signOut() { logout(); router.push("/"); }
  if (authLoading || !user || user.role !== "ADMIN") return <main className="page"><p>Checking administrator access…</p></main>;

  return <main className="admin-page">
    <header className="admin-header"><Wordmark admin light /><nav aria-label="Admin actions">
      <button className="btn btn--secondary" type="button" onClick={() => { resetForm(); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}><Plus aria-hidden="true" size={19} />Add product</button>
      <button className="btn btn--outline btn--light" type="button" onClick={signOut}>Log out</button>
    </nav></header>
    <section className="admin-content">
      {status ? <p className="form-status" role="status">{status}</p> : null}{error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="admin-table-card"><table><thead><tr><th>Product</th><th>Vendor</th><th>Price</th><th>Actions</th></tr></thead><tbody>
        {products.map((product) => <tr key={product.id}><td><div className="admin-product-cell"><ImagePlaceholder className="admin-thumb" label="" /><strong>{product.title}</strong></div></td><td>{product.vendor.name}</td><td><strong>{formatPrice(product.price, product.currency)}</strong></td><td><div className="admin-actions"><button type="button" onClick={() => beginEdit(product)}>Edit</button><button type="button" onClick={() => remove(product)}>Delete</button></div></td></tr>)}
      </tbody></table>{products.length === 0 ? <p className="empty-note">No products yet. Add the first one below.</p> : null}</div>
      <section ref={formRef} className="admin-form-card" aria-labelledby="admin-form-heading"><h1 id="admin-form-heading">{editingId ? "Edit product" : "Add product"}</h1>
        <form onSubmit={submit}>
          <label>Title<input value={form.title} onChange={(e) => updateField("title", e.target.value)} type="text" minLength={2} maxLength={200} required /></label>
          <label>Short title<input value={form.shortTitle} onChange={(e) => updateField("shortTitle", e.target.value)} type="text" minLength={2} maxLength={100} required /></label>
          <label>Category<select value={form.categoryId} onChange={(e) => updateField("categoryId", e.target.value)} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label>Price<input value={form.price} onChange={(e) => updateField("price", e.target.value)} type="number" min="0.01" step="0.01" required /></label>
          <label>Vendor<select value={form.vendorId} onChange={(e) => updateField("vendorId", e.target.value)} required>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select></label>
          <label>Image URL<input value={form.imageUrl} onChange={(e) => updateField("imageUrl", e.target.value)} type="url" placeholder="https://..." /></label>
          <label>External product URL<input value={form.externalUrl} onChange={(e) => updateField("externalUrl", e.target.value)} type="url" placeholder="https://..." required /></label>
          <label>Availability<select value={form.availability} onChange={(e) => updateField("availability", e.target.value as Product["availability"])}><option value="IN_STOCK">In stock</option><option value="PREORDER">Pre-order</option><option value="OUT_OF_STOCK">Out of stock</option></select></label>
          <label className="admin-form-card__wide">Description<textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} minLength={10} maxLength={5000} required /></label>
          <label className="admin-form-card__wide">Short description<textarea value={form.shortDescription} onChange={(e) => updateField("shortDescription", e.target.value)} minLength={5} maxLength={500} required /></label>
          <button className="btn btn--primary admin-form-card__wide" type="submit" disabled={pending}>{pending ? "Saving…" : editingId ? "Update product" : "Create product"}</button>
          {editingId ? <button className="btn btn--ghost admin-form-card__wide" type="button" onClick={resetForm}>Cancel editing</button> : null}
        </form>
      </section>
    </section>
  </main>;
}
