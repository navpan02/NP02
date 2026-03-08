import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Grinding Below Grade', desc: 'We grind stumps 6–12 inches below ground level — deep enough to eliminate tripping hazards, allow for sod or plantings on top, and stop root sprouting from the stump.' },
  { title: 'Chip & Debris Removal', desc: 'All wood chips and grindings are raked and hauled away (or left as fill material if preferred). We leave the area ready for grass seed, sod, or a new planting.' },
  { title: 'Surface Leveling', desc: 'After grinding, the void is leveled and optionally filled with topsoil so the area integrates smoothly with your surrounding lawn — no crater or mound left behind.' },
  { title: 'Surface Root Treatment', desc: 'For stumps with aggressive surface roots, we can address visible roots that extend into the lawn to prevent ongoing damage to turf, walkways, and underground infrastructure.' },
];

const PLANS = [
  { name: 'Single Stump', price: 'From $125', desc: 'Grinding and cleanup for one stump up to 18" diameter. Depth to 8" below grade.' },
  { name: 'Multiple Stumps (2–5)', price: 'From $275', desc: 'Bundled pricing for multiple stumps on the same property. Per-stump rate decreases with volume.' },
  { name: 'Large / Complex', price: 'Custom Quote', desc: 'For stumps over 24" diameter, hardwood species, or stumps near structures and utilities. Site visit required.' },
];

export default function StumpGrinding() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Stump Grinding &amp;<br/>Removal Services</h1>
        <p>Leftover stumps are eyesores, tripping hazards, and hosts for decay and pests. We grind them out below grade and leave the area clean and ready for grass or new plantings.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Process</p>
        <h2 className="pg-title">Complete Stump Elimination</h2>
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
        <h2 className="pg-title">Stump Removal Options</h2>
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
        <h2>Get Rid of That Stump for Good</h2>
        <p>Request a free quote and we'll take care of it — grind, clean, and level in one visit.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
