import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
  paused:    { label: 'Paused',    color: 'bg-yellow-100 text-yellow-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Schedule() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading]     = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('recurring_schedules')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('created_at', { ascending: false });
    setSchedules(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('recurring_schedules').update({ status }).eq('id', id);
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">Recurring Plans</span>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Recurring Plans</h1>
          <Link to="/CleanLawn/homeowner/quote-request"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + New Plan
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : schedules.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🔁</div>
            <p className="text-gray-500 mb-4">No recurring plans yet.</p>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              When you accept a recurring quote, your plan will appear here. You can pause, resume, or cancel any plan.
            </p>
            <Link to="/CleanLawn/homeowner/quote-request"
              className="inline-block mt-5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
              Request Recurring Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map(s => {
              const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.active;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-800">{s.service_type}</div>
                      <div className="text-sm text-gray-500 mt-0.5 capitalize">
                        {s.frequency}
                        {s.day_of_week != null ? ` · ${DAYS[s.day_of_week]}s` : ''}
                        {s.time_window ? ` · ${s.time_window}` : ''}
                      </div>
                      {s.next_date && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          Next: {new Date(s.next_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>

                  <div className="flex gap-3">
                    {s.status === 'active' && (
                      <button onClick={() => updateStatus(s.id, 'paused')}
                        className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">Pause</button>
                    )}
                    {s.status === 'paused' && (
                      <button onClick={() => updateStatus(s.id, 'active')}
                        className="text-sm text-green-600 hover:text-green-700 font-medium">Resume</button>
                    )}
                    {s.status !== 'cancelled' && (
                      <button onClick={() => { if (confirm('Cancel this recurring plan?')) updateStatus(s.id, 'cancelled'); }}
                        className="text-sm text-red-500 hover:text-red-600 font-medium">Cancel Plan</button>
                    )}
                    <Link to="/CleanLawn/homeowner/messages" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Message Provider
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
