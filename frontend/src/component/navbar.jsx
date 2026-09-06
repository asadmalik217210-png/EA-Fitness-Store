import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserRound,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import "./navbar.css";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menOpen, setMenOpen] = useState(false);
  const [womenOpen, setWomenOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Top Announcement */}
      <div className="announcement-bar">
        <p>FREE SHIPPING ON ORDERS OVER $100</p>
      </div>

      <header className="navbar-wrapper">
        <nav className="navbar">

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <a href="/" className="navbar-logo">
            <span className="logo-ea">EA</span>
            <span className="logo-text">
              FITNESS
              <small>CLOTHING</small>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="desktop-nav">

            <div
              className="nav-dropdown"
              onMouseEnter={() => setMenOpen(true)}
              onMouseLeave={() => setMenOpen(false)}
            >
              <button className="nav-link dropdown-trigger">
                MEN
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {menOpen && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mega-column">
                      <h4>SHOP MEN</h4>
                      <a href="/men">Shop All Men</a>
                      <a href="/men/new-arrivals">New Arrivals</a>
                      <a href="/men/best-sellers">Best Sellers</a>
                      <a href="/sale">Sale</a>
                    </div>

                    <div className="mega-column">
                      <h4>CLOTHING</h4>
                      <a href="/men/t-shirts">T-Shirts</a>
                      <a href="/men/tank-tops">Tank Tops</a>
                      <a href="/men/hoodies">Hoodies</a>
                      <a href="/men/joggers">Joggers</a>
                      <a href="/men/shorts">Shorts</a>
                    </div>

                    <div className="mega-column">
                      <h4>TRAINING</h4>
                      <a href="/men/training">Training Collection</a>
                      <a href="/men/performance">Performance</a>
                      <a href="/men/jackets">Jackets</a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="nav-dropdown"
              onMouseEnter={() => setWomenOpen(true)}
              onMouseLeave={() => setWomenOpen(false)}
            >
              <button className="nav-link dropdown-trigger">
                WOMEN
                <ChevronDown size={14} />
              </button>

              <AnimatePresence>
                {womenOpen && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mega-column">
                      <h4>SHOP WOMEN</h4>
                      <a href="/women">Shop All Women</a>
                      <a href="/women/new-arrivals">New Arrivals</a>
                      <a href="/women/best-sellers">Best Sellers</a>
                      <a href="/sale">Sale</a>
                    </div>

                    <div className="mega-column">
                      <h4>CLOTHING</h4>
                      <a href="/women/sports-bras">Sports Bras</a>
                      <a href="/women/leggings">Leggings</a>
                      <a href="/women/gym-tops">Gym Tops</a>
                      <a href="/women/shorts">Shorts</a>
                      <a href="/women/hoodies">Hoodies</a>
                    </div>

                    <div className="mega-column">
                      <h4>COLLECTIONS</h4>
                      <a href="/women/gym-sets">Gym Sets</a>
                      <a href="/women/performance">Performance</a>
                      <a href="/women/jackets">Jackets</a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="/new-arrivals" className="nav-link">
              NEW ARRIVALS
            </a>

            <a href="/best-sellers" className="nav-link">
              BEST SELLERS
            </a>

            <a href="/sale" className="nav-link sale-link">
              SALE
            </a>

            <a href="/shop" className="nav-link">
              SHOP ALL
            </a>
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">

            <button
              className="nav-icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.7} />
            </button>

            <a href="/account" className="nav-icon" aria-label="Account">
              <UserRound size={20} strokeWidth={1.7} />
            </a>

            <a href="/wishlist" className="nav-icon wishlist-icon">
              <Heart size={20} strokeWidth={1.7} />
              <span className="icon-count">0</span>
            </a>

            <a href="/cart" className="nav-icon cart-icon">
              <ShoppingBag size={21} strokeWidth={1.7} />
              <span className="icon-count cart-count">0</span>
            </a>

          </div>
        </nav>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="search-box"
              initial={{ y: -30 }}
              animate={{ y: 0 }}
              exit={{ y: -30 }}
            >
              <div className="search-header">
                <span>SEARCH EA FITNESS</span>

                <button onClick={() => setSearchOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="search-input-wrapper">
                <Search size={22} />
                <input
                  type="text"
                  placeholder="Search products..."
                  autoFocus
                />
              </div>

              <div className="search-suggestions">
                <span>Popular Searches</span>

                <div>
                  <a href="/men/t-shirts">T-Shirts</a>
                  <a href="/women/leggings">Leggings</a>
                  <a href="/men/hoodies">Hoodies</a>
                  <a href="/new-arrivals">New Arrivals</a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
            />

            <motion.aside
              className="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="mobile-header">
                <div className="mobile-logo">
                  <span>EA</span>
                  <small>FITNESS CLOTHING</small>
                </div>

                <button onClick={closeMobile}>
                  <X size={25} />
                </button>
              </div>

              <div className="mobile-links">
                <a href="/" onClick={closeMobile}>HOME</a>
                <a href="/men" onClick={closeMobile}>MEN</a>
                <a href="/women" onClick={closeMobile}>WOMEN</a>
                <a href="/new-arrivals" onClick={closeMobile}>
                  NEW ARRIVALS
                </a>
                <a href="/best-sellers" onClick={closeMobile}>
                  BEST SELLERS
                </a>
                <a href="/sale" onClick={closeMobile} className="mobile-sale">
                  SALE
                </a>
                <a href="/shop" onClick={closeMobile}>SHOP ALL</a>
              </div>

              <div className="mobile-bottom">
                <a href="/account" onClick={closeMobile}>
                  <UserRound size={19} />
                  Account
                </a>

                <a href="/wishlist" onClick={closeMobile}>
                  <Heart size={19} />
                  Wishlist
                </a>

                <a href="/cart" onClick={closeMobile}>
                  <ShoppingBag size={19} />
                  Cart
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;