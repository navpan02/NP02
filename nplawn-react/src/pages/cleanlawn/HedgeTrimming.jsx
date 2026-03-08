import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Shape & Structure', desc: 'We sculpt hedges to the correct geometric or natural form — flat tops, rounded profiles, or custom shapes — keeping your borders crisp and intentional all season long.' },
  { title: 'Size Control', desc: 'Overgrown hedges lose their visual impact and encroach on walkways. We cut back to the ideal height and width, encouraging dense, healthy regrowth.' },
  { title: 'Dead Wood & Disease Removal', desc: 'We identify and remove dead, diseased, or crossing branches to improve airflow and light penetration, protecting the long-term health of your shrubs.' },
  { title: 'Site Cleanup Included', desc: 'All clippings are gathered, bagged, and removed from your property. We leave your beds, lawn, and walkways clean — no debris left behind.' },
];

const PLANS = [
  { name: 'Single Visit', price: 'From $75', desc: 'One-time hedge shaping and cleanup. Great for seasonal tidy-ups or before an event.' },
  { name: 'Seasonal Package', price: 'From $200', desc: '3 scheduled visits per season to keep your hedges in shape throughout the growing season.' },
  { name: 'Annual Maintenance', price: 'Custom', desc: 'Year-round hedge care tailored to your specific species and growth rate. Priority scheduling included.' },
];

export default function HedgeTrimming() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Cuts &amp; Trims</div>
        <h1>Professional Hedge<br/>Trimming Services</h1>
        <p>Sharply trimmed hedges frame your property and elevate curb appeal instantly. Our crew delivers clean lines, healthy cuts, and zero mess — every visit.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What We Do</p>
        <h2 className="pg-title">Precision Hedge Care, Start to Finish</h2>
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
        <h2 className="pg-title">Hedge Trimming Options</h2>
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
        <h2>Ready for Perfectly Trimmed Hedges?</h2>
        <p>Request a free quote and we'll schedule a visit at your convenience.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
