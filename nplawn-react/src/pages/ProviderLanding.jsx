import { Link } from 'react-router-dom';

const BENEFITS = [
  {
    icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    title: 'Earn More Per Job',
    desc: 'Keep the lion\'s share of every job. No franchise fees, no territory restrictions — just fair, transparent commission.',
  },
  {
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    title: 'You Control Your Schedule',
    desc: 'Accept only the jobs that fit your calendar. No mandatory availability windows — work the hours you want.',
  },
  {
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    title: 'Instant Customer Access',
    desc: 'Skip the cold calls and door-knocking. Get matched with homeowners actively looking for your services.',
  },
  {
    icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
    title: 'Vetted, Quality Leads',
    desc: 'Homeowners on CleanLawn have submitted their property info and are ready to book. No tire-kickers.',
  },
  {
    icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    title: 'Simple Provider Dashboard',
    desc: 'Manage quotes, view incoming requests, track your jobs, and communicate with clients — all in one place.',
  },
  {
    icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    title: 'Build Your Reputation',
    desc: 'Earn verified reviews with every completed job. A strong profile on CleanLawn becomes your best marketing asset.',
  },
];

const JOIN_STEPS = [
  {
    n: '1',
    title: 'Create Your Account',
    desc: 'Sign up in minutes. Provide your email and basic credentials — no lengthy application.',
  },
  {
    n: '2',
    title: 'Build Your Provider Profile',
    desc: 'Tell us about your business: services offered, service areas (ZIP codes), team size, and equipment. This becomes your public profile.',
  },
  {
    n: '3',
    title: 'Get Matched with Homeowners',
    desc: 'When a homeowner in your area requests a service you offer, you\'ll be notified instantly. Review the job details and submit your quote.',
  },
  {
    n: '4',
    title: 'Complete the Job & Get Paid',
    desc: 'Do great work, collect your payment, and earn a 5-star review. Repeat with the next customer.',
  },
];

const REQUIREMENTS = [
  'Licensed to operate in Illinois (or in process)',
  'General liability insurance ($1M minimum)',
  'Own your equipment — riding mowers, trimmers, etc.',
  'Ability to service at least one Chicagoland ZIP code',
  'Smartphone for receiving job notifications and updates',
  'Commitment to professional, on-time service',
];

const TESTIMONIALS = [
  {
    text: "Joining CleanLawn doubled my customer base in the first spring season. The leads are real, and the dashboard makes scheduling a breeze.",
    author: "Marcus D.",
    biz: "D&D Lawn Solutions, Naperville",
  },
  {
    text: "I was skeptical about another platform, but CleanLawn is different. Clients are local, jobs are steady, and the commission is fair. Wish I joined sooner.",
    author: "Theresa B.",
    biz: "Bright Green Landscaping, Bolingbrook",
  },
  {
    text: "The review system has been huge for my business. I now have 40+ verified 5-star reviews that I can show to new customers. That trust is priceless.",
    author: "Kevin O.",
    biz: "O'Lawn Services, Plainfield",
  },
];

const SERVICES_LIST = [
  'Lawn Mowing', 'Aeration & Seeding', 'Leaf Removal', 'Hedge Trimming',
  'Mulching', 'Brush Clearing', 'Stump Grinding', 'Snow Removal',
  'Sod Installation', 'Irrigation Systems', 'Landscaping Design', 'Fertilization',
];

export default function ProviderLanding() {
  return (
    <>
      {/* HERO */}
      <section className="min-h-[75vh] flex flex-col items-center justify-center text-center px-[8%] py-20 bg-np-dark">
        <div className="inline-block bg-np-accent/20 border border-np-accent/50 text-np-lite text-xs font-bold tracking-[1.5px] uppercase px-4 py-1.5 rounded-full mb-5">
          CleanLawn Provider Program
        </div>
        <h1 className="text-white font-black leading-[1.1] tracking-tight max-w-3xl mb-5"
          style={{ fontSize: 'clamp(2.2rem, 6vw, 3.8rem)' }}>
          Grow Your Lawn Care Business<br/>
          <span className="text-np-lite">Without the Marketing Headache.</span>
        </h1>
        <p className="text-white/70 text-lg max-w-xl mb-9">
          Join the CleanLawn provider network and get matched with homeowners in your area who are ready to book. You focus on the work — we bring the customers.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/CleanLawn/provider/signup"
            className="bg-np-accent text-np-dark font-extrabold text-base px-9 py-4 rounded-full no-underline hover:bg-np-lite hover:-translate-y-0.5 transition-all shadow-[0_6px_20px_rgba(82,183,136,0.3)]">
            Apply to Join Free
          </Link>
          <a href="#how-it-works"
            className="border-2 border-white/40 text-white font-bold text-base px-8 py-4 rounded-full no-underline hover:border-white hover:bg-white/10 transition-all">
            See How It Works
          </a>
        </div>

        {/* Quick stats */}
        <div className="flex gap-10 mt-14 flex-wrap justify-center">
          {[
            { val: '100+', label: 'Active Providers' },
            { val: '$0', label: 'Setup Fee' },
            { val: '10+', label: 'Service Categories' },
            { val: '500+', label: 'Homeowners on Platform' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.val}</div>
              <div className="text-white/40 text-xs font-medium tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="px-[8%] py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="pg-label">Why Join CleanLawn</p>
          <h2 className="pg-title">Built for Independent Lawn Pros</h2>
          <p className="pg-sub mb-12">We know the lawn care business is hard work. CleanLawn is designed to make the business side easier so you can focus on what you do best.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map(b => (
              <div key={b.title} className="p-6 rounded-2xl border border-np-border hover:border-np-accent/50 hover:shadow-np transition-all">
                <div className="w-11 h-11 rounded-xl bg-np-surface flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 stroke-np-accent fill-none stroke-[1.8]" viewBox="0 0 24 24">{b.icon}</svg>
                </div>
                <h3 className="font-bold text-np-dark text-base mb-2">{b.title}</h3>
                <p className="text-np-muted text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-[8%] py-20 bg-np-surface">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">The Process</p>
          <h2 className="pg-title">How Joining Works</h2>
          <p className="pg-sub mb-12">From signup to your first job — it's straightforward.</p>
          <div className="space-y-8">
            {JOIN_STEPS.map((step, i) => (
              <div key={step.n} className="relative flex gap-6">
                {i < JOIN_STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-np-border" />
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-np-accent flex items-center justify-center text-np-dark font-extrabold text-sm z-10">
                  {step.n}
                </div>
                <div className="pb-8">
                  <h3 className="font-bold text-np-dark text-lg mb-1">{step.title}</h3>
                  <p className="text-np-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link to="/CleanLawn/provider/signup"
              className="btn-primary px-9 py-3.5 text-base">
              Start Your Application
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES YOU CAN OFFER */}
      <section className="px-[8%] py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="pg-label">Service Categories</p>
          <h2 className="pg-title">Offer the Services You Already Do</h2>
          <p className="pg-sub mb-10">No need to add new capabilities. List the services you currently provide and get matched with clients who need exactly that.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SERVICES_LIST.map(s => (
              <span key={s} className="px-4 py-2 rounded-full bg-np-surface border border-np-border text-np-dark text-sm font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROVIDER TESTIMONIALS */}
      <section className="px-[8%] py-20 bg-np-dark">
        <p className="text-np-lite text-xs font-bold tracking-[2px] uppercase mb-2">Provider Stories</p>
        <h2 className="text-white text-3xl md:text-4xl font-extrabold mb-12">Hear from the Pros in the Network</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-np-lite text-xl mb-3">★★★★★</div>
              <p className="text-white/80 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="font-semibold text-white text-sm">{t.author}</div>
              <div className="text-white/40 text-xs">{t.biz}</div>
            </div>
          ))}
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="px-[8%] py-20 bg-np-surface">
        <div className="max-w-3xl mx-auto">
          <p className="pg-label">Who Can Apply</p>
          <h2 className="pg-title">Provider Requirements</h2>
          <p className="pg-sub mb-8">We maintain quality standards so homeowners trust the CleanLawn network. Here's what we look for:</p>
          <div className="space-y-3">
            {REQUIREMENTS.map(r => (
              <div key={r} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-np-border">
                <svg className="w-5 h-5 stroke-np-accent fill-none stroke-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-np-dark text-sm">{r}</span>
              </div>
            ))}
          </div>
          <p className="text-np-muted text-sm mt-5">
            Don't meet every requirement yet?{' '}
            <Link to="/contact" className="text-np-accent font-semibold hover:underline">Contact us</Link>
            {' '}— we may be able to work with you as you grow.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Grow Your Business?</h2>
        <p>Join for free. No setup fees, no monthly minimums. Get your first customer match within days of approval.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/CleanLawn/provider/signup" className="btn-primary text-base px-9 py-4">Apply to Join — Free</Link>
          <Link to="/contact" className="btn-outline text-base px-8 py-4">Talk to Our Team</Link>
        </div>
      </section>
    </>
  );
}
