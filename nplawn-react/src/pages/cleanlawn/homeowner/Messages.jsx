import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads]         = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [body, setBody]               = useState('');
  const [sending, setSending]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const bottomRef = useRef(null);

  // Load unique conversation partners from messages
  const loadThreads = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    const seen = new Set();
    const unique = [];
    (data ?? []).forEach(m => {
      const partnerId = m.from_user_id === user.id ? m.to_user_id : m.from_user_id;
      if (!seen.has(partnerId)) {
        seen.add(partnerId);
        unique.push({ partnerId, lastMessage: m });
      }
    });
    setThreads(unique);
    setLoading(false);
  };

  const loadMessages = async (partnerId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${partnerId}),and(from_user_id.eq.${partnerId},to_user_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    setMessages(data ?? []);
    // Mark received as read
    await supabase.from('messages')
      .update({ read: true })
      .eq('to_user_id', user.id)
      .eq('from_user_id', partnerId)
      .eq('read', false);
  };

  useEffect(() => { loadThreads(); }, []);

  useEffect(() => {
    if (!activeThread) return;
    loadMessages(activeThread.partnerId);

    // Realtime subscription
    const channel = supabase.channel(`messages-${activeThread.partnerId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
      }, () => loadMessages(activeThread.partnerId))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [activeThread]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!body.trim() || !activeThread) return;
    setSending(true);
    await supabase.from('messages').insert({
      from_user_id: user.id,
      to_user_id:   activeThread.partnerId,
      body:         body.trim(),
    });
    setBody('');
    setSending(false);
    loadMessages(activeThread.partnerId);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">Messages</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-5">Messages</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex" style={{ minHeight: '500px' }}>
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-100 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversations</p>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 p-4">Loading…</p>
            ) : threads.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-400">No conversations yet.</p>
                <p className="text-xs text-gray-300 mt-1">Accept a quote to start chatting with a provider.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {threads.map(t => (
                  <button key={t.partnerId} onClick={() => setActiveThread(t)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors
                      ${activeThread?.partnerId === t.partnerId ? 'bg-green-50 border-l-2 border-l-green-500' : ''}`}>
                    <div className="font-medium text-sm text-gray-800 truncate">
                      Provider {t.partnerId.slice(0, 6)}…
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{t.lastMessage.body}</div>
                    <div className="text-xs text-gray-300 mt-0.5">{formatDate(t.lastMessage.created_at)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat pane */}
          <div className="flex-1 flex flex-col">
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-4xl mb-3">✉️</div>
                  <p className="text-gray-400 text-sm">Select a conversation to view messages.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-800 text-sm">Provider {activeThread.partnerId.slice(0, 8)}…</p>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: '360px' }}>
                  {messages.map(m => {
                    const isMe = m.from_user_id === user.id;
                    return (
                      <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm
                          ${isMe ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          <p>{m.body}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>{formatTime(m.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 flex gap-3">
                  <input value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2 text-sm rounded-full border border-gray-300 outline-none focus:border-green-500" />
                  <button type="submit" disabled={sending || !body.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-full transition-colors">
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
