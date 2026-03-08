import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_CONFIG = {
  upcoming:    { label: 'Upcoming',    color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  completed:   { label: 'Completed',   color: 'bg-green-100 text-green-700' },
  cancelled:   { label: 'Cancelled',   color: 'bg-gray-100 text-gray-500' },
};

const TABS = ['upcoming', 'in_progress', 'completed', 'cancelled'];

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('upcoming');

  useEffect(() => {
    supabase.from('jobs')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('scheduled_date', { ascending: true })
      .then(({ data }) => { setJobs(data ?? []); setLoading(false); });
  }, []);

  const filtered = jobs.filter(j => j.status === tab);

  const cancelJob = async (id) => {
    if (!confirm('Cancel this job?')) return;
    await supabase.from('jobs').update({ status: 'cancelled' }).eq('id', id);
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'cancelled' } : j));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">My Jobs</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-5">My Jobs</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors
                ${tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {STATUS_CONFIG[t].label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                ${tab === t ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {jobs.filter(j => j.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🗓️</div>
            <p className="text-gray-500">No {STATUS_CONFIG[tab].label.toLowerCase()} jobs.</p>
            {tab === 'upcoming' && (
              <Link to="/CleanLawn/homeowner/quote-request"
                className="inline-block mt-4 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
                Request a Service
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(j => (
              <div key={j.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800">{j.service_type}</div>
                    {j.scheduled_date && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        {new Date(j.scheduled_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                        {j.scheduled_time && ` · ${j.scheduled_time}`}
                      </div>
                    )}
                    {j.notes && <p className="text-xs text-gray-400 mt-1 italic">{j.notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[j.status].color}`}>
                    {STATUS_CONFIG[j.status].label}
                  </span>
                </div>

                <div className="flex gap-3 mt-4">
                  <Link to="/CleanLawn/homeowner/messages"
                    className="text-sm text-green-600 hover:text-green-700 font-medium">Message Provider</Link>
                  {j.status === 'completed' && (
                    <Link to="/CleanLawn/homeowner"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium">Leave Review</Link>
                  )}
                  {j.status === 'upcoming' && (
                    <button onClick={() => cancelJob(j.id)}
                      className="text-sm text-red-500 hover:text-red-600 font-medium">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
