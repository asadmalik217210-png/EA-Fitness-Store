import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { money } from '../../utils/money';
import { Loader } from '../../components/common/States';
import { useSeo } from '../../hooks/useSeo';

const FLOW = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];

function Timeline({ order }) {
  const current = order.status;
  return (
    <div className="timeline">
      {FLOW.map((s) => (
        <div key={s} className={`tl-item ${FLOW.indexOf(current) >= FLOW.indexOf(s) || current === s ? 'done' : ''}`}>
          <strong>{s}</strong>
        </div>
      ))}
      {(order.status === 'Cancelled' || order.status === 'Returned') && (
        <div className="tl-item done"><strong>{order.status}</strong></div>
      )}
    </div>
  );
}

export function OrderConfirmation() {
  useSeo({ title: 'Order confirmed' });
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order);
  useEffect(() => {
    if (!order) api(`/orders/${id}`).then((d) => setOrder(d.order)).catch(() => {});
  }, [id]);
  if (!order) return <Loader />;
  return (
    <main className="page">
      <div className="container content-page">
        <h1>Order confirmed</h1>
        <p>Order number <strong>{order.orderNumber}</strong></p>
        <p>Total {money(order.total)}. A confirmation is saved to your account.</p>
        <Timeline order={order} />
        <Link className="btn btn-dark" to={`/orders/${order._id}`}>View order</Link>
      </div>
    </main>
  );
}

export function Orders() {
  useSeo({ title: 'My orders' });
  const [orders, setOrders] = useState([]);
  useEffect(() => { api('/orders/mine').then((d) => setOrders(d.orders || [])); }, []);
  return (
    <main className="page">
      <div className="container">
        <h1>My orders</h1>
        {!orders.length && <p>No orders yet.</p>}
        {orders.map((o) => (
          <Link key={o._id} to={`/orders/${o._id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, borderBottom: '1px solid #eee' }}>
            <span>{o.orderNumber}</span><span>{o.status}</span><span>{money(o.total)}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function OrderDetails() {
  useSeo({ title: 'Order details' });
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api(`/orders/${id}`).then((d) => setOrder(d.order)); }, [id]);
  if (!order) return <Loader />;
  return (
    <main className="page">
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <h1>{order.orderNumber}</h1>
          <p>Status: {order.status}</p>
          {order.items.map((i) => (
            <div key={i.sku} className="summary-line"><span>{i.name} {i.size}/{i.color} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span></div>
          ))}
          <p>Total {money(order.total)}</p>
        </div>
        <div>
          <h2>Tracking</h2>
          <p>{order.carrier || 'EA Logistics'} {order.trackingNumber || 'Assigned after pack'}</p>
          <Timeline order={order} />
        </div>
      </div>
    </main>
  );
}

export function TrackOrder() {
  useSeo({ title: 'Track order' });
  const [form, setForm] = useState({ orderNumber: '', email: '' });
  const [order, setOrder] = useState(null);
  async function onSubmit(e) {
    e.preventDefault();
    const data = await api(`/orders/track/${form.orderNumber}?email=${encodeURIComponent(form.email)}`);
    setOrder(data.order);
  }
  return (
    <main className="page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Track order</h1>
        <div className="field"><label>Order number</label><input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} /></div>
        <div className="field"><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <button className="btn btn-dark btn-full">Track</button>
      </form>
      {order && <div className="container"><Timeline order={order} /></div>}
    </main>
  );
}
