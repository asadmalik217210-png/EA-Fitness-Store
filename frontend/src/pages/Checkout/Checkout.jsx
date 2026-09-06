import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { money } from '../../utils/money';
import { useSeo } from '../../hooks/useSeo';
import { useUI } from '../../context/UIContext';

const STEPS = ['Information', 'Shipping', 'Payment', 'Review'];

export default function Checkout() {
  useSeo({ title: 'Checkout' });
  const { cart, refresh } = useCart();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [methods, setMethods] = useState([]);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: 'United States',
    shippingMethodId: 'standard', paymentMethod: 'card',
  });

  useEffect(() => {
    api('/orders/shipping-methods').then((d) => setMethods(d.methods || []));
  }, []);

  const method = methods.find((m) => m.id === form.shippingMethodId) || { price: 8 };
  const shippingPrice = cart.subtotal >= 100 && form.shippingMethodId === 'standard' ? 0 : method.price || 0;
  const total = Math.max(0, cart.subtotal - discount + shippingPrice);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function applyCoupon() {
    try {
      const data = await api('/orders/validate-coupon', { method: 'POST', body: { code: coupon } });
      setDiscount(data.discount);
      toast(`Coupon applied: ${data.code}`);
    } catch (e) {
      toast(e.message);
    }
  }

  async function place() {
    setLoading(true);
    try {
      const data = await api('/orders', {
        method: 'POST',
        body: {
          shippingAddress: form,
          email: form.email,
          shippingMethodId: form.shippingMethodId,
          paymentMethod: form.paymentMethod,
          couponCode: coupon || undefined,
        },
      });
      await refresh();
      navigate(`/order-confirmation/${data.order._id}`, { state: { order: data.order } });
    } catch (e) {
      toast(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 32 }}>
        <div>
          <div className="steps">{STEPS.map((s, i) => <span key={s} className={`step ${i === step ? 'active' : ''}`}>{i + 1}. {s}</span>)}</div>
          {step === 0 && (
            <div>
              {['firstName','lastName','email','phone','line1','city','state','postalCode','country'].map((k) => (
                <div className="field" key={k}>
                  <label>{k}</label>
                  <input required value={form[k]} onChange={(e) => set(k, e.target.value)} />
                </div>
              ))}
              <button className="btn btn-dark" onClick={() => setStep(1)}>Continue to shipping</button>
            </div>
          )}
          {step === 1 && (
            <div>
              {methods.map((m) => (
                <label key={m.id} style={{ display: 'block', padding: 12, border: '1px solid #eee', marginBottom: 8 }}>
                  <input type="radio" checked={form.shippingMethodId === m.id} onChange={() => set('shippingMethodId', m.id)} /> {m.name} — {money(m.price)} · {m.eta}
                </label>
              ))}
              <button className="btn btn-dark" onClick={() => setStep(2)}>Continue to payment</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <p className="muted">Card details are handled securely on the server. This checkout uses a configurable mock gateway until live keys are added.</p>
              {['card', 'cod'].map((m) => (
                <label key={m} style={{ display: 'block', padding: 12, border: '1px solid #eee', marginBottom: 8 }}>
                  <input type="radio" checked={form.paymentMethod === m} onChange={() => set('paymentMethod', m)} /> {m === 'card' ? 'Card (secure mock)' : 'Cash on delivery'}
                </label>
              ))}
              <button className="btn btn-dark" onClick={() => setStep(3)}>Review order</button>
            </div>
          )}
          {step === 3 && (
            <div>
              <p>{form.firstName} {form.lastName}<br />{form.line1}, {form.city}</p>
              <button className="btn btn-dark" disabled={loading} onClick={place}>{loading ? 'Placing…' : 'Place order'}</button>
            </div>
          )}
        </div>
        <aside className="summary">
          {cart.items?.map((i) => (
            <div key={i._id} className="summary-line"><span>{i.product.name} × {i.quantity}</span><span>{money(i.lineTotal)}</span></div>
          ))}
          <div className="field" style={{ marginTop: 12 }}>
            <label>Coupon</label>
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="TRAIN10" />
            <button type="button" className="btn btn-outline" style={{ marginTop: 8 }} onClick={applyCoupon}>Apply</button>
          </div>
          <div className="summary-line"><span>Subtotal</span><span>{money(cart.subtotal)}</span></div>
          <div className="summary-line"><span>Discount</span><span>-{money(discount)}</span></div>
          <div className="summary-line"><span>Shipping</span><span>{money(shippingPrice)}</span></div>
          <div className="summary-line"><b>Total</b><b>{money(total)}</b></div>
          <Link to="/cart">Back to bag</Link>
        </aside>
      </div>
    </main>
  );
}
