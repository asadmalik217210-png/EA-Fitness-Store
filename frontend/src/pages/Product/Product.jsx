import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShieldCheck, Truck, RefreshCcw, Ruler, Zap, Star } from 'lucide-react';
import { api } from '../../services/api';
import { money, displayPrice } from '../../utils/money';
import ProductCard from '../../components/product/ProductCard';
import { Loader, ErrorState } from '../../components/common/States';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useSeo } from '../../hooks/useSeo';
import { imageUrl } from '../../utils/imageUrl';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useUI();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [img, setImg] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ x: 50, y: 50 });
  const [tab, setTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useSeo({ title: product?.name || 'Product', description: product?.description });

  useEffect(() => {
    setError('');
    api(`/products/slug/${slug}`)
      .then((d) => {
        setProduct(d.product);
        setColor(d.product.variants?.[0]?.color || '');
        setSize(d.product.variants?.[0]?.size || '');
        const viewed = JSON.parse(localStorage.getItem('ea_viewed') || '[]');
        const next = [d.product, ...viewed.filter((p) => p._id !== d.product._id)].slice(0, 8);
        localStorage.setItem('ea_viewed', JSON.stringify(next));
      })
      .catch((e) => setError(e.message));
    api(`/products/slug/${slug}/related`).then((d) => setRelated(d.products || []));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    api(`/reviews/product/${product._id}`).then((d) => setReviews(d.reviews || []));
  }, [product?._id]);

  const colors = useMemo(() => {
    const map = new Map();
    product?.variants?.forEach((v) => map.set(v.color, v));
    return [...map.values()];
  }, [product]);
  const sizes = useMemo(
    () => [...new Set(product?.variants?.filter((v) => v.color === color).map((v) => v.size) || [])],
    [product, color]
  );
  const variant = product?.variants?.find((v) => v.size === size && v.color === color);
  const price = product ? displayPrice(product) : { current: 0 };

  async function add(buyNow) {
    try {
      await addItem({ productId: product._id, size, color, quantity: qty });
      toast('Added to bag');
      if (buyNow) navigate('/checkout');
    } catch (e) {
      toast(e.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    try {
      await api('/reviews', { method: 'POST', body: { productId: product._id, ...reviewForm } });
      toast('Review submitted for approval');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast(err.message);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!product) return <Loader />;

  const viewed = JSON.parse(localStorage.getItem('ea_viewed') || '[]').filter((p) => p._id !== product._id);

  return (
    <main className="page">
      <div className="container product-hero-grid">
        <div className="gallery product-gallery">
          <div className="thumbs">
            {product.images.map((src, i) => (
              <button key={src} type="button" className={img === i ? 'active' : ''} onClick={() => setImg(i)}>
                <img src={imageUrl(src)} alt="" />
              </button>
            ))}
          </div>
          <div
            className="main-img product-main-image"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
          >
            <img src={imageUrl(product.images[img])} alt={product.name} style={{ transform: 'scale(1.08)', transformOrigin: `${zoom.x}% ${zoom.y}%` }} />
          </div>
        </div>
        <div className="product-buy-panel">
          <div className="product-kicker"><span>{product.gender}</span><span>{product.sku}</span></div>
          <div className="product-title-row">
            <h1>{product.name}</h1>
            <button className="product-heart" type="button" aria-label="Add to wishlist" onClick={() => (user ? toggle(product._id) : toast('Log in to save'))}>
              <Heart size={21} fill={has(product._id) ? '#111' : 'none'} />
            </button>
          </div>
          <div className="price product-price">
            <span>{money(price.current)}</span>
            {price.original && <s>{money(price.original)}</s>}
          </div>
          <div className="product-rating"><span className="product-rating-stars">{[0,1,2,3,4].map((star) => <Star key={star} size={15} fill={star < Math.round(product.ratingAvg || 0) ? 'currentColor' : 'none'} />)}</span> <b>{product.ratingAvg || 'New'}</b> <a href="#reviews">{product.ratingCount || 0} reviews</a></div>
          <p className="product-intro">{product.description}</p>
          <div className={`stock-note ${variant?.stock > 0 ? '' : 'is-out'}`}><span className="stock-dot" />{variant?.stock > 0 ? `${variant.stock} available in this size` : 'This variant is out of stock'}</div>
          <h3 className="choice-label">Color <span>{color}</span></h3>
          <div className="swatches">
            {colors.map((v) => (
              <button key={v.color} type="button" title={v.color} className={`swatch ${color === v.color ? 'active' : ''}`} style={{ background: v.colorHex }} onClick={() => setColor(v.color)} />
            ))}
          </div>
          <h3 className="choice-label">Size <Link to="/size-guide">Size guide <Ruler size={14} /></Link></h3>
          <div className="sizes product-sizes">
            {sizes.map((s) => (
              <button key={s} type="button" className={size === s ? 'active' : ''} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
          <h3 className="choice-label">Quantity</h3>
          <div className="qty product-qty">
            <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button type="button" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <div className="product-actions">
            <button className="btn btn-dark" disabled={!variant?.stock} onClick={() => add(false)}>Add to cart</button>
            <button className="btn btn-outline" disabled={!variant?.stock} onClick={() => add(true)}>Buy now</button>
          </div>
          <div className="product-trust-row">
            <span><Truck size={17} /> Fast dispatch</span><span><ShieldCheck size={17} /> Secure checkout</span><span><RefreshCcw size={17} /> Easy returns</span>
          </div>
          <div className="product-tabs">
            {['description', 'materials', 'shipping', 'returns'].map((t) => (
              <button key={t} type="button" className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <div className="product-tab-copy">
            {tab === 'description' && <p>{product.description}</p>}
            {tab === 'materials' && <p>{product.material}<br />{product.careInstructions}</p>}
            {tab === 'shipping' && <p>{product.shippingInfo}</p>}
            {tab === 'returns' && <p>{product.returnsInfo}</p>}
          </div>
        </div>
      </div>
      <section className="product-benefits">
        <div className="container product-benefits-grid">
          <div><Zap size={20} /><span>Built to move</span><p>Four-way stretch and an athletic cut that follows the session.</p></div>
          <div><ShieldCheck size={20} /><span>Engineered finish</span><p>Dense technical fabrics, clean seams and considered details.</p></div>
          <div><Truck size={20} /><span>Ready when you are</span><p>Dispatch in 1–3 business days with live order updates.</p></div>
        </div>
      </section>
      <div id="reviews" className="container product-lower-content">
        <div className="reviews-heading"><div><p className="eyebrow">The community</p><h2>Reviews</h2></div><span className="review-score"><span className="review-score-stars">{[0,1,2,3,4].map((star) => <Star key={star} size={16} fill={star < Math.round(product.ratingAvg || 0) ? 'currentColor' : 'none'} />)}</span> {product.ratingAvg || '—'} <small>/ 5</small></span></div>
        {reviews.map((r) => (
          <div key={r._id} style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
            <strong>{r.user?.firstName} {r.user?.lastName}</strong> · {r.rating}/5
            <p>{r.comment}</p>
          </div>
        ))}
        {user && (
          <form onSubmit={submitReview} style={{ maxWidth: 480, marginTop: 16 }}>
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} stars</option>)}
            </select>
            <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} style={{ width: '100%', minHeight: 90, marginTop: 8 }} />
            <button className="btn btn-dark" style={{ marginTop: 8 }}>Submit review</button>
          </form>
        )}
        <section className="fit-report">
          <div className="fit-report-visual">
            <img src={imageUrl(product.images?.[1] || product.images?.[0])} alt={`${product.name} detail`} />
            <span>EA / FIELD TESTED</span>
          </div>
          <div className="fit-report-copy">
            <p className="eyebrow">The EA fit report</p>
            <h2>Made for the reps that count.</h2>
            <p className="fit-report-lead">A considered balance of movement, structure and everyday ease. Wear it through the warm-up, the work set and whatever comes after.</p>
            <div className="fit-report-stats">
              <div><strong>01</strong><span>Move</span><p>Flexible where your range needs it.</p></div>
              <div><strong>02</strong><span>Hold</span><p>A clean fit that stays composed.</p></div>
              <div><strong>03</strong><span>Repeat</span><p>Built for a rotation, not a single session.</p></div>
            </div>
          </div>
        </section>
        <section className="session-edit">
          <div className="session-edit-heading">
            <div>
              <p className="eyebrow">One piece, three settings</p>
              <h2>From warm-up to wind-down.</h2>
            </div>
            <p>Designed to move through the whole day without losing its point of view.</p>
          </div>
          <div className="session-edit-list">
            <div><span>01</span><strong>Warm-up</strong><p>Light layers, easy movement, no distractions.</p></div>
            <div><span>02</span><strong>Work set</strong><p>Secure where it matters when the intensity rises.</p></div>
            <div><span>03</span><strong>After hours</strong><p>A clean silhouette that earns its place outside the gym.</p></div>
          </div>
        </section>
        <div className="upsell-heading"><div><p className="eyebrow">Complete the set</p><h2>Pairs well with</h2></div><span>Curated for your next session</span></div>
        <div className="grid-products">{related.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        {viewed.length > 0 && (
          <>
            <h2 style={{ marginTop: 48 }}>Recently viewed</h2>
            <div className="grid-products">{viewed.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          </>
        )}
      </div>
      <div className="mobile-buy-bar"><strong>{money(price.current)}</strong><button className="btn btn-dark" disabled={!variant?.stock} onClick={() => add(false)}>Add to cart</button></div>
    </main>
  );
}
