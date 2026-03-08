import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const STATUS_COLORS = {
  pending:  'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
  revised:  'bg-blue-100 text-blue-700',
};

export default function Quotes() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [quotesByReq, setQuotesByReq] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data: reqs } = await supabase
      .from('quote_requests')
      .select('*')
      .eq('homeowner_id', user.id)
      .order('created_at', { ascending: false });

    if (reqs?.length) {
      const ids = reqs.map(r => r.id);
      const { data: quotes } = await supabase
        .from('quotes')
        .select('*')
        .in('request_id', ids)
        .order('amount', { ascending: true });

      const byReq = {};
      (quotes ?? []).forEach(q => {
        if (!byReq[q.request_id]) byReq[q.request_id] = [];
        byReq[q.request_id].push(q);
      });
      setQuotesByReq(byReq);
    }

    setRequests(reqs ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const acceptQuote = async (quoteId, requestId) => {
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', quoteId);
    await supabase.from('quote_requests').update({ status: 'accepted' }).eq('id', requestId);
    load();
  };

  const declineQuote = async (quoteId) => {
    await supabase.from('quotes').update({ status: 'declined' }).eq('id', quoteId);
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">My Quotes</span>
        </div>

        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">My Quote Requests</h1>
          <Link to="/CleanLawn/homeowner/quote-request"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            + New Request
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-500 mb-4">No quote requests yet.</p>
            <Link to="/CleanLawn/homeowner/quote-request"
              className="inline-block px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg">
              Request Your First Quote
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => {
              const quotes = quotesByReq[r.id] ?? [];
              const isOpen = expanded === r.id;
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <button className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : r.id)}>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{r.service_types.join(', ')}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{new Date(r.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        r.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        r.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100 px-5 py-4">
                      {r.description && <p className="text-sm text-gray-600 mb-4">{r.description}</p>}

                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Quotes received ({quotes.length})
                      </h3>

                      {quotes.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No quotes yet. Providers are reviewing your request.</p>
                      ) : (
                        <div className="space-y-3">
                          {quotes.map(q => (
                            <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold text-gray-800">{q.provider_name ?? q.provider_email ?? 'Provider'}</div>
                                  {q.estimated_duration && (
                                    <div className="text-xs text-gray-400 mt-0.5">Est. {q.estimated_duration}</div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-700">${q.amount}</div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[q.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {q.status}
                                  </span>
                                </div>
                              </div>
                              {q.description && <p className="text-sm text-gray-600 mt-2">{q.description}</p>}
                              {q.status === 'pending' && r.status === 'open' && (
                                <div className="flex gap-2 mt-3">
                                  <button onClick={() => acceptQuote(q.id, r.id)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg">
                                    Accept
                                  </button>
                                  <button onClick={() => declineQuote(q.id)}
                                    className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50">
                                    Decline
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
