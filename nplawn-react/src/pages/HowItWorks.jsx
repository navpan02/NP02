import { Link } from 'react-router-dom';

const NPLAWN_STEPS = [
  {
    n: '1',
    title: 'Request a Quote',
    desc: 'Use our online quote estimator or fill out the contact form. Tell us your address and what you need — takes under 2 minutes.',
    detail: 'We use your address to calculate your lawn\'s square footage and generate an accurate price. No guessing, no vague "call us for pricing."',
    cta: { label: 'Get a Quote', to: '/quote' },
  },
  {
    n: '2',
    title: 'Choose Your Plan or Service',
    desc: 'Review your custom quote and pick the service or annual plan that fits your budget and goals.',
    detail: 'Annual lawn care plans (GrassBasic, GrassPro, GrassNatural) or one-time services like tree trimming and landscape design. No contracts required — we earn your business with results.',
    cta: { label: 'Compare Plans', to: '/lawn-care' },
  },
  {
    n: '3',
    title: 'We Schedule & Confirm',
    desc: 'We\'ll reach out within 1 business day to confirm your start date and set up your service schedule.',
    detail: 'You\'ll receive text and email reminders before each visit. Annual plan clients get a full-season schedule at the start of the year so you always know what\'s coming.',
    cta: null,
  },
  {
    n: '4',
    title: 'Our Crew Shows Up & Does the Work',
    desc: 'No need to be home. Certified crew arrives on schedule, completes the service, and leaves your property better than they found it.',
    detail: 'Gates should be unlocked and pets secured. We handle everything else — equipment, materials, cleanup. You\'ll receive a service report with notes after every visit.',
    cta: null,
  },
  {
    n: '5',
    title: 'Review & Repeat',
    desc: 'You\'ll receive a detailed service report. If anything needs attention, contact us and we make it right — guaranteed.',
    detail: 'Annual plan clients see their lawn improve season over season as our treatments build on each other. Most clients renew year after year because the results speak for themselves.',
    cta: { label: 'Read Reviews', to: '/about' },
  },
];

const CLEANLAWN_STEPS = [
  {
    n: '1',
    title: 'Browse Available Services',
    desc: 'Visit the CleanLawn marketplace and choose the service you need — mowing, aeration, leaf removal, snow removal, and more.',
    cta: { label: 'Open Marketplace', to: '/CleanLawn' },
  },
  {
    n: '2',
    title: 'Create Your Property Profile',
    desc: 'Sign up and add your property address. We use satellite data to estimate your lawn\'s square footage for accurate pricing.',
    cta: { label: 'Get Started', to: '/signup' },
  },
  {
    n: '3',
    title: 'Request a Quote from Local Providers',
    desc: 'Submit a quote request and multiple vetted local providers can respond with their pricing and availability.',
    cta: null,
  },
  {
    n: '4',
    title: 'Choose Your Provider & Book',
    desc: 'Review provider profiles, ratings, and quotes. Book directly with the provider that fits your schedule and budget.',
    cta: null,
  },
  {
    n: '5',
    title: 'Job Done — Rate Your Experience',
    desc: 'After the job is complete, leave a rating and review. Your feedback helps maintain quality across the marketplace.',
    cta: null,
  },
];

const FAQS = [
  {
    q: 'Do I need to be home for service visits?',
    a: 'No. Most services are completed while you\'re at work or out. Just ensure gates are unlocked and pets are secured. You\'ll get a service report after every visit.',
  },
  {
    q: 'How long does it take to get a quote?',
    a: 'Our online quote estimator gives you a price instantly. For custom projects like landscape design, we\'ll follow up within 1 business day.',
  },
  {
    q: 'What if I\'m not happy with the service?',
    a: 'Contact us within 48 hours and we\'ll return to address any concerns at no charge. Your satisfaction is guaranteed.',
  },
  {
    q: 'What\'s the difference between NPLawn services and the CleanLawn marketplace?',
    a: 'NPLawn directly provides lawn care plans, tree care, and landscape design — our own crew, our own quality standards. CleanLawn is our on-demand marketplace where independent local providers handle one-time jobs like mowing and aeration.',
  },
  {
    q: 'Can I pause or cancel my plan?',
    a: 'Yes. Annual plans can be cancelled before your next season renews without penalty. There\'s no lock-in contract.',
  },
];

export default function HowItWorks() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="page-hero-icon mx-auto mb-6 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
          <svg className="w-8 h-8 stroke-np-lite fill-none stroke-[1.5]" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div className="page-hero-badge">Simple Process</div>
        <h1>How It Works</h1>
        <p>From your first quote to a beautifully maintained yard — here's exactly what to expect when you work with NPLawn or book through the CleanLawn marketplace.</p>
      </section>

      {/* NPLAWN SERVICES STEPS */}
      <section className="pg-section white">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">NPLawn Core Services</p>
          <h2 className="pg-title">Lawn Care Plans, Tree Care &amp; Landscape Design</h2>
          <p className="pg-sub mb-12">Full-service lawn management delivered by our own certified crew — start to finish.</p>

          <div className="space-y-8">
            {NPLAWN_STEPS.map((step, i) => (
              <div key={step.n} className="relative flex gap-6">
                {/* Connector line */}
                {i < NPLAWN_STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-12 bottom-0 w-0.5 bg-np-border" />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-np-accent flex items-center justify-center text-np-dark font-extrabold text-sm z-10">
                  {step.n}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-np-dark text-lg mb-1">{step.title}</h3>
                  <p className="text-np-muted text-sm mb-2">{step.desc}</p>
                  <p className="text-np-muted/70 text-xs leading-relaxed border-l-2 border-np-border pl-3 italic">{step.detail}</p>
                  {step.cta && (
                    <Link to={step.cta.to} className="inline-block mt-3 text-np-accent text-sm font-semibold hover:underline">
                      {step.cta.label} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-np-surface rounded-2xl border border-np-border text-center">
            <p className="text-np-dark font-semibold mb-1">Ready to get started?</p>
            <p className="text-np-muted text-sm mb-4">Get your instant quote and see your price before committing to anything.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/buy-now" className="btn-primary px-6 py-2.5">Buy Now</Link>
              <Link to="/quote" className="btn-outline px-6 py-2.5">Get a Free Quote</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CLEANLAWN MARKETPLACE STEPS */}
      <section className="px-[8%] py-20 bg-np-dark">
        <div className="max-w-3xl mx-auto">
          <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">CleanLawn Marketplace</p>
          <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-3">On-Demand Lawn Services</h2>
          <p className="text-white/60 mb-12">Book mowing, aeration, snow removal and more from vetted local providers — whenever you need it.</p>

          <div className="space-y-6">
            {CLEANLAWN_STEPS.map((step, i) => (
              <div key={step.n} className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-np-accent/20 border border-np-accent/40 flex items-center justify-center text-np-lite font-extrabold text-sm">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base mb-1">{step.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{step.desc}</p>
                  {step.cta && (
                    <Link to={step.cta.to} className="inline-block mt-2 text-np-lite text-sm font-semibold hover:underline">
                      {step.cta.label} &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
            <Link to="/CleanLawn"
              className="flex-1 text-center bg-np-accent text-np-dark font-extrabold px-6 py-3 rounded-full no-underline hover:bg-np-lite transition-all">
              Browse CleanLawn →
            </Link>
            <Link to="/providers"
              className="flex-1 text-center border border-white/30 text-white font-bold px-6 py-3 rounded-full no-underline hover:bg-white/10 transition-all">
              Become a Provider →
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK FAQs */}
      <section className="pg-section surface">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">Common Questions</p>
          <h2 className="pg-title">Quick Answers</h2>
          <div className="space-y-4 mt-8">
            {FAQS.map(f => (
              <div key={f.q} className="bg-white rounded-xl border border-np-border p-5">
                <h3 className="font-bold text-np-dark text-sm mb-2">{f.q}</h3>
                <p className="text-np-muted text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/faq" className="text-np-accent font-semibold text-sm hover:underline">
              View all FAQ &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Questions Before You Start?</h2>
        <p>Our team is happy to walk you through the process — no sales pressure, just honest answers.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/contact" className="btn-primary text-base px-8 py-4">Contact Us</Link>
          <Link to="/faq" className="btn-outline text-base px-8 py-4">Browse FAQ</Link>
        </div>
      </section>
    </>
  );
}
