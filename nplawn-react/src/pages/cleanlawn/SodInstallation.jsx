import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Site Preparation', desc: 'We remove old turf, grade the soil for proper drainage, and till and amend the base layer so new sod has the ideal foundation to take root quickly and evenly.' },
  { title: 'Premium Sod Selection', desc: 'We source locally grown sod varieties suited to Chicagoland\'s climate — including Kentucky Bluegrass, Tall Fescue, and Zoysia — matched to your sun exposure and soil type.' },
  { title: 'Professional Installation', desc: 'Sod is laid in tight, staggered rows with no gaps or overlaps. Edges are hand-trimmed around obstacles, beds, and borders for a clean, professional finish.' },
  { title: 'Watering Plan & Aftercare', desc: 'We provide a detailed post-install watering schedule and establishment guidance so your new lawn roots in properly and stays green through the first season.' },
];

const PLANS = [
  { name: 'Small Lawn (up to 1,000 sq ft)', price: 'From $800', desc: 'Complete sod installation for smaller yards, patches, or damaged areas. Includes site prep and cleanup.' },
  { name: 'Medium Lawn (1,000–5,000 sq ft)', price: 'From $2,200', desc: 'Full installation for standard residential properties. Grading, sod, and post-install care included.' },
  { name: 'Large / Custom', price: 'Custom Quote', desc: 'For large lots, commercial properties, or complex grades. We assess and provide a detailed written estimate.' },
];

export default function SodInstallation() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Sod Installation —<br/>Instant Lawn. Zero Wait.</h1>
        <p>Skip the seed-and-wait game. We install premium, locally grown sod for a lush, walkable lawn the same day — properly prepped, precisely laid, and built to last.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Process</p>
        <h2 className="pg-title">From Bare Ground to Lush Lawn</h2>
        <div className="service-grid mt-8">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-np-surface rounded-2xl p-6 border border-np-border">
              <h3 className="text-np-dark font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-np-muted text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" style={{ background: '#f4faf6' }}>
        <p className="pg-label">Pricing</p>
        <h2 className="pg-title">Sod Installation Options</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {PLANS.map(p => (
            <div key={p.name} className="bg-white rounded-2xl p-6 border border-np-border shadow-np">
              <div className="text-np-accent font-bold text-2xl mb-1">{p.price}</div>
              <div className="font-bold text-np-dark text-lg mb-2">{p.name}</div>
              <p className="text-np-muted text-sm leading-relaxed mb-5">{p.desc}</p>
              <Link to="/quote" className="btn-primary text-sm">Get a Quote</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready for an Instant Green Lawn?</h2>
        <p>Get a free sod installation quote based on your lawn size and site conditions.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
