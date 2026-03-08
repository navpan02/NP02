import { Link } from 'react-router-dom';

const FEATURES = [
  { title: 'Custom System Design', desc: 'We design zone-based irrigation plans specific to your property\'s layout, plant types, soil, and sun exposure — maximizing coverage while eliminating overwatering and runoff.' },
  { title: 'Professional Installation', desc: 'Our licensed installers trench, lay lines, and position heads with minimal turf disruption. We pressure-test the full system before backfilling and restore the lawn to pre-install condition.' },
  { title: 'Repair & Leak Detection', desc: 'Broken heads, cracked lines, valve failures, and controller issues — we diagnose and fix all irrigation problems quickly, often in a single visit.' },
  { title: 'Smart Controller Upgrades', desc: 'We install Wi-Fi-enabled smart controllers that adjust watering schedules based on local weather data, reducing water usage by up to 30% while keeping your lawn healthier.' },
];

const PLANS = [
  { name: 'Repair / Service Call', price: 'From $95', desc: 'Diagnosis and repair of a single irrigation issue — broken head, leaking valve, controller fault, or wiring problem.' },
  { name: 'New System (up to 5 zones)', price: 'From $1,800', desc: 'Full design and installation of a residential irrigation system. Includes backflow preventer and controller.' },
  { name: 'Seasonal Startup / Shutdown', price: 'From $85', desc: 'Spring activation with head inspection and adjustment, or fall blowout to winterize your system and prevent freeze damage.' },
];

export default function IrrigationSystem() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">Design &amp; Installation</div>
        <h1>Irrigation System<br/>Installation &amp; Repair</h1>
        <p>A properly designed irrigation system delivers the right water to the right zones at the right time — keeping your lawn and landscaping healthy while cutting water waste significantly.</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <Link to="/quote" className="btn-primary px-7 py-3">Get a Free Quote</Link>
          <Link to="/CleanLawn" className="btn-outline px-7 py-3">All CleanLawn Services</Link>
        </div>
      </section>

      <section className="pg-section white">
        <p className="pg-label">Our Services</p>
        <h2 className="pg-title">Smart, Efficient Irrigation</h2>
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
        <h2 className="pg-title">Irrigation Options</h2>
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
        <h2>Water Smarter, Not Harder</h2>
        <p>Get a free irrigation consultation and quote for a new system or existing repairs.</p>
        <Link to="/quote" className="btn-primary text-base px-8 py-4">Get a Free Quote</Link>
      </section>
    </>
  );
}
