import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { money, displayPrice } from '../../utils/money';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useUI();
  const price = displayPrice(product);
  const first = product.variants?.[0];

  async function quickAdd() {
    if (!first) return toast('This piece is currently unavailable');
    try {
      await addItem({ productId: product._id, size: first.size, color: first.color, quantity: 1 });
      toast('Added to bag');
    } catch (err) {
      toast(err.message);
    }
  }

  async function wish() {
    if (!user) return toast('Log in to save pieces');
    await toggle(product._id);
  }

  return (
    <article className="product-card">
      <div className="media">
        <Link to={`/product/${product.slug}`}>
          <img src={product.images?.[0]} alt={product.name} loading="lazy" />
        </Link>
        <div className="card-badges">
          {product.newArrival && <span className="badge badge-new">New</span>}
          {product.onSale && <span className="badge badge-sale">Sale</span>}
        </div>
        <div className="quick">
          <button type="button" className="btn btn-light btn-full" onClick={quickAdd}>
            Quick add
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Link to={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
          <div className="price">
            <span>{money(price.current)}</span>
            {price.original && <s>{money(price.original)}</s>}
          </div>
        </Link>
        <button type="button" className="nav-icon" aria-label="Wishlist" onClick={wish} style={{ height: 28 }}>
          <Heart size={18} fill={has(product._id) ? '#111' : 'none'} />
        </button>
      </div>
    </article>
  );
}
