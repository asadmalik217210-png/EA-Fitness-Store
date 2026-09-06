import { Link } from 'react-router-dom';
import { Camera, CirclePlay, Users } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>EA Fitness Clothing</h4>
          <p>Performance apparel engineered for training, recovery, and the hours in between.</p>
          <div className="socials">
            <a href="https://instagram.com" aria-label="Instagram"><Camera size={18} /></a>
            <a href="https://youtube.com" aria-label="YouTube"><CirclePlay size={18} /></a>
            <a href="https://facebook.com" aria-label="Facebook"><Users size={18} /></a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/men">Men</Link><br />
          <Link to="/women">Women</Link><br />
          <Link to="/new-arrivals">New Arrivals</Link><br />
          <Link to="/best-sellers">Best Sellers</Link><br />
          <Link to="/sale">Sale</Link><br />
          <Link to="/shop">Shop All</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/contact">Contact</Link><br />
          <Link to="/faq">FAQ</Link><br />
          <Link to="/shipping">Shipping</Link><br />
          <Link to="/returns">Returns</Link><br />
          <Link to="/size-guide">Size Guide</Link><br />
          <Link to="/privacy">Privacy</Link><br />
          <Link to="/terms">Terms</Link>
        </div>
        <div>
          <h4>Training notes</h4>
          <p>New drops, restock alerts, and session-ready edits. No noise.</p>
          <form
            className="newsletter"
            onSubmit={(e) => {
              e.preventDefault();
              setEmail('');
              alert('You are on the list.');
            }}
          >
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email for newsletter"
            />
            <button className="btn btn-light" type="submit">Join</button>
          </form>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} EA Fitness Clothing. EA-Fitness-Clothing-Store.</span>
        <span>Built for the work, not the pose.</span>
      </div>
    </footer>
  );
}
