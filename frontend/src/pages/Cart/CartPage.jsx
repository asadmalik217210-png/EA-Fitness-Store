import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { money } from '../../utils/money';
import { imageUrl } from '../../utils/imageUrl';
import { EmptyState } from '../../components/common/States';
import { useSeo } from '../../hooks/useSeo';
import { useUI } from '../../context/UIContext';
import { api } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';

export default function CartPage() {
  useSeo({ title: 'Cart' });
  const { cart, updateQty, removeItem } = useCart();
  const { toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useUI();
  const [upsell, setUpsell] = useState([]);
  const shipping = cart.subtotal >= 100 ? 0 : 8;

  useEffect(() => {
    api('/products?sort=popularity&limit=4').then((data) => setUpsell(data.products || [])).catch(() => {});
  }, []);

  if (!cart.items?.length) {
    return <EmptyState title="Your bag is empty" text="Start with a training essential." action={<Link className="btn btn-dark" to="/shop">Continue shopping</Link>} />;
  }

  return (
    <main className="page">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.4fr .7fr', gap: 32 }}>
        <div className="cart-table">
          <h1>Bag</h1>
          {cart.items.map((item) => (
            <div className="cart-row" key={item._id}>
              <img src={imageUrl(item.product.images?.[0])} alt={item.product.name} />
              <div>
                <Link to={`/product/${item.product.slug}`}><strong>{item.product.name}</strong></Link>
                <p className="muted">{item.size} / {item.color}</p>
                <div className="qty" style={{ margin: '10px 0' }}>
                  <button type="button" onClick={() => updateQty(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                </div>
                <button type="button" className="muted" style={{ border: 0, background: 'none' }} onClick={() => removeItem(item._id)}>Remove</button>
                {user && (
                  <button type="button" className="muted" style={{ border: 0, background: 'none', marginLeft: 12 }} onClick={async () => { await toggle(item.product._id); toast('Saved to wishlist'); }}>
                    Save to wishlist
                  </button>
                )}
              </div>
              <strong>{money(item.lineTotal)}</strong>
            </div>
          ))}
        </div>
        <aside className="summary">
          <h2>Summary</h2>
          <div className="summary-line"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
          <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'Free'}</span></div>
          <div className="summary-line"><b>Total</b><b>{money(cart.subtotal + shipping)}</b></div>
          <Link className="btn btn-dark btn-full" to="/checkout">Checkout</Link>
          <Link className="btn btn-outline btn-full" style={{ marginTop: 8 }} to="/shop">Continue shopping</Link>
        </aside>
      </div>
      {upsell.length > 0 && <section className="cart-upsell container"><div className="upsell-heading"><div><p className="eyebrow">Complete the set</p><h2>You may also like</h2></div><span>Easy additions to your rotation</span></div><div className="grid-products">{upsell.map((product) => <ProductCard key={product._id} product={product} />)}</div></section>}
    </main>
  );
}
