import { Link } from 'react-router-dom';
import { Reveal } from '../../components/common/Motion';
import { useSeo } from '../../hooks/useSeo';

export default function About() {
  useSeo({ title: 'About us', description: 'The story, mission, and performance standard behind EA Fitness Clothing.' });
  return (
    <main>
      <section className="hero about-hero">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=2000&q=80" alt="Brand introduction" />
        <div className="hero-copy">
          <h1>EA Fitness Clothing</h1>
          <p>An original athletic label for people who train with intent.</p>
        </div>
      </section>
      <div className="container">
        <Reveal>
          <section className="about-grid">
            <h2>Brand story</h2>
            <p>We started EA Fitness Clothing to close the gap between serious training gear and a silhouette you would actually wear after the session. No mascot. No borrowed identity. Just precise cuts in a black, bone, and charcoal language.</p>
          </section>
        </Reveal>
        <Reveal>
          <section className="about-grid">
            <h2>Mission</h2>
            <p>Design apparel that survives volume: high-support bras, squat-proof knits, drop-cut tees, and shells that pack small. Hold, breath, finish — every piece has to earn all three.</p>
          </section>
        </Reveal>
        <Reveal>
          <section className="about-grid">
            <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80" alt="Quality materials" />
            <div>
              <h2>Quality / materials</h2>
              <p>Sculpt-flex 260gsm, mapped mesh, DWR shells, and dense fleece. We specify yarns for recovery, not just hand-feel on day one.</p>
            </div>
          </section>
        </Reveal>
        <Reveal>
          <section className="about-grid">
            <div>
              <h2>Performance</h2>
              <p>Flatlock seams, gussets, and waistbands that do not roll. Tested on the floor: compounds, intervals, and long studio blocks.</p>
            </div>
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" alt="Performance training" />
          </section>
        </Reveal>
        <Reveal>
          <section className="about-grid">
            <h2>Community</h2>
            <p>Built for gym regulars, athletes, and anyone who treats training as a craft. Show up. Repeat.</p>
          </section>
        </Reveal>
        <section style={{ padding: '40px 0 90px', textAlign: 'center' }}>
          <h2>Train in it</h2>
          <Link className="btn btn-dark" to="/shop">Shop the collection</Link>
        </section>
      </div>
    </main>
  );
}
