import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { money, displayPrice } from '../../utils/money';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { imageUrl } from '../../utils/imageUrl';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const { user } = useAuth();
  const { toast } = useUI();
  const price = displayPrice(product);
  const first = product.variants?.[0];
  const category = product.category?.name || product.categorySlug?.split('-').slice(1).join(' ') || 'Training';
  const rating = Math.round(product.ratingAvg || 0);

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
          <img src={imageUrl(product.images?.[0])} alt={product.name} loading="lazy" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = FALLBACK_IMAGE; }} />
        </Link>
        <div className="card-badges">
          {product.newArrival && <span className="badge badge-new">New</span>}
          {product.onSale && <span className="badge badge-sale">Sale</span>}
        </div>
        <div className="quick">
          <button type="button" className="btn btn-light btn-full" onClick={quickAdd}>
            <ShoppingBag size={15} /> Quick add
          </button>
        </div>
      </div>
      <div className="product-card-info">
        <div className="product-card-topline">
          <span className="product-category">{category}</span>
          <button type="button" className="nav-icon" aria-label="Wishlist" onClick={wish}>
          <Heart size={18} fill={has(product._id) ? '#111' : 'none'} />
          </button>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
          <div className="product-card-rating" aria-label={`${product.ratingAvg || 0} out of 5 stars`}>
            <span>{[0,1,2,3,4].map((star) => <Star key={star} size={12} fill={star < rating ? 'currentColor' : 'none'} />)}</span>
            <small>{product.ratingCount ? `(${product.ratingCount})` : 'New'}</small>
          </div>
          <div className="price">
            <span>{money(price.current)}</span>
            {price.original && <s>{money(price.original)}</s>}
          </div>
        </Link>
        <button type="button" className="btn btn-dark product-card-add" onClick={quickAdd}>
          <ShoppingBag size={15} /> Add to cart
        </button>
      </div>
    </article>
  );
}
