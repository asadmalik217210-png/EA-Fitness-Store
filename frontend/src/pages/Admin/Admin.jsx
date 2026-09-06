import { NavLink, Navigate, Outlet, Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { money } from '../../utils/money';
import { useSeo } from '../../hooks/useSeo';
import { useUI } from '../../context/UIContext';

const links = [
  ['Overview', '/admin'],
  ['Products', '/admin/products'],
  ['Add product', '/admin/products/new'],
  ['Categories', '/admin/categories'],
  ['Inventory', '/admin/inventory'],
  ['Orders', '/admin/orders'],
  ['Customers', '/admin/customers'],
  ['Reviews', '/admin/reviews'],
  ['Coupons', '/admin/coupons'],
  ['Payments', '/admin/payments'],
  ['Shipping', '/admin/shipping'],
  ['Returns', '/admin/returns'],
  ['Analytics', '/admin/analytics'],
  ['Admin users', '/admin/users'],
  ['Settings', '/admin/settings'],
];

export function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return (
    <div className="admin">
      <aside className="admin-side">
        <h3 style={{ color: '#fff', marginBottom: 16 }}>EA Admin</h3>
        {links.map(([label, to]) => (
          <NavLink key={to} to={to} end={to === '/admin'}>{label}</NavLink>
        ))}
        <Link to="/" style={{ marginTop: 24, display: 'block' }}>View store</Link>
      </aside>
      <div className="admin-main"><Outlet /></div>
    </div>
  );
}

export function AdminOverview() {
  useSeo({ title: 'Admin dashboard' });
  const [data, setData] = useState(null);
  useEffect(() => { api('/admin/overview').then(setData); }, []);
  if (!data) return <p>Loading…</p>;
  const s = data.stats;
  return (
    <div>
      <h1>Overview</h1>
      <div className="admin-cards">
        <div className="stat"><span>Sales</span><b>{money(s.totalSales)}</b></div>
        <div className="stat"><span>Orders</span><b>{s.orderCount}</b></div>
        <div className="stat"><span>Customers</span><b>{s.customers}</b></div>
        <div className="stat"><span>Products</span><b>{s.products}</b></div>
        <div className="stat"><span>Low stock</span><b>{s.lowStock}</b></div>
        <div className="stat"><span>Out of stock</span><b>{s.outOfStock}</b></div>
      </div>
      <h2>Revenue</h2>
      <div className="chart">
        {(data.chart || []).map((d) => (
          <div key={d.date} className="bar" title={`${d.date} ${money(d.revenue)}`} style={{ height: `${Math.max(8, (d.revenue / (Math.max(...data.chart.map((x) => x.revenue), 1))) * 150)}px` }} />
        ))}
      </div>
      <h2 style={{ marginTop: 24 }}>Recent orders</h2>
      <table>
        <thead><tr><th>Order</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {data.recentOrders.map((o) => (
            <tr key={o._id}><td><Link to={`/admin/orders/${o._id}`}>{o.orderNumber}</Link></td><td>{o.status}</td><td>{money(o.total)}</td></tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ marginTop: 24 }}>Top products</h2>
      <ul>{data.topProducts.map((p) => <li key={p.name}>{p.name} — {p.qty}</li>)}</ul>
    </div>
  );
}

export function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [filters, setFilters] = useState({ q: '', gender: '', category: '', tag: '', collection: '', active: '' });
  const { toast } = useUI();
  async function load(nextFilters = filters) {
    const query = new URLSearchParams(Object.entries(nextFilters).filter(([, value]) => value));
    const d = await api(`/admin/products?${query.toString()}`);
    setRows(d.products || []);
  }
  useEffect(() => { api('/products/categories').then((d) => setCats(d.categories || [])); load(); }, []);
  function updateFilter(key, value) { setFilters((current) => ({ ...current, [key]: value })); }
  function clearFilters() { setFilters({ q: '', gender: '', category: '', tag: '', collection: '', active: '' }); }
  return (
    <div>
      <div className="admin-page-heading"><div><p className="eyebrow">Catalog control</p><h1>Products</h1><p className="muted">Manage your live catalog, collections and drafts.</p></div><Link className="btn btn-dark" to="/admin/products/new">Add product</Link></div>
      <div className="admin-product-toolbar">
        <div className="admin-search-row"><input value={filters.q} onChange={(e) => updateFilter('q', e.target.value)} placeholder="Search name or SKU" /><button className="btn btn-dark" type="button" onClick={load}>Search</button></div>
        <div className="admin-filter-row">
          <select value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)}><option value="">All genders</option><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option></select>
          <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name} · {c.gender}</option>)}</select>
          <select value={filters.tag} onChange={(e) => updateFilter('tag', e.target.value)}><option value="">All tags</option>{['training', 'gym', 'performance', 'lifestyle', 'men', 'women'].map((tag) => <option key={tag}>{tag}</option>)}</select>
          <select value={filters.active} onChange={(e) => updateFilter('active', e.target.value)}><option value="">All status</option><option value="true">Active</option><option value="false">Draft</option></select>
        </div>
        <div className="admin-filter-row admin-filter-buttons"><span>Collection</span>{[['', 'All'], ['new', 'New arrivals'], ['bestseller', 'Best sellers'], ['sale', 'Sale'], ['featured', 'Featured']].map(([value, label]) => <button key={value} type="button" className={filters.collection === value ? 'is-active' : ''} onClick={() => updateFilter('collection', value)}>{label}</button>)}<button type="button" className="clear-filter" onClick={() => { const next = { q: '', gender: '', category: '', tag: '', collection: '', active: '' }; setFilters(next); load(next); }}>Clear</button><button type="button" className="apply-filter" onClick={() => load()}>Apply filters</button></div>
      </div>
      <table>
        <thead><tr><th>Image</th><th>Name</th><th>SKU</th><th>Price</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p._id}>
              <td><img className="admin-product-thumb" src={p.images?.[0]} alt={p.name} /></td><td>{p.name}</td><td>{p.sku}</td><td>{money(p.price)}</td><td>{p.isActive ? 'Yes' : 'No'}</td>
              <td className="admin-product-actions">
                <Link className="admin-edit-action" to={`/admin/products/${p._id}`}>Edit</Link>
                <button className="admin-delete-action" type="button" onClick={async () => { if (confirm('Delete this product?')) { await api(`/admin/products/${p._id}`, { method: 'DELETE' }); toast('Deleted'); load(); } }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useUI();
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', price: 48, salePrice: '', gender: 'men', categorySlug: 'men-t-shirts', sku: '', brand: 'EA Fitness Clothing',
    material: '', careInstructions: '', tags: 'training', featured: false, bestseller: false, newArrival: false, isActive: true,
    images: [], variants: [{ size: 'M', color: 'Onyx', colorHex: '#111111', sku: '', stock: 12 }],
  });
  const [gallery, setGallery] = useState([]);
  const [draggedImage, setDraggedImage] = useState(null);

  useEffect(() => {
    api('/products/categories').then((d) => setCats(d.categories || []));
    if (id && id !== 'new') {
      api(`/admin/products/${id}`).then((d) => {
        const p = d.product;
        setForm({ ...p, salePrice: p.salePrice || '', tags: (p.tags || []).join(',') });
        setGallery((p.images || []).map((src) => ({ kind: 'existing', src })));
      });
    }
  }, [id]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function removeSelectedImage(index) {
    setGallery((items) => {
      const item = items[index];
      if (item?.kind === 'upload') URL.revokeObjectURL(item.src);
      return items.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function moveImage(from, to) {
    if (from === to || from === null || to === null) return;
    setGallery((items) => {
      const next = [...items];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function selectImages(event) {
    addImageFiles(Array.from(event.target.files || []));
    event.target.value = '';
  }

  function addImageFiles(files) {
    const remaining = Math.max(0, 5 - gallery.length);
    const next = files.filter((file) => file.type.startsWith('image/')).slice(0, remaining).map((file) => ({ kind: 'upload', file, src: URL.createObjectURL(file) }));
    setGallery((items) => [...items, ...next]);
  }

  function dropImages(event) {
    event.preventDefault();
    addImageFiles(Array.from(event.dataTransfer.files || []));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const cat = cats.find((c) => c.slug === form.categorySlug);
      const body = {
        ...form,
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : undefined,
        category: cat?._id,
        tags: String(form.tags).split(',').map((t) => t.trim()),
      };
      const formData = new FormData();
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      });
      const uploadItems = gallery.filter((item) => item.kind === 'upload');
      formData.append('imageOrder', JSON.stringify(gallery.map((item) => (
        item.kind === 'existing' ? `existing:${item.src}` : `upload:${uploadItems.indexOf(item)}`
      ))));
      uploadItems.forEach((item) => formData.append('images', item.file));
      if (id && id !== 'new') await api(`/admin/products/${id}`, { method: 'PATCH', formData });
      else await api('/admin/products', { method: 'POST', formData });
      toast('Product saved successfully');
      navigate('/admin/products');
    } catch (error) {
      toast(error.message || 'Unable to save product');
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <h1>{id === 'new' || !id ? 'Add product' : 'Edit product'}</h1>
      {['name','sku','description','material','careInstructions','brand'].map((k) => (
        <div className="field" key={k}><label>{k}</label>{k === 'description' ? <textarea value={form[k] || ''} onChange={(e) => set(k, e.target.value)} /> : <input value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />}</div>
      ))}
      <div className="field"><label>Price</label><input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
      <div className="field"><label>Sale price</label><input type="number" value={form.salePrice} onChange={(e) => set('salePrice', e.target.value)} /></div>
      <div className="field"><label>Gender</label>
        <select value={form.gender} onChange={(e) => set('gender', e.target.value)}><option>men</option><option>women</option><option>unisex</option></select>
      </div>
      <div className="field"><label>Category</label>
        <select value={form.categorySlug} onChange={(e) => set('categorySlug', e.target.value)}>{cats.map((c) => <option key={c.slug} value={c.slug}>{c.name} ({c.gender})</option>)}</select>
      </div>
      <div className="field">
        <label>Product images from desktop</label>
        <div className="admin-image-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={dropImages}>
          <input id="product-images" type="file" accept="image/*" multiple onChange={selectImages} />
          <label htmlFor="product-images"><b>Choose up to 5 images</b><span>or drag images here</span></label>
        </div>
        <small>{gallery.length}/5 images · First image is shown as the main product image.</small>
        {gallery.length > 0 && <div className="admin-image-previews">
          {gallery.map((item, index) => (
            <div
              className={`admin-image-preview ${index === 0 ? 'is-main' : ''}`}
              key={item.src}
              draggable
              onDragStart={() => setDraggedImage(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { moveImage(draggedImage, index); setDraggedImage(null); }}
            >
              <div className="admin-image-label">{index === 0 ? 'Main image' : `Thumbnail ${index}`}</div>
              <img src={item.src} alt={`${form.name || 'Product'} image ${index + 1}`} />
              {index !== 0 && <button type="button" onClick={() => moveImage(index, 0)}>Make main</button>}
              <button type="button" onClick={() => removeSelectedImage(index)}>Remove</button>
              <small>{item.kind === 'existing' ? 'Saved' : 'New upload'} · Drag to reorder</small>
            </div>
          ))}
        </div>}
      </div>
      <div className="field"><label>Image URLs (optional)</label><input value={(form.images || []).join(',')} onChange={(e) => { const images = e.target.value.split(',').map((s) => s.trim()).filter(Boolean); set('images', images); setGallery((items) => [...images.map((src) => ({ kind: 'existing', src })), ...items.filter((item) => item.kind === 'upload')].slice(0, 5)); }} /></div>
      <label><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured</label>
      <label><input type="checkbox" checked={form.bestseller} onChange={(e) => set('bestseller', e.target.checked)} /> Bestseller</label>
      <label><input type="checkbox" checked={form.newArrival} onChange={(e) => set('newArrival', e.target.checked)} /> New arrival</label>
      <label><input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active</label>
      <h3>Variants</h3>
      {form.variants.map((v, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 8 }}>
          <input placeholder="size" value={v.size} onChange={(e) => { const variants = [...form.variants]; variants[i] = { ...v, size: e.target.value }; set('variants', variants); }} />
          <input placeholder="color" value={v.color} onChange={(e) => { const variants = [...form.variants]; variants[i] = { ...v, color: e.target.value }; set('variants', variants); }} />
          <input placeholder="hex" value={v.colorHex} onChange={(e) => { const variants = [...form.variants]; variants[i] = { ...v, colorHex: e.target.value }; set('variants', variants); }} />
          <input placeholder="sku" value={v.sku} onChange={(e) => { const variants = [...form.variants]; variants[i] = { ...v, sku: e.target.value }; set('variants', variants); }} />
          <input type="number" placeholder="stock" value={v.stock} onChange={(e) => { const variants = [...form.variants]; variants[i] = { ...v, stock: Number(e.target.value) }; set('variants', variants); }} />
        </div>
      ))}
      <button type="button" className="btn btn-outline" onClick={() => set('variants', [...form.variants, { size: 'M', color: 'Onyx', colorHex: '#111', sku: '', stock: 0 }])}>Add variant</button>
      <button className="btn btn-dark" style={{ marginLeft: 8 }}>Save</button>
    </form>
  );
}

export function AdminInventory() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const { toast } = useUI();
  async function load() {
    const d = await api(`/admin/inventory?q=${encodeURIComponent(q)}`);
    setRows(d.rows || []);
  }
  useEffect(() => { load(); }, []);
  async function adjust(row, change) {
    await api('/admin/inventory/adjust', { method: 'POST', body: { productId: row.productId, size: row.size, color: row.color, change, note: 'Admin adjustment' } });
    toast('Stock updated');
    load();
  }
  return (
    <div>
      <h1>Inventory</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} /><button type="button" onClick={load}>Filter</button>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Size</th><th>Color</th><th>Stock</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.sku}>
              <td>{r.name}</td><td>{r.sku}</td><td>{r.size}</td><td>{r.color}</td><td>{r.stock}</td><td>{r.status}</td>
              <td>
                <button type="button" onClick={() => adjust(r, 1)}>+1</button>
                <button type="button" onClick={() => adjust(r, -1)}>-1</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <StockHistory />
    </div>
  );
}

function StockHistory() {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api('/admin/inventory/history').then((d) => setLogs(d.logs || [])); }, []);
  return (
    <>
      <h2>Stock history</h2>
      <table>
        <thead><tr><th>When</th><th>Product</th><th>Change</th><th>Reason</th></tr></thead>
        <tbody>{logs.map((l) => <tr key={l._id}><td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.product?.name}</td><td>{l.change}</td><td>{l.reason}</td></tr>)}</tbody>
      </table>
    </>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  async function load() {
    const d = await api(`/admin/orders${status ? `?status=${status}` : ''}`);
    setOrders(d.orders || []);
  }
  useEffect(() => { load(); }, [status]);
  return (
    <div>
      <h1>Orders</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All</option>
        {['Pending','Confirmed','Processing','Packed','Shipped','Delivered','Cancelled','Returned'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Contact</th><th>Address</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>{orders.map((o) => {
          const address = o.shippingAddress || {};
          return (
            <tr key={o._id}>
              <td><Link to={`/admin/orders/${o._id}`}>{o.orderNumber}</Link></td>
              <td>{address.firstName} {address.lastName}</td>
              <td>{o.email || address.email}<br />{address.phone || 'No phone'}</td>
              <td>{address.line1}, {address.city}, {address.state} {address.postalCode}, {address.country}</td>
              <td>{o.status}</td>
              <td>{money(o.total)}</td>
            </tr>
          );
        })}</tbody>
      </table>
    </div>
  );
}

export function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { toast } = useUI();
  useEffect(() => { api(`/orders/${id}`).then((d) => setOrder(d.order)); }, [id]);
  if (!order) return <p>Loading…</p>;
  async function patch(body) {
    const d = await api(`/admin/orders/${id}`, { method: 'PATCH', body });
    setOrder(d.order);
    toast('Order updated');
  }
  return (
    <div>
      <h1>{order.orderNumber}</h1>
      <select value={order.status} onChange={(e) => patch({ status: e.target.value })}>
        {['Pending','Confirmed','Processing','Packed','Shipped','Delivered','Cancelled','Returned'].map((s) => <option key={s}>{s}</option>)}
      </select>
      <section className="admin-detail-section">
        <h2>Customer details</h2>
        <p><b>Name:</b> {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
        <p><b>Email:</b> {order.email || order.shippingAddress?.email || 'Not provided'}</p>
        <p><b>Phone:</b> {order.shippingAddress?.phone || 'Not provided'}</p>
        <p><b>Address:</b> {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}</p>
      </section>
      <section className="admin-detail-section">
        <h2>Order details</h2>
        <p><b>Shipping:</b> {order.shippingMethod?.name || 'Standard'} ({order.shippingMethod?.eta || 'N/A'})</p>
        <p><b>Payment:</b> {order.payment?.method || 'N/A'} · {order.payment?.status || 'pending'}</p>
        <p><b>Total:</b> {money(order.total)}</p>
        <ul>
          {(order.items || []).map((item) => (
            <li key={`${item.sku}-${item.size}-${item.color}`}>
              {item.name} · {item.size} · {item.color} × {item.quantity} · {money(item.price)}
            </li>
          ))}
        </ul>
      </section>
      <div className="field"><label>Tracking</label><input defaultValue={order.trackingNumber} onBlur={(e) => patch({ trackingNumber: e.target.value, carrier: 'EA Logistics' })} /></div>
      <button type="button" className="btn btn-outline" onClick={() => patch({ refund: true })}>Mark refunded</button>
      {order.returnRequest?.requested && (
        <div>
          <p>Return: {order.returnRequest.reason} ({order.returnRequest.status})</p>
          <button type="button" onClick={() => patch({ returnStatus: 'approved' })}>Approve return</button>
        </div>
      )}
    </div>
  );
}

export function AdminCustomers() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api('/admin/customers').then((d) => setRows(d.customers || [])); }, []);
  return (
    <div>
      <h1>Customers</h1>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>{rows.map((c) => <tr key={c.id}><td><Link to={`/admin/customers/${c.id}`}>{c.firstName} {c.lastName}</Link></td><td>{c.email}</td><td>{c.isActive ? 'Active' : 'Disabled'}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminCustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api(`/admin/customers/${id}`).then(setData); }, [id]);
  if (!data) return <p>Loading…</p>;
  return (
    <div>
      <h1>{data.customer.firstName} {data.customer.lastName}</h1>
      <p>{data.customer.email} · {data.orderCount} orders · {money(data.spent)}</p>
      <button type="button" onClick={() => api(`/admin/customers/${id}`, { method: 'PATCH', body: { isActive: !data.customer.isActive } }).then(() => api(`/admin/customers/${id}`).then(setData))}>
        {data.customer.isActive ? 'Disable' : 'Enable'}
      </button>
      {data.orders.map((o) => <p key={o._id}>{o.orderNumber} {o.status} {money(o.total)}</p>)}
    </div>
  );
}

export function AdminReviews() {
  const [rows, setRows] = useState([]);
  async function load() { setRows((await api('/admin/reviews')).reviews || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Reviews</h1>
      {rows.map((r) => (
        <div key={r._id} style={{ padding: 12, background: '#fff', marginBottom: 8 }}>
          <p>{r.product?.name} · {r.rating}/5 · {r.status}</p>
          <p>{r.comment}</p>
          <button type="button" onClick={() => api(`/admin/reviews/${r._id}`, { method: 'PATCH', body: { status: 'approved' } }).then(load)}>Approve</button>
          <button type="button" onClick={() => api(`/admin/reviews/${r._id}`, { method: 'PATCH', body: { status: 'rejected' } }).then(load)}>Reject</button>
          <button type="button" onClick={() => api(`/admin/reviews/${r._id}`, { method: 'DELETE' }).then(load)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export function AdminCoupons() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: 10, minOrderValue: 0 });
  async function load() { setRows((await api('/admin/coupons')).coupons || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Coupons / discounts</h1>
      <form onSubmit={async (e) => { e.preventDefault(); await api('/admin/coupons', { method: 'POST', body: form }); load(); }}>
        <input placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>percentage</option><option>fixed</option></select>
        <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <button className="btn btn-dark">Create</button>
      </form>
      <table>
        <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th></tr></thead>
        <tbody>{rows.map((c) => <tr key={c._id}><td>{c.code}</td><td>{c.type}</td><td>{c.value}</td><td>{c.usedCount}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminPayments() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api('/admin/payments').then((d) => setRows(d.payments || [])); }, []);
  return (
    <div>
      <h1>Payments</h1>
      <table>
        <thead><tr><th>Txn</th><th>Amount</th><th>Status</th><th>Provider</th></tr></thead>
        <tbody>{rows.map((p) => <tr key={p._id}><td>{p.transactionId}</td><td>{money(p.amount)}</td><td>{p.status}</td><td>{p.provider}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminReturns() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const { toast } = useUI();

  async function load() {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await api(`/admin/returns${query}`);
    setRows(data.returns || []);
  }

  useEffect(() => { load(); }, [status]);

  async function updateReturn(id, nextStatus) {
    await api(`/admin/returns/${id}`, { method: 'PATCH', body: { status: nextStatus } });
    toast(`Return marked ${nextStatus}`);
    load();
  }

  return (
    <div>
      <h1>Returns</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {['requested', 'approved', 'rejected', 'received', 'refunded', 'cancelled'].map((item) => <option key={item}>{item}</option>)}
      </select>
      {!rows.length && <p className="empty-state">No return requests found.</p>}
      {rows.map((item) => (
        <article key={item._id} className="admin-return-row">
          <div>
            <strong>{item.order?.orderNumber || 'Order'}</strong>
            <p>{item.user?.firstName} {item.user?.lastName} · {item.user?.email}</p>
            <p>{item.reason} · {item.status}</p>
          </div>
          <div className="admin-inline-actions">
            {item.status === 'requested' && <><button type="button" onClick={() => updateReturn(item._id, 'approved')}>Approve</button><button type="button" onClick={() => updateReturn(item._id, 'rejected')}>Reject</button></>}
            {item.status === 'approved' && <button type="button" onClick={() => updateReturn(item._id, 'received')}>Mark received</button>}
            {item.status === 'received' && <button type="button" onClick={() => updateReturn(item._id, 'refunded')}>Process refund</button>}
          </div>
        </article>
      ))}
    </div>
  );
}

export function AdminShipping() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('Shipped');
  const { toast } = useUI();

  async function load() {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const data = await api(`/admin/orders${query}`);
    setOrders(data.orders || []);
  }

  useEffect(() => { load(); }, [status]);

  async function updateShipping(id, body) {
    await api(`/admin/orders/${id}`, { method: 'PATCH', body });
    toast('Shipping information updated');
    load();
  }

  return (
    <div>
      <h1>Shipping</h1>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All orders</option>
        {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((item) => <option key={item}>{item}</option>)}
      </select>
      {!orders.length && <p className="empty-state">No shipping orders found.</p>}
      <div className="admin-shipping-list">
        {orders.map((order) => (
          <article key={order._id} className="admin-shipping-row">
            <div><strong>{order.orderNumber}</strong><p>{order.email} · {money(order.total)}</p></div>
            <input defaultValue={order.trackingNumber || ''} placeholder="Tracking number" onBlur={(e) => e.target.value !== (order.trackingNumber || '') && updateShipping(order._id, { trackingNumber: e.target.value, carrier: order.carrier || 'EA Logistics' })} />
            <select value={order.status} onChange={(e) => updateShipping(order._id, { status: e.target.value })}>
              {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AdminSimple({ title, text }) {
  return <div><h1>{title}</h1><p>{text}</p></div>;
}

export function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ firstName: 'Ops', lastName: 'Admin', email: '', password: 'Admin123!' });
  async function load() { setRows((await api('/admin/admins')).admins || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h1>Admin users</h1>
      <form onSubmit={async (e) => { e.preventDefault(); await api('/admin/admins', { method: 'POST', body: form }); load(); }}>
        <input placeholder="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button className="btn btn-dark">Add admin</button>
      </form>
      {rows.map((a) => <p key={a.id}>{a.email}</p>)}
    </div>
  );
}

export function AdminSettings() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { api('/admin/settings').then((d) => setSettings(d.settings)); }, []);
  if (!settings) return <p>Loading…</p>;
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await api('/admin/settings', { method: 'PATCH', body: settings }); alert('Saved'); }}>
      <h1>Settings</h1>
      <div className="field"><label>Store name</label><input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} /></div>
      <div className="field"><label>Support email</label><input value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} /></div>
      <div className="field"><label>Free shipping min</label><input type="number" value={settings.freeShippingMin} onChange={(e) => setSettings({ ...settings, freeShippingMin: Number(e.target.value) })} /></div>
      <label><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} /> Maintenance mode</label>
      <button className="btn btn-dark">Save</button>
    </form>
  );
}

export function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name: '', gender: 'men' });
  const [editingId, setEditingId] = useState(null);
  const { toast } = useUI();
  async function load() { setRows((await api('/products/categories')).categories || []); }
  useEffect(() => { load(); }, []);
  async function save(e) {
    e.preventDefault();
    const path = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
    await api(path, { method: editingId ? 'PATCH' : 'POST', body: form });
    setForm({ name: '', gender: 'men' });
    setEditingId(null);
    toast(editingId ? 'Category updated' : 'Category created');
    load();
  }
  return (
    <div>
      <h1>Categories</h1>
      <form onSubmit={save}>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}><option>men</option><option>women</option><option>all</option></select>
        <button className="btn btn-dark">{editingId ? 'Save changes' : 'Add'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', gender: 'men' }); }}>Cancel</button>}
      </form>
      {rows.map((c) => (
        <div key={c._id} className="admin-category-row">
          <span>{c.name} · {c.gender} · {c.slug}</span>
          <div className="admin-inline-actions">
            <button type="button" onClick={() => { setEditingId(c._id); setForm({ name: c.name, gender: c.gender }); }}>Edit</button>
            <button type="button" onClick={async () => { await api(`/admin/categories/${c._id}`, { method: 'PATCH', body: { isActive: !c.isActive } }); toast('Category status updated'); load(); }}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
            <button type="button" onClick={async () => { if (confirm('Delete this category?')) { await api(`/admin/categories/${c._id}`, { method: 'DELETE' }); toast('Category deleted'); load(); } }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
