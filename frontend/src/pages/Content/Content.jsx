import { useSeo } from '../../hooks/useSeo';

function Page({ title, children }) {
  useSeo({ title });
  return (
    <main className="page">
      <div className="container content-page">
        <h1>{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function Contact() {
  return (
    <Page title="Contact us">
      <p>Email support@eafitness.local or use the form. We reply within two business days.</p>
      <form className="auth-card" style={{ margin: '20px 0' }} onSubmit={(e) => { e.preventDefault(); alert('Message sent.'); }}>
        <div className="field"><label>Name</label><input required /></div>
        <div className="field"><label>Email</label><input type="email" required /></div>
        <div className="field"><label>Message</label><textarea required /></div>
        <button className="btn btn-dark">Send</button>
      </form>
    </Page>
  );
}

export function FAQ() {
  return (
    <Page title="FAQ">
      <h2>How long does shipping take?</h2>
      <p>Standard is 5–7 business days. Express is 2–3. Free standard shipping over $100.</p>
      <h2>What is your return window?</h2>
      <p>30 days on unworn items with tags attached.</p>
      <h2>Do you restock sold-out sizes?</h2>
      <p>Yes. Join the newsletter for restock notes.</p>
    </Page>
  );
}

export function SizeGuide() {
  return (
    <Page title="Size guide">
      <p>Measure chest, waist, and hip. If you sit between sizes, size up for training tees and down for sculpt knits.</p>
      <table>
        <thead><tr><th>Size</th><th>Chest</th><th>Waist</th></tr></thead>
        <tbody>
          {[['XS','32-34','24-26'],['S','35-37','27-29'],['M','38-40','30-32'],['L','41-43','33-35'],['XL','44-46','36-38']].map((r) => (
            <tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

export function Shipping() {
  return (
    <Page title="Shipping & delivery">
      <p>Orders process in 1–3 business days. Tracking is added once packed. International duties are the customer’s responsibility.</p>
    </Page>
  );
}

export function Returns() {
  return (
    <Page title="Returns & refunds">
      <p>Start a return from your order page after delivery. Approved returns restore inventory and issue a refund to the original method when marked refunded by admin.</p>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="Privacy policy">
      <p>We store account, order, and cart data to run EA-Fitness-Clothing-Store. We do not sell personal data. Payment secrets never sit in the browser.</p>
    </Page>
  );
}

export function Terms() {
  return (
    <Page title="Terms & conditions">
      <p>By creating an account or placing an order you agree to our shipping, returns, and acceptable-use terms for EA Fitness Clothing.</p>
    </Page>
  );
}

export function NotFound() {
  return (
    <Page title="404">
      <p>This page is not on the floor.</p>
      <a className="btn btn-dark" href="/">Back home</a>
    </Page>
  );
}

export function Maintenance() {
  return (
    <Page title="Temporarily down">
      <p>EA Fitness Clothing is undergoing a short maintenance window. Try again shortly.</p>
    </Page>
  );
}
