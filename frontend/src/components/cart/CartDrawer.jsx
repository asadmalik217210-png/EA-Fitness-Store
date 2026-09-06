import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/money';
import { imageUrl } from '../../utils/imageUrl';

export default function CartDrawer() {
  const { cart, open, setOpen, updateQty, removeItem } = useCart();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            className="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
            aria-label="Cart"
          >
            <div className="drawer-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Your bag ({cart.itemCount || 0})</strong>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" style={{ border: 0, background: 'transparent' }}>
                <X />
              </button>
            </div>
            <div className="drawer-body">
              {!cart.items?.length && <p className="muted">Your bag is empty.</p>}
              {cart.items?.map((item) => (
                <div key={item._id} className="cart-row" style={{ gridTemplateColumns: '72px 1fr', marginBottom: 16 }}>
                  <img src={imageUrl(item.product.images?.[0])} alt="" />
                  <div>
                    <strong>{item.product.name}</strong>
                    <p className="muted">{item.size} / {item.color}</p>
                    <div className="qty" style={{ margin: '8px 0' }}>
                      <button type="button" onClick={() => updateQty(item._id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <button type="button" className="muted" style={{ border: 0, background: 'none' }} onClick={() => removeItem(item._id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="drawer-foot">
              <div className="summary-line"><span>Subtotal</span><b>{money(cart.subtotal)}</b></div>
              <Link className="btn btn-dark btn-full" to="/cart" onClick={() => setOpen(false)}>View bag</Link>
              <Link className="btn btn-outline btn-full" style={{ marginTop: 8 }} to="/checkout" onClick={() => setOpen(false)}>Checkout</Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
