import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Complete Leaf Clearing', desc: 'We blow and rake every leaf from your lawn, beds, and landscaping. Leaving leaves to decompose on turf smothers grass and invites mold — we eliminate that risk entirely.' },
  { title: 'Gutter Clearing', desc: 'Clogged gutters lead to water damage and foundation issues. Our team clears leaves and debris from gutters and downspouts as part of our full-yard cleanup package.' },
  { title: 'Haul-Away Service', desc: 'We bag and haul everything off-site so you don\'t have to deal with overflowing yard waste bins. Your property is completely clear when we\'re done.' },
  { title: 'Seasonal Deep Cleanup', desc: 'Beyond leaves — we clear twigs, seed pods, thatch, and accumulated debris from beds and turf to give your yard a fresh, clean start for the next season.' },
];

const PLANS = [
  { name: 'Single Cleanup', price: 'From $120', desc: 'One-time leaf removal and yard cleanup. Ideal after heavy leaf fall or before a hard freeze.' },
  { name: 'Seasonal Package', price: 'From $320', desc: '3 scheduled cleanups throughout the fall season to stay ahead of accumulation.' },
  { name: 'Spring & Fall Bundle', price: 'Custom', desc: 'Full spring and fall deep cleanup to prep your yard at the start and close of every season.' },
];

export default function LeafRemoval() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Clean &amp; Enrich</div>
        <h1>Leaf Removal &amp;<br/>Yard Cleanup</h1>
        <p>Don't let leaves smother your lawn. Our professional removal crews clear, bag, and haul everything away — leaving your yard spotless and ready for the next season.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">What's Included</p>
        <h2 className="pg-title">More Than Just Raking</h2>
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
        <h2 className="pg-title">Cleanup Options</h2>
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
        <h2>Clear Your Yard Before Winter Hits</h2>
        <p>Schedule a leaf removal visit today and protect your lawn going into the cold months.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
