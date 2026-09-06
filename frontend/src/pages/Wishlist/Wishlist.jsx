import { Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { EmptyState } from '../../components/common/States';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useSeo } from '../../hooks/useSeo';
import { useUI } from '../../context/UIContext';

export default function Wishlist() {
  useSeo({ title: 'Wishlist' });
  const { products } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useUI();

  if (!products.length) {
    return <EmptyState title="No saved pieces" text="Tap the heart on a product to keep it here." action={<Link className="btn btn-dark" to="/shop">Shop</Link>} />;
  }

  return (
    <main className="page">
      <div className="container">
        <h1>Wishlist</h1>
        <div className="grid-products" style={{ marginTop: 24 }}>
          {products.map((p) => (
            <div key={p._id}>
              <ProductCard product={p} />
              <button
                className="btn btn-outline btn-full"
                type="button"
                onClick={async () => {
                  const v = p.variants?.[0];
                  if (!v) return;
                  await addItem({ productId: p._id, size: v.size, color: v.color, quantity: 1 });
                  toast('Moved to bag');
                }}
              >
                Move to bag
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
