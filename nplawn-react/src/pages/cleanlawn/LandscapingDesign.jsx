import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Custom Landscape Design', desc: 'We develop a detailed landscape plan tailored to your property\'s layout, style, and budget — including plant placement, bed configurations, pathways, and focal points that work together as a unified design.' },
  { title: 'Plant Selection & Installation', desc: 'We source and install plants suited to Chicagoland\'s climate, your soil type, and your maintenance preferences — from low-maintenance native species to formal garden plantings and seasonal color.' },
  { title: 'Hardscaping & Structural Elements', desc: 'Patios, retaining walls, garden borders, stepping stones, and decorative edging give your landscape structure and year-round visual interest, even when plants are dormant.' },
  { title: 'Ongoing Maintenance Plans', desc: 'New landscapes need care to establish. We offer optional seasonal maintenance plans covering fertilization, pruning, mulching, and plant replacements to protect your investment long-term.' },
];

const PLANS = [
  { name: 'Design Consultation', price: 'From $150', desc: 'On-site design session resulting in a landscape plan with plant recommendations, layout, and phased implementation options.' },
  { name: 'Planting Installation', price: 'From $600', desc: 'Full plant sourcing and installation based on agreed design. Includes bed prep, planting, and initial mulching.' },
  { name: 'Full Landscape Build', price: 'Custom Quote', desc: 'Complete design-to-build service including hardscaping, planting, lighting, and ongoing maintenance. Written estimate after consultation.' },
];

export default function LandscapingDesign() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Design &amp; Installation</div>
        <h1>Landscaping &amp;<br/>Garden Design</h1>
        <p>Transform your outdoor space from ordinary to extraordinary. Our landscape designers work with your property's natural features, your style preferences, and your budget to create beautiful, sustainable results.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Consultation</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What We Offer</p>
        <h2 className="pg-title">Design. Plant. Build. Maintain.</h2>
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
        <h2 className="pg-title">Landscape Design Options</h2>
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
        <h2>Let's Build Something Beautiful Together</h2>
        <p>Schedule a free design consultation and see what your property could become.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Book a Consultation</Link>
      </section>
    </>
  );
}
