import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { SkeletonGrid, EmptyState, ErrorState } from '../../components/common/States';
import { useSeo } from '../../hooks/useSeo';

export default function Shop({ title = 'Shop all', preset = {} }) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ products: [], pagination: {} });
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = {
    q: params.get('q') || '',
    gender: params.get('gender') || preset.gender || '',
    category: params.get('category') || preset.category || '',
    sort: params.get('sort') || 'newest',
    page: params.get('page') || '1',
    size: params.get('size') || '',
    color: params.get('color') || '',
    sale: params.get('sale') || preset.sale || '',
    new: params.get('new') || preset.new || '',
    bestseller: params.get('bestseller') || preset.bestseller || '',
    inStock: params.get('inStock') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
  };

  useSeo({ title, description: `${title} at EA Fitness Clothing.` });

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  }

  useEffect(() => {
    api('/products/categories').then((d) => setCats(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    qs.set('limit', '12');
    api(`/products?${qs.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.toString(), JSON.stringify(preset)]);

  return (
    <main className="page">
      <div className="container">
        <h1 style={{ fontSize: 52, marginBottom: 28 }}>{title}</h1>
        <div className="shop-layout">
          <aside className="filters">
            <h3>Search</h3>
            <input className="field" style={{ minHeight: 44, padding: 10, width: '100%' }} value={query.q} onChange={(e) => setFilter('q', e.target.value)} placeholder="Search" />
            <h3>Gender</h3>
            <div className="filter-row">
              {['', 'men', 'women'].map((g) => (
                <label key={g}><input type="radio" checked={query.gender === g} onChange={() => setFilter('gender', g)} /> {g || 'All'}</label>
              ))}
            </div>
            <h3>Category</h3>
            <select value={query.category} onChange={(e) => setFilter('category', e.target.value)}>
              <option value="">All categories</option>
              {cats.map((c) => <option key={c._id} value={c.slug}>{c.name} ({c.gender})</option>)}
            </select>
            <h3>Size</h3>
            <div className="sizes">{['XS','S','M','L','XL','XXL'].map((s) => (
              <button key={s} type="button" className={query.size === s ? 'active' : ''} onClick={() => setFilter('size', query.size === s ? '' : s)}>{s}</button>
            ))}</div>
            <h3>Availability</h3>
            <label><input type="checkbox" checked={query.inStock === 'true'} onChange={(e) => setFilter('inStock', e.target.checked ? 'true' : '')} /> In stock</label>
            <h3>Price</h3>
            <input placeholder="Min" value={query.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} />
            <input placeholder="Max" value={query.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} style={{ marginTop: 8 }} />
          </aside>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <p className="muted">{data.pagination?.total || 0} pieces</p>
              <select value={query.sort} onChange={(e) => setFilter('sort', e.target.value)}>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
            {loading && <SkeletonGrid />}
            {error && <ErrorState message={error} onRetry={() => setParams(params)} />}
            {!loading && !error && !data.products?.length && <EmptyState title="No products found" text="Try a different filter." />}
            {!loading && !error && (
              <div className="grid-products">
                {data.products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
            {data.pagination?.pages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
                {Array.from({ length: data.pagination.pages }).map((_, i) => (
                  <button key={i} type="button" className={`btn ${Number(query.page) === i + 1 ? 'btn-dark' : 'btn-outline'}`} onClick={() => setFilter('page', String(i + 1))}>{i + 1}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
