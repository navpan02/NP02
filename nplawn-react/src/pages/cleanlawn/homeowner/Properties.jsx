import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const BLANK = { nickname: '', address: '', city: '', state: 'IL', zip: '', lot_size_sqft: '', notes: '' };

export default function HomeownerProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(BLANK);
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState(null);
  const [error, setError]           = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('homeowner_properties')
      .select('*')
      .order('is_primary', { ascending: false });
    setProperties(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(BLANK); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (p) => { setForm({ ...p, lot_size_sqft: p.lot_size_sqft ?? '' }); setEditId(p.id); setShowForm(true); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) { setError('Address is required.'); return; }
    setSaving(true);
    setError('');

    const payload = {
      homeowner_id: user.id,
      nickname:      form.nickname.trim() || null,
      address:       form.address.trim(),
      city:          form.city.trim() || null,
      state:         form.state.trim() || 'IL',
      zip:           form.zip.trim() || null,
      lot_size_sqft: form.lot_size_sqft ? parseInt(form.lot_size_sqft) : null,
      notes:         form.notes.trim() || null,
    };

    let err;
    if (editId) {
      ({ error: err } = await supabase.from('homeowner_properties').update(payload).eq('id', editId));
    } else {
      ({ error: err } = await supabase.from('homeowner_properties').insert(payload));
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    await supabase.from('homeowner_properties').delete().eq('id', id);
    load();
  };

  const setPrimary = async (id) => {
    await supabase.from('homeowner_properties').update({ is_primary: false }).eq('homeowner_id', user.id);
    await supabase.from('homeowner_properties').update({ is_primary: true }).eq('id', id);
    load();
  };

  const F = ({ label, id, type = 'text', ...rest }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input id={id} type={type}
        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
        {...rest} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">My Properties</span>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
          {!showForm && (
            <button onClick={openNew}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
              + Add Property
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4">{editId ? 'Edit Property' : 'New Property'}</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <F label="Nickname (optional)" id="nickname" value={form.nickname}
                onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} placeholder="e.g. Home, Lake House" />
              <F label="Street Address *" id="address" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <F label="City" id="city" value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Chicago" />
                </div>
                <F label="State" id="state" value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))} placeholder="IL" />
                <F label="ZIP" id="zip" value={form.zip}
                  onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} placeholder="60601" />
              </div>
              <F label="Lot Size (sq ft)" id="lot_size_sqft" type="number" value={form.lot_size_sqft}
                onChange={e => setForm(f => ({ ...f, lot_size_sqft: e.target.value }))} placeholder="5000" />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes for providers</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Gate code, pets, special access instructions…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 resize-none" />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                  {saving ? 'Saving…' : 'Save Property'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : properties.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🏡</div>
            <p className="text-gray-500">No properties yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{p.nickname || p.address}</span>
                      {p.is_primary && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Primary</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{p.address}{p.city ? `, ${p.city}` : ''}{p.state ? `, ${p.state}` : ''} {p.zip}</p>
                    {p.lot_size_sqft && <p className="text-xs text-gray-400 mt-0.5">{p.lot_size_sqft.toLocaleString()} sq ft</p>}
                    {p.notes && <p className="text-xs text-gray-400 mt-1 italic">{p.notes}</p>}
                  </div>
                  <div className="flex gap-2 text-sm">
                    {!p.is_primary && (
                      <button onClick={() => setPrimary(p.id)} className="text-green-600 hover:text-green-700 font-medium">Set Primary</button>
                    )}
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
