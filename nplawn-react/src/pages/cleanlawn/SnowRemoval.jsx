import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Driveway & Parking Plowing', desc: 'We plow driveways and parking areas after every qualifying snowfall. Snow is pushed to a designated area on your property — not blocking neighbors or street sight lines.' },
  { title: 'Walkway & Entry Shoveling', desc: 'Porches, front walks, side gates, and stairways are hand-shoveled and cleared completely. We ensure every path into your home or business is safe and accessible.' },
  { title: 'Salt & De-icing Treatment', desc: 'We apply professional-grade ice melt to driveways, walkways, and steps after clearing. This prevents refreezing overnight and keeps surfaces safe between visits.' },
  { title: 'Seasonal Contract Service', desc: 'Sign up before the season starts and we\'ll automatically respond to every snowfall that meets your threshold — no need to call. Priority routing for contract clients.' },
];

const PLANS = [
  { name: 'Per-Visit Service', price: 'From $65', desc: 'On-call snow removal for a single residential driveway and walkways. Book when you need it.' },
  { name: 'Seasonal Contract', price: 'From $450/season', desc: 'Unlimited visits for a full season. Auto-dispatch on qualifying snowfalls. Priority scheduling.' },
  { name: 'Commercial / HOA', price: 'Custom Quote', desc: 'Parking lots, multi-unit properties, and HOA communities. Includes salting, walks, and 24-hr response SLA.' },
];

export default function SnowRemoval() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Snow Removal —<br/>Clear Drives. Safe Walkways.</h1>
        <p>Don't start your morning shoveling. Our seasonal snow removal service keeps your driveway, walkways, and entries clear and salted — automatically, after every storm.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What's Included</p>
        <h2 className="pg-title">Complete Winter Property Care</h2>
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
        <h2 className="pg-title">Snow Removal Options</h2>
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
        <h2>Sign Up Before the First Snowfall</h2>
        <p>Seasonal contracts fill fast. Lock in your rate and never shovel again.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
