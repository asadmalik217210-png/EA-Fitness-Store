import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { Reveal } from '../../components/common/Motion';
import { SkeletonGrid } from '../../components/common/States';
import { useSeo } from '../../hooks/useSeo';

const HERO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=2000&q=80';
const MEN = 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=80';
const WOMEN = 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1400&q=80';
const TRAIN = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80';
const PROMO = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1800&q=80';
const COMM = 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=80';

export default function Home() {
  useSeo({
    title: 'Performance Training Apparel',
    description: 'EA Fitness Clothing — premium gym apparel for men and women. Engineered for training.',
  });
  const [arrivals, setArrivals] = useState([]);
  const [best, setBest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/products?new=true&limit=8'),
      api('/products?bestseller=true&limit=8'),
    ])
      .then(([a, b]) => {
        setArrivals(a.products);
        setBest(b.products);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero">
        <motion.img src={HERO} alt="Athletes training in EA Fitness Clothing" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.4 }} />
        <div className="hero-copy">
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Built for the work
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            Training apparel with a fashion-grade finish. Compression where it counts, drape where you live.
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Link className="btn btn-light" to="/men">Shop Men</Link>
            <Link className="btn btn-ghost" to="/women">Shop Women</Link>
          </motion.div>
        </div>
      </section>

      <section className="split-shop">
        <Link to="/men" className="split-card">
          <img src={MEN} alt="Men training collection" />
          <div className="copy">
            <h2>Men</h2>
            <p>Tees, tanks, joggers, and shells for the floor.</p>
            <span className="btn btn-light">Shop the collection</span>
          </div>
        </Link>
        <Link to="/women" className="split-card">
          <img src={WOMEN} alt="Women training collection" />
          <div className="copy">
            <h2>Women</h2>
            <p>Bras, leggings, sets, and layers that hold.</p>
            <span className="btn btn-light">Shop the collection</span>
          </div>
        </Link>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>New arrivals</h2>
            <Link to="/new-arrivals">View all</Link>
          </div>
          {loading ? <SkeletonGrid /> : (
            <div className="grid-products">{arrivals.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off)' }}>
        <div className="container">
          <div className="section-head">
            <h2>Best sellers</h2>
            <Link to="/best-sellers">View all</Link>
          </div>
          {loading ? <SkeletonGrid /> : (
            <div className="grid-products">{best.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          )}
        </div>
      </section>

      <Reveal>
        <section className="banner">
          <img src={TRAIN} alt="Training collection lifestyle" />
          <div className="copy">
            <h2>The training collection</h2>
            <p>Pieces that survive heavy volume and still look sharp after the session.</p>
            <Link className="btn btn-light" to="/shop">Shop training</Link>
          </div>
        </section>
      </Reveal>

      <section className="section">
        <div className="container features">
          <div className="feature"><h3>Hold</h3><p>Sculpt-flex knits and four-way stretch that stay put through deep range.</p></div>
          <div className="feature"><h3>Breath</h3><p>Mapped ventilation and anti-odour yarns for long indoor sessions.</p></div>
          <div className="feature"><h3>Finish</h3><p>Clean seams, dense fleece, and colourways built for the street after the gym.</p></div>
        </div>
      </section>

      <Reveal>
        <section className="banner">
          <img src={PROMO} alt="Seasonal drop" />
          <div className="copy">
            <h2>Forge season is live</h2>
            <p>New cuts, darker palettes, and 10% off with TRAIN10.</p>
            <Link className="btn btn-light" to="/sale">Shop the drop</Link>
          </div>
        </section>
      </Reveal>

      <section className="section">
        <div className="container community">
          <img src={COMM} alt="EA Fitness community training" />
          <div>
            <h2>Show up. Repeat.</h2>
            <p className="muted">EA Fitness Clothing is for athletes, gym regulars, and anyone who treats training as a craft. We design for movement first, then edit for a premium silhouette.</p>
            <Link className="btn btn-dark" style={{ marginTop: 20 }} to="/about">Our story</Link>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="home-training-edit">
          <div className="home-training-image"><img src={WOMEN} alt="EA Fitness training edit" /></div>
          <div className="home-training-copy">
            <p className="eyebrow">The training edit / 04</p>
            <h2>Less noise.<br />More work.</h2>
            <p>Technical essentials, edited into a uniform for the days you decide to show up anyway.</p>
            <Link className="btn btn-light" to="/shop">Explore the edit</Link>
          </div>
        </section>
      </Reveal>

      <section className="home-index-band">
        <div className="container home-index-grid">
          <div><strong>01</strong><span>Movement first</span><p>Built around how the body actually trains.</p></div>
          <div><strong>02</strong><span>Quiet confidence</span><p>Focused silhouettes without the extra noise.</p></div>
          <div><strong>03</strong><span>Repeat ready</span><p>Made to live in your weekly rotation.</p></div>
        </div>
      </section>

      <section className="section home-rotation-section">
        <div className="container">
          <div className="section-head"><div><p className="eyebrow">Your weekly rotation</p><h2>Train in your language</h2></div><Link to="/shop">Shop all</Link></div>
          <div className="home-rotation-grid">
            <Link className="rotation-tile rotation-tile-wide" to="/men"><img src={MEN} alt="Men's training edit" /><span>Men / Strength</span></Link>
            <Link className="rotation-tile" to="/women"><img src={WOMEN} alt="Women's training edit" /><span>Women / Flow</span></Link>
            <Link className="rotation-tile" to="/new-arrivals"><img src={TRAIN} alt="New training arrivals" /><span>New / Momentum</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
