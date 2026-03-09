import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const SERVICES = [
  'Lawn Mowing', 'Hedge Trimming', 'Leaf Removal', 'Aeration & Seeding',
  'Mulching', 'Snow Removal', 'Landscaping Design', 'Irrigation System',
  'Stump Grinding', 'Brush Clearing', 'Sod Installation', 'Other',
];
const TERRAINS   = ['Flat', 'Slight slope', 'Steep slope', 'Mixed'];
const SCHEDULES  = [{ value: 'one_time', label: 'One-time' }, { value: 'recurring', label: 'Recurring' }];
const FREQ       = ['weekly', 'biweekly', 'monthly', 'seasonal'];
const TIME_SLOTS = ['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–8pm)', 'Any time'];

export default function QuoteRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState(1);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    property_id: '',
    service_types: [],
    description: '',
    lot_size: '',
    terrain: '',
    obstacles: '',
    preferred_date: '',
    preferred_time_window: '',
    schedule_type: 'one_time',
    recurrence_frequency: '',
    special_instructions: '',
  });
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('homeowner_properties').select('id, nickname, address')
      .then(({ data }) => setProperties(data ?? []));
  }, []);

  const toggleService = (s) => setForm(f => ({
    ...f,
    service_types: f.service_types.includes(s)
      ? f.service_types.filter(x => x !== s)
      : [...f.service_types, s],
  }));

  const nextStep = () => {
    if (step === 1 && form.service_types.length === 0) { setError('Select at least one service.'); return; }
    if (step === 2 && !form.preferred_date) { setError('Please select a preferred date.'); return; }
    setError('');
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const { error: err } = await supabase.from('quote_requests').insert({
      homeowner_id:          user.id,
      property_id:           form.property_id || null,
      service_types:         form.service_types,
      description:           form.description.trim() || null,
      lot_size:              form.lot_size || null,
      terrain:               form.terrain || null,
      obstacles:             form.obstacles.trim() || null,
      preferred_date:        form.preferred_date || null,
      preferred_time_window: form.preferred_time_window || null,
      schedule_type:         form.schedule_type,
      recurrence_frequency:  form.schedule_type === 'recurring' ? form.recurrence_frequency : null,
      special_instructions:  form.special_instructions.trim() || null,
      status:                'open',
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    navigate('/CleanLawn/homeowner/quotes');
  };

  const stepLabel = ['Services', 'Schedule', 'Details'];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">Request a Quote</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {stepLabel.map((l, i) => (
            <div key={l} className="flex-1">
              <div className={`h-1.5 rounded-full ${i + 1 <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
              <p className={`text-xs mt-1.5 ${i + 1 === step ? 'text-green-600 font-medium' : 'text-gray-400'}`}>{l}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Step 1 — Services */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-1">What services do you need?</h2>
              <p className="text-sm text-gray-500 mb-4">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {SERVICES.map(s => (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors text-left
                      ${form.service_types.includes(s) ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property (optional)</label>
                <select value={form.property_id} onChange={e => setForm(f => ({ ...f, property_id: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 bg-white">
                  <option value="">— Select a saved property —</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.nickname || p.address}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Any extra context for providers…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 resize-none" />
              </div>
            </div>
          )}

          {/* Step 2 — Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-gray-800 text-lg mb-1">When do you need service?</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service type</label>
                <div className="flex gap-3">
                  {SCHEDULES.map(({ value, label }) => (
                    <button key={value} type="button" onClick={() => setForm(f => ({ ...f, schedule_type: value }))}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                        ${form.schedule_type === value ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {form.schedule_type === 'recurring' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <div className="flex flex-wrap gap-2">
                    {FREQ.map(f => (
                      <button key={f} type="button" onClick={() => setForm(fr => ({ ...fr, recurrence_frequency: f }))}
                        className={`px-3 py-1.5 rounded-lg border text-sm capitalize transition-colors
                          ${form.recurrence_frequency === f ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred date *</label>
                <input type="date" value={form.preferred_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, preferred_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred time window</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, preferred_time_window: t }))}
                      className={`py-2 px-3 rounded-lg border text-sm text-left transition-colors
                        ${form.preferred_time_window === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Details */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-bold text-gray-800 text-lg mb-1">Property details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Approximate lot size</label>
                <select value={form.lot_size} onChange={e => setForm(f => ({ ...f, lot_size: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 bg-white">
                  <option value="">— Select —</option>
                  {['Under ¼ acre', '¼–½ acre', '½–1 acre', '1–2 acres', 'Over 2 acres'].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Terrain</label>
                <div className="flex flex-wrap gap-2">
                  {TERRAINS.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, terrain: t }))}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-colors
                        ${form.terrain === t ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Obstacles or hazards</label>
                <input type="text" value={form.obstacles}
                  onChange={e => setForm(f => ({ ...f, obstacles: e.target.value }))}
                  placeholder="Trees, fences, garden beds, pets…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special instructions</label>
                <textarea value={form.special_instructions}
                  onChange={e => setForm(f => ({ ...f, special_instructions: e.target.value }))}
                  rows={2} placeholder="Gate code, access details, preferences…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 resize-none" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm">
                {saving ? 'Submitting…' : 'Submit Quote Request'}
              </button>
            </form>
          )}

          {error && step < 3 && <p className="text-sm text-red-600 mt-3">{error}</p>}

          {step < 3 && (
            <div className="flex justify-between mt-6">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
              ) : <span />}
              <button onClick={nextStep}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
