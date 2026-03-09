import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Overgrowth & Underbrush Removal', desc: 'We cut back invasive vines, thick underbrush, and overgrown vegetation that has taken over unused areas of your property, restoring space and visibility.' },
  { title: 'Invasive Species Clearing', desc: 'Buckthorn, honeysuckle, and other invasive species can take over a yard quickly. We identify and remove them at the root to prevent regrowth and protect your native plantings.' },
  { title: 'Lot Clearing & Reclamation', desc: 'From small overgrown corners to large vacant lots, we have the equipment and crew to clear and reclaim any size area — including equipment access where needed.' },
  { title: 'Debris Disposal', desc: 'All cut material — brush, vines, small logs, and debris — is chipped on-site or hauled away. You choose the finish, we handle everything from cut to clean.' },
];

const PLANS = [
  { name: 'Small Area (up to 500 sq ft)', price: 'From $150', desc: 'Clear overgrown corners, fence lines, or neglected beds. Includes cutting and debris removal.' },
  { name: 'Medium Lot (500–2,500 sq ft)', price: 'From $450', desc: 'Full underbrush and overgrowth clearing for mid-size areas. Chipping or haul-away included.' },
  { name: 'Large / Custom', price: 'Custom Quote', desc: 'For large properties, heavily overgrown lots, or multi-day projects. Written estimate provided after site visit.' },
];

export default function BrushClearing() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Brush Clearing —<br/>Reclaim Your Outdoor Space</h1>
        <p>Don't let overgrowth win. Our brush clearing crew removes dense underbrush, invasive vines, and neglected vegetation — restoring your land to usable, open space.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What We Do</p>
        <h2 className="pg-title">From Overgrown to Open Space</h2>
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
        <h2 className="pg-title">Brush Clearing Options</h2>
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
        <h2>Ready to Reclaim Your Property?</h2>
        <p>Request a free site assessment and quote for brush clearing or lot reclamation.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
