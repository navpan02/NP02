import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SERVICES = [
  'Lawn Care Plan (GrassBasic)',
  'Lawn Care Plan (GrassPro)',
  'Lawn Care Plan (GrassNatural)',
  'Lawn Mowing',
  'Tree Trimming',
  'Tree & Shrub Care',
  'Aeration & Seeding',
  'Landscape Design',
  'Not sure — need advice',
];

export default function GetQuote() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', service: '', sqft: '', address: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setError(''); setForm(f => ({ ...f, [k]: v })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) {
      setError('Please provide your name and at least an email or phone number.');
      return;
    }
    setLoading(true);

    const lead = {
      name:         form.name.trim(),
      email:        form.email.trim() || null,
      phone:        form.phone.trim() || null,
      service:      form.service || null,
      message:      [
        form.sqft ? `Property size: ${form.sqft} sq ft` : null,
        form.address ? `Address: ${form.address}` : null,
        form.notes ? form.notes : null,
      ].filter(Boolean).join('\n') || null,
      source:       'get_quote',
      submitted_at: new Date().toISOString(),
    };

    const { error: dbError } = await supabase.from('leads').insert([lead]);
    if (dbError) console.error('Supabase lead insert error:', dbError.message);

    // localStorage fallback
    const leads = JSON.parse(localStorage.getItem('nplawn_leads') || '[]');
    leads.push({ ...form, source: 'get_quote', submittedAt: Date.now() });
    localStorage.setItem('nplawn_leads', JSON.stringify(leads));

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-np-surface flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-np-accent/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 stroke-np-accent fill-none stroke-2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h2 className="text-np-dark text-3xl font-extrabold mb-2">Quote Request Sent!</h2>
          <p className="text-np-muted mb-8">Thanks, <strong className="text-np-dark">{form.name}</strong>! We'll review your request and get back to you within 1 business day with a custom quote.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/" className="btn-primary px-6 py-3">Back to Home</Link>
            <Link to="/order" className="btn-outline px-6 py-3">Place Full Order</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-np-surface">
      {/* Hero */}
      <div className="bg-np-dark text-white px-[5%] py-12 text-center">
        <div className="page-hero-badge">Free Quote</div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Get Your Free Quote</h1>
        <p className="text-white/60 max-w-xl mx-auto">Tell us about your property and we'll send you a custom quote within 1 business day. No commitment required.</p>
      </div>

      <div className="max-w-2xl mx-auto px-[5%] py-12">
        <div className="bg-white rounded-2xl border border-np-border shadow-np p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" required value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
            </div>

            {/* Email + Phone */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="(630) 555-0100" />
              </div>
            </div>

            {/* Service */}
            <div className="form-group">
              <label className="form-label">Service Interested In</label>
              <select className="form-input" value={form.service} onChange={e => set('service', e.target.value)}>
                <option value="">Select a service…</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Sqft + Address */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="form-label">Property Size (sq ft)</label>
                <input className="form-input" type="number" min={100} value={form.sqft}
                  onChange={e => set('sqft', e.target.value)} placeholder="e.g. 4000" />
              </div>
              <div className="form-group">
                <label className="form-label">Address / City</label>
                <input className="form-input" type="text" value={form.address}
                  onChange={e => set('address', e.target.value)} placeholder="123 Main St, Naperville" />
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea className="form-textarea" rows={3} value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Describe your lawn, any current issues, preferred schedule…" />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Sending…' : 'Request My Free Quote →'}
            </button>
          </form>

          <p className="text-center text-np-muted text-xs mt-6">
            Ready to commit?{' '}
            <Link to="/order" className="text-np-accent font-semibold hover:underline">Place a full order directly →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
