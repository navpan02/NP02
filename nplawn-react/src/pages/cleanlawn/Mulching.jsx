import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Bed Preparation', desc: 'Before any mulch goes down, we clear old mulch, pull weeds, and edge beds cleanly. A properly prepped bed means better weed suppression and a longer-lasting finished look.' },
  { title: 'Multiple Mulch Types', desc: 'Choose from shredded hardwood, dyed black or brown mulch, cedar, or rubber mulch depending on your aesthetic and functional goals. We help you pick the right type for your beds.' },
  { title: 'Optimal Depth Application', desc: 'We apply mulch at the industry-standard 2–3 inch depth — enough to suppress weeds and retain moisture without suffocating roots or inviting disease at the crown of plants.' },
  { title: 'Clean Edge Definition', desc: 'Mulch beds are edged with a crisp border that separates lawn from bed, giving your landscape a sharp, intentional look that elevates the entire property.' },
];

const PLANS = [
  { name: 'Single Bed Refresh', price: 'From $90', desc: 'Refresh mulch in 1–3 defined beds. Includes bed prep, mulch, and edge definition.' },
  { name: 'Full Property Mulch', price: 'From $280', desc: 'Complete mulching of all beds and tree rings. Includes cleanup and haul-away of old material.' },
  { name: 'Annual Mulch Program', price: 'Custom', desc: 'Scheduled spring and fall mulch application to keep your beds fresh, suppressed, and healthy year-round.' },
];

export default function Mulching() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Professional Mulching —<br/>Protect Your Beds. Suppress Weeds.</h1>
        <p>Fresh mulch does more than look great. It conserves moisture, regulates soil temperature, blocks weed growth, and gives your landscape beds a polished, finished appearance all season.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What We Do</p>
        <h2 className="pg-title">Mulching Done Right</h2>
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
        <h2 className="pg-title">Mulching Options</h2>
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
        <h2>Give Your Beds a Fresh, Clean Look</h2>
        <p>Book a mulching visit and protect your landscaping investment all season long.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
