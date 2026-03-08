import { Link } from 'react-router-dom';

const SERVICES = [
  { name: 'Lawn Mowing', desc: 'Single visits or recurring. Priced by lawn size.', to: '/CleanLawn/mowing' },
  { name: 'Aeration & Seeding', desc: 'Core aeration + overseeding for thick, healthy turf.', to: '/CleanLawn/aeration-seeding' },
  { name: 'Leaf Removal', desc: 'Seasonal cleanup — bagged and hauled away.', to: '/CleanLawn/leaf-removal' },
  { name: 'Hedge Trimming', desc: 'Shrub shaping and hedge maintenance.', to: '/CleanLawn/hedge-trimming' },
  { name: 'Mulching', desc: 'Fresh mulch for beds — delivered and spread.', to: '/CleanLawn/mulching' },
  { name: 'Snow Removal', desc: 'Driveway and walkway clearing after snowfall.', to: '/CleanLawn/snow-removal' },
  { name: 'Stump Grinding', desc: 'Remove unsightly stumps after tree removal.', to: '/CleanLawn/stump-grinding' },
  { name: 'Sod Installation', desc: 'Fresh sod for new lawns or bare patches.', to: '/CleanLawn/sod-installation' },
];

export default function CleanLawnMarketplaceGuide() {
  return (
    <>
      <section className="page-hero">
        <div className="page-hero-badge">CleanLawn</div>
        <h1>How the CleanLawn Marketplace Works: A Complete Guide for Homeowners</h1>
        <p className="post-meta">March 8, 2026 &nbsp;•&nbsp; 7 min read &nbsp;•&nbsp; By the NPLawn Team</p>
      </section>

      <article className="post-body">

        <p className="post-lead">
          CleanLawn is NPLawn's on-demand marketplace for lawn and outdoor services. If you've ever struggled to find a reliable mowing crew, wondered why getting a quote takes a week, or ended up ghosted by a contractor — CleanLawn was built to solve that. Here's exactly how it works.
        </p>

        <h2>What Is CleanLawn?</h2>
        <p>
          CleanLawn is a dedicated marketplace that connects Chicagoland homeowners with vetted, local lawn service providers. Think of it as the layer between "I need my lawn mowed" and "a reliable person shows up and does it well."
        </p>
        <p>
          Unlike a standard directory, CleanLawn manages the quoting process, the booking, the job tracking, and the review system in one place. You don't have to call five companies, leave voicemails, and compare handwritten estimates. You submit your property information once, and providers in your area can respond with competitive quotes.
        </p>
        <p>
          CleanLawn is separate from NPLawn's core service offerings (annual lawn care plans, tree care, landscape design — those are performed by our own crew). CleanLawn is for on-demand, one-time, or recurring maintenance tasks handled by independent local providers who have been vetted and approved to use the platform.
        </p>

        <h2>Who Are the Providers?</h2>
        <p>
          CleanLawn providers are independent lawn care businesses operating in the Chicagoland area. To be listed on the platform, providers must:
        </p>
        <ul>
          <li>Carry general liability insurance ($1M minimum)</li>
          <li>Hold or be in process of obtaining an Illinois business license</li>
          <li>Own their own equipment</li>
          <li>Complete a profile review process</li>
          <li>Maintain a minimum quality rating based on customer reviews</li>
        </ul>
        <p>
          These aren't anonymous gig workers — they're established local businesses with names, reputations, and real stakes in doing good work. Many have been operating in Chicagoland for years. On CleanLawn, you can see their full profile, read their verified reviews, and understand their service specialties before you book.
        </p>

        <h2>Step-by-Step: How to Book Through CleanLawn</h2>

        <h3>Step 1: Create Your Homeowner Account</h3>
        <p>
          Sign up at <Link to="/signup" className="text-np-accent hover:underline">NPLawn.com/signup</Link>. This takes about 2 minutes. Your account lets you manage your property profile, track quote requests, communicate with providers, and review past jobs — all in one dashboard.
        </p>

        <h3>Step 2: Add Your Property</h3>
        <p>
          After signing in, add your property address under your profile. CleanLawn uses your address to help providers understand the size and characteristics of your property when they prepare their quotes. You can add multiple properties if you have more than one location to service.
        </p>

        <h3>Step 3: Browse Services and Submit a Quote Request</h3>
        <p>
          Navigate to the CleanLawn marketplace and choose the service you need. Each service page shows you what's included, typical pricing ranges, and what to expect on service day. When you're ready, submit a quote request with your preferred timing and any specific notes.
        </p>

        <h3>Step 4: Review Provider Quotes</h3>
        <p>
          Providers in your area who offer that service and cover your ZIP code will see your request and can respond with their quote. You'll be notified as quotes come in. Review each provider's pricing, profile, and reviews to make your selection.
        </p>

        <h3>Step 5: Book and Confirm</h3>
        <p>
          Select your preferred provider and confirm the booking. You'll receive confirmation of the scheduled date and time. You can communicate directly with the provider through the platform if you have any specific requirements or questions.
        </p>

        <h3>Step 6: Job Day</h3>
        <p>
          In most cases, you don't need to be home. Make sure gates are unlocked and pets are secured. The provider completes the work and updates the job status in the platform. You'll be notified when the job is marked complete.
        </p>

        <h3>Step 7: Review Your Provider</h3>
        <p>
          After the job, leave a rating and review. Your feedback directly influences which providers get more business on the platform. High-quality providers who consistently get 5-star reviews earn more visibility — which is how we keep quality high across the marketplace.
        </p>

        <h2>Services Available on CleanLawn</h2>
        <p>
          CleanLawn covers a wide range of outdoor maintenance tasks. Current service categories include:
        </p>
        <div className="grid sm:grid-cols-2 gap-3 my-6">
          {SERVICES.map(s => (
            <Link key={s.name} to={s.to}
              className="flex gap-3 items-start p-4 rounded-xl border border-np-border hover:border-np-accent/40 hover:bg-np-surface no-underline transition-all">
              <svg className="w-4 h-4 stroke-np-accent fill-none stroke-2 flex-shrink-0 mt-0.5" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div>
                <div className="font-semibold text-np-dark text-sm">{s.name}</div>
                <div className="text-np-muted text-xs">{s.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <h2>How Pricing Works</h2>
        <p>
          CleanLawn uses a competitive quote model, which means you'll often receive quotes from multiple providers for the same job. This transparency keeps pricing fair and competitive. You're never locked into a price before you see it.
        </p>
        <p>
          Pricing varies by:
        </p>
        <ul>
          <li><strong>Property size:</strong> Your lawn's square footage is the primary driver of mowing and treatment pricing.</li>
          <li><strong>Service type:</strong> One-time services are priced individually. Some services (like recurring mowing) may be available at a discounted recurring rate.</li>
          <li><strong>Provider availability:</strong> Providers in high demand may price at a premium. Providers with open availability often compete on price to fill their schedule.</li>
          <li><strong>Seasonal demand:</strong> Aeration in peak fall season, snow removal after a major storm — high-demand periods affect availability and pricing.</li>
        </ul>

        <h2>Tips for Getting the Best Results</h2>
        <ul>
          <li><strong>Book ahead for seasonal services.</strong> Aeration &amp; seeding in fall and spring cleanup fill up fast. Submit your quote request 2–3 weeks early.</li>
          <li><strong>Be specific in your notes.</strong> Tell providers about any access issues, gate codes, or specific areas that need extra attention. The more context, the better the result.</li>
          <li><strong>Review provider profiles before booking.</strong> Look at their review history, the services they specialize in, and their years of experience. A provider with 50 reviews at 4.8 stars is a safe choice.</li>
          <li><strong>Communicate through the platform.</strong> Keep all communication in the CleanLawn messaging system so there's a clear record for both parties.</li>
          <li><strong>Leave honest reviews.</strong> The review system only works if homeowners participate. A detailed review — positive or constructive — helps other homeowners and raises the overall quality of the marketplace.</li>
        </ul>

        <h2>CleanLawn vs. NPLawn Core Services: Which Do I Need?</h2>
        <p>
          Here's a simple way to think about it:
        </p>
        <ul>
          <li><strong>Choose NPLawn core services</strong> if you want annual lawn care plans (fertilization, weed control, seasonal treatments), professional tree care, or a full landscape design and installation project. This is NPLawn's own crew, operating under our direct quality oversight.</li>
          <li><strong>Choose CleanLawn marketplace</strong> if you need on-demand services — a one-time mow, leaf removal, a stump ground out, or snow cleared after a storm. Local providers, competitive pricing, flexible scheduling.</li>
        </ul>
        <p>
          Many homeowners use both: an NPLawn annual lawn care plan for their soil health and treatment program, and CleanLawn for mowing and seasonal cleanup between service visits.
        </p>

        <div className="post-cta">
          <h3>Ready to Try CleanLawn?</h3>
          <p>Create your free homeowner account and submit your first quote request today. It takes less than 5 minutes.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/CleanLawn" className="btn-primary px-7 py-3">Explore CleanLawn</Link>
            <Link to="/signup" className="btn-outline px-7 py-3">Create Account</Link>
          </div>
        </div>

      </article>

      <section className="pg-section surface">
        <div className="max-w-2xl mx-auto text-center">
          <p className="pg-label">More Reading</p>
          <h2 className="pg-title">Continue Learning</h2>
          <div className="flex gap-3 justify-center flex-wrap mt-6">
            <Link to="/blog/aerate-guide" className="btn-outline px-5 py-2.5 text-sm">When to Aerate →</Link>
            <Link to="/blog/one-third-rule" className="btn-outline px-5 py-2.5 text-sm">Mowing the Right Way →</Link>
            <Link to="/blog" className="btn-outline px-5 py-2.5 text-sm">All Articles →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
