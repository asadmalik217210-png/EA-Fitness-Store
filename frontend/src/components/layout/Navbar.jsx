import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserRound, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import '../../component/navbar.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { money } from '../../utils/money';

export default function Navbar() {
  const { cart, setOpen } = useCart();
  const { products: wishes } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);
  const [womenOpen, setWomenOpen] = useState(false);
  const [q, setQ] = useState('');
  const [suggest, setSuggest] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggest([]);
      return;
    }
    const t = setTimeout(() => {
      api(`/products/search?q=${encodeURIComponent(q)}`).then((d) => setSuggest(d.products || [])).catch(() => {});
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  function goSearch(e) {
    e?.preventDefault();
    if (!q.trim()) return;
    const recent = JSON.parse(localStorage.getItem('ea_recent_search') || '[]');
    localStorage.setItem('ea_recent_search', JSON.stringify([q, ...recent.filter((x) => x !== q)].slice(0, 6)));
    setSearchOpen(false);
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  }

  const recent = JSON.parse(localStorage.getItem('ea_recent_search') || '[]');
  const overlay = location.pathname === '/' && !scrolled;

  return (
    <>
      <div className="announcement-bar">
        <p>FREE SHIPPING ON ORDERS OVER $100 — CODE TRAIN10</p>
      </div>
      <header className={`navbar-wrapper ${overlay ? 'is-overlay' : ''} ${scrolled ? 'is-scrolled' : ''}`}>
        <nav className="navbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={23} strokeWidth={1.8} />
          </button>
          <Link to="/" className="navbar-logo">
            <span className="logo-ea">EA</span>
            <span className="logo-text">FITNESS<small>CLOTHING</small></span>
          </Link>
          <div className="desktop-nav">
            <div className="nav-dropdown" onMouseEnter={() => setMenOpen(true)} onMouseLeave={() => setMenOpen(false)}>
              <Link to="/men" className="nav-link dropdown-trigger">MEN <ChevronDown size={14} /></Link>
              <AnimatePresence>
                {menOpen && (
                  <motion.div className="mega-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <div className="mega-column">
                      <h4>Shop Men</h4>
                      <Link to="/men">Shop All Men</Link>
                      <Link to="/new-arrivals?gender=men">New Arrivals</Link>
                      <Link to="/best-sellers?gender=men">Best Sellers</Link>
                      <Link to="/sale?gender=men">Sale</Link>
                    </div>
                    <div className="mega-column">
                      <h4>Clothing</h4>
                      <Link to="/shop?gender=men&category=men-t-shirts">T-Shirts</Link>
                      <Link to="/shop?gender=men&category=men-tank-tops">Tank Tops</Link>
                      <Link to="/shop?gender=men&category=men-hoodies">Hoodies</Link>
                      <Link to="/shop?gender=men&category=men-joggers">Joggers</Link>
                      <Link to="/shop?gender=men&category=men-shorts">Shorts</Link>
                    </div>
                    <div className="mega-column">
                      <h4>Training</h4>
                      <Link to="/shop?gender=men&category=men-training-pants">Training Pants</Link>
                      <Link to="/shop?gender=men&category=men-jackets">Jackets</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="nav-dropdown" onMouseEnter={() => setWomenOpen(true)} onMouseLeave={() => setWomenOpen(false)}>
              <Link to="/women" className="nav-link dropdown-trigger">WOMEN <ChevronDown size={14} /></Link>
              <AnimatePresence>
                {womenOpen && (
                  <motion.div className="mega-menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <div className="mega-column">
                      <h4>Shop Women</h4>
                      <Link to="/women">Shop All Women</Link>
                      <Link to="/new-arrivals?gender=women">New Arrivals</Link>
                      <Link to="/best-sellers?gender=women">Best Sellers</Link>
                      <Link to="/sale?gender=women">Sale</Link>
                    </div>
                    <div className="mega-column">
                      <h4>Clothing</h4>
                      <Link to="/shop?gender=women&category=women-sports-bras">Sports Bras</Link>
                      <Link to="/shop?gender=women&category=women-leggings">Leggings</Link>
                      <Link to="/shop?gender=women&category=women-gym-tops">Gym Tops</Link>
                      <Link to="/shop?gender=women&category=women-shorts">Shorts</Link>
                      <Link to="/shop?gender=women&category=women-hoodies">Hoodies</Link>
                    </div>
                    <div className="mega-column">
                      <h4>Collections</h4>
                      <Link to="/shop?gender=women&category=women-gym-sets">Gym Sets</Link>
                      <Link to="/shop?gender=women&category=women-jackets">Jackets</Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/new-arrivals" className="nav-link">NEW ARRIVALS</Link>
            <Link to="/best-sellers" className="nav-link">BEST SELLERS</Link>
            <Link to="/sale" className="nav-link sale-link">SALE</Link>
            <Link to="/shop" className="nav-link">SHOP ALL</Link>
          </div>
          <div className="navbar-actions">
            <button className="nav-icon" onClick={() => setSearchOpen(true)} aria-label="Search"><Search size={20} /></button>
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="nav-icon" aria-label="Account"><UserRound size={20} /></Link>
            <Link to="/wishlist" className="nav-icon wishlist-icon" aria-label="Wishlist">
              <Heart size={20} />
              <span className="icon-count">{wishes.length}</span>
            </Link>
            <button type="button" className="nav-icon cart-icon" aria-label="Cart" onClick={() => setOpen(true)}>
              <ShoppingBag size={21} />
              <span className="icon-count cart-count">{cart.itemCount || 0}</span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div className="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="search-box" initial={{ y: -30 }} animate={{ y: 0 }}>
              <div className="search-header">
                <span>SEARCH EA FITNESS</span>
                <button type="button" onClick={() => setSearchOpen(false)}><X size={24} /></button>
              </div>
              <form className="search-input-wrapper" onSubmit={goSearch}>
                <Search size={22} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." autoFocus />
              </form>
              {suggest.length > 0 && (
                <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
                  {suggest.map((p) => (
                    <Link key={p._id} to={`/product/${p.slug}`} onClick={() => setSearchOpen(false)} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {p.name} <span className="muted">{money(p.salePrice || p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
              <div className="search-suggestions">
                <span>{recent.length ? 'Recent' : 'Popular searches'}</span>
                <div>
                  {(recent.length ? recent : ['T-Shirts', 'Leggings', 'Hoodies', 'New Arrivals']).map((s) => (
                    <button key={s} type="button" className="btn btn-outline" onClick={() => { setQ(s); navigate(`/shop?q=${encodeURIComponent(s)}`); setSearchOpen(false); }}>{s}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside className="mobile-drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}>
              <div className="mobile-header">
                <div className="mobile-logo"><span>EA</span><small>FITNESS CLOTHING</small></div>
                <button type="button" onClick={() => setMobileOpen(false)}><X size={25} /></button>
              </div>
              <div className="mobile-links">
                <Link to="/" onClick={() => setMobileOpen(false)}>HOME</Link>
                <Link to="/men" onClick={() => setMobileOpen(false)}>MEN</Link>
                <Link to="/women" onClick={() => setMobileOpen(false)}>WOMEN</Link>
                <Link to="/new-arrivals" onClick={() => setMobileOpen(false)}>NEW ARRIVALS</Link>
                <Link to="/best-sellers" onClick={() => setMobileOpen(false)}>BEST SELLERS</Link>
                <Link to="/sale" onClick={() => setMobileOpen(false)} className="mobile-sale">SALE</Link>
                <Link to="/shop" onClick={() => setMobileOpen(false)}>SHOP ALL</Link>
              </div>
              <div className="mobile-bottom">
                <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} onClick={() => setMobileOpen(false)}>
                  <UserRound size={19} />
                  Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)}>
                  <Heart size={19} />
                  Wishlist ({wishes.length})
                </Link>
                <button type="button" onClick={() => { setMobileOpen(false); setOpen(true); }}>
                  <ShoppingBag size={19} />
                  Cart ({cart.itemCount || 0})
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
