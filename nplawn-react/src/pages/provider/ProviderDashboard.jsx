import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

/* ─────────────────────── Default availability ─────────────────────── */
const DEFAULT_AVAIL = {
  weeklyWindows: {
    Monday:    { enabled: true,  start: '08:00', end: '17:00' },
    Tuesday:   { enabled: true,  start: '08:00', end: '17:00' },
    Wednesday: { enabled: true,  start: '08:00', end: '17:00' },
    Thursday:  { enabled: true,  start: '08:00', end: '17:00' },
    Friday:    { enabled: true,  start: '08:00', end: '17:00' },
    Saturday:  { enabled: false, start: '09:00', end: '13:00' },
    Sunday:    { enabled: false, start: '09:00', end: '13:00' },
  },
  blockedDates: [],
  acceptingRequests: true,
  maxJobsPerDay: 4,
  maxJobsPerWeek: 18,
};

/* ─────────────────────── Supabase helpers ─────────────────────── */
async function dbGetProfile(email) {
  const { data } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('email', email)
    .single();
  return data || null;
}

async function dbSaveProfile(profile) {
  const row = {
    email:              profile.email,
    business_name:      profile.businessName,
    description:        profile.description,
    phone:              profile.phone,
    address:            profile.address,
    years_in_business:  profile.yearsInBusiness ? parseInt(profile.yearsInBusiness) : null,
    team_size:          profile.teamSize ? parseInt(profile.teamSize) : null,
    equipment:          profile.equipment,
    license_number:     profile.licenseNumber,
    services_offered:   profile.servicesOffered || [],
    service_areas:      profile.serviceAreas || [],
    portfolio:          profile.portfolio || [],
    rating:             profile.rating || null,
    total_jobs:         profile.totalJobs || 0,
  };
  const { error } = await supabase.from('provider_profiles').upsert(row);
  return !error;
}

function rowToProfile(row) {
  if (!row) return null;
  return {
    email:            row.email,
    businessName:     row.business_name,
    description:      row.description,
    phone:            row.phone,
    address:          row.address,
    yearsInBusiness:  row.years_in_business,
    teamSize:         row.team_size,
    equipment:        row.equipment,
    licenseNumber:    row.license_number,
    servicesOffered:  row.services_offered || [],
    serviceAreas:     row.service_areas || [],
    portfolio:        row.portfolio || [],
    rating:           row.rating,
    totalJobs:        row.total_jobs,
    createdAt:        row.created_at,
  };
}

async function dbGetQuoteRequests(zips = []) {
  let q = supabase.from('quote_requests').select('*').eq('status', 'open').order('submitted_at', { ascending: false });
  if (zips.length) q = q.in('zip_code', zips);
  const { data } = await q;
  return (data || []).map(r => ({
    id:             r.id,
    homeownerName:  r.homeowner_name,
    homeownerEmail: r.homeowner_email,
    serviceType:    r.service_type,
    address:        r.address,
    zipCode:        r.zip_code,
    propertySize:   r.property_size,
    description:    r.description,
    photos:         r.photos || [],
    submittedAt:    r.submitted_at,
    status:         r.status,
  }));
}

async function dbGetProviderQuotes(email) {
  const { data } = await supabase
    .from('provider_quotes')
    .select('*')
    .eq('provider_id', email)
    .order('submitted_at', { ascending: false });
  return (data || []).map(r => ({
    id:                 r.id,
    quoteRequestId:     r.quote_request_id,
    providerId:         r.provider_id,
    homeownerName:      r.homeowner_name,
    serviceType:        r.service_type,
    priceType:          r.price_type,
    price:              r.price,
    priceMax:           r.price_max,
    estimatedDuration:  r.estimated_duration,
    validityDays:       r.validity_days,
    notes:              r.notes,
    status:             r.status,
    submittedAt:        r.submitted_at,
  }));
}

async function dbInsertQuote(q) {
  const { error } = await supabase.from('provider_quotes').insert({
    id:                 q.id,
    quote_request_id:   q.quoteRequestId,
    provider_id:        q.providerId,
    homeowner_name:     q.homeownerName,
    service_type:       q.serviceType,
    price_type:         q.priceType,
    price:              q.price,
    price_max:          q.priceMax || null,
    estimated_duration: q.estimatedDuration,
    validity_days:      q.validityDays,
    notes:              q.notes,
    status:             'pending',
    submitted_at:       new Date().toISOString(),
  });
  return !error;
}

async function dbUpdateQuoteStatus(id, status) {
  const { error } = await supabase.from('provider_quotes').update({ status }).eq('id', id);
  return !error;
}

async function dbGetJobs(email) {
  const { data } = await supabase
    .from('provider_jobs')
    .select('*')
    .eq('provider_id', email)
    .order('scheduled_date', { ascending: false });
  return (data || []).map(r => ({
    id:                 r.id,
    providerId:         r.provider_id,
    quoteId:            r.quote_id,
    homeownerName:      r.homeowner_name,
    homeownerEmail:     r.homeowner_email,
    serviceType:        r.service_type,
    address:            r.address,
    scheduledDate:      r.scheduled_date,
    scheduledTime:      r.scheduled_time,
    status:             r.status,
    isRecurring:        r.is_recurring,
    recurringFrequency: r.recurring_frequency,
    notes:              r.notes,
  }));
}

async function dbUpdateJobStatus(id, status) {
  const { error } = await supabase.from('provider_jobs').update({ status }).eq('id', id);
  return !error;
}

async function dbRescheduleJob(id, date, time) {
  const { error } = await supabase
    .from('provider_jobs')
    .update({ scheduled_date: date, scheduled_time: time, status: 'scheduled' })
    .eq('id', id);
  return !error;
}

async function dbGetMessages(email) {
  const { data } = await supabase
    .from('provider_messages')
    .select('*')
    .or(`from_id.eq.${email},to_id.eq.${email}`)
    .order('sent_at', { ascending: true });
  return (data || []).map(r => ({
    id:        r.id,
    threadId:  r.thread_id,
    fromId:    r.from_id,
    fromName:  r.from_name,
    toId:      r.to_id,
    content:   r.content,
    sentAt:    r.sent_at,
    read:      r.read,
  }));
}

async function dbSendMessage(msg) {
  const { error } = await supabase.from('provider_messages').insert({
    id:        msg.id,
    thread_id: msg.threadId,
    from_id:   msg.fromId,
    from_name: msg.fromName,
    to_id:     msg.toId,
    content:   msg.content,
    sent_at:   msg.sentAt,
    read:      msg.read,
  });
  return !error;
}

async function dbGetAvailability(email) {
  const { data } = await supabase
    .from('provider_availability')
    .select('*')
    .eq('provider_id', email)
    .single();
  if (!data) return DEFAULT_AVAIL;
  return {
    weeklyWindows:     data.weekly_windows || DEFAULT_AVAIL.weeklyWindows,
    blockedDates:      data.blocked_dates || [],
    acceptingRequests: data.accepting_requests,
    maxJobsPerDay:     data.max_jobs_per_day,
    maxJobsPerWeek:    data.max_jobs_per_week,
  };
}

async function dbSaveAvailability(email, avail) {
  const { error } = await supabase.from('provider_availability').upsert({
    provider_id:        email,
    weekly_windows:     avail.weeklyWindows,
    blocked_dates:      avail.blockedDates,
    accepting_requests: avail.acceptingRequests,
    max_jobs_per_day:   avail.maxJobsPerDay,
    max_jobs_per_week:  avail.maxJobsPerWeek,
  });
  return !error;
}

/* ─────────────────────── Seed demo data to Supabase ─────────────────────── */
async function seedDemoData(email) {
  // Use a localStorage flag so we only seed once per browser
  if (localStorage.getItem(`nplawn_demo_seeded_v2_${email}`)) return;

  // Seed profile if missing
  const existing = await dbGetProfile(email);
  if (!existing) {
    await dbSaveProfile({
      email,
      businessName: 'Green Horizon Lawn Co.',
      description: 'Family-owned lawn care and landscaping serving Naperville & surrounding suburbs since 2015.',
      phone: '(630) 555-0198',
      address: '500 Ogden Ave, Naperville, IL 60540',
      yearsInBusiness: 9,
      teamSize: 4,
      equipment: '2 riding mowers, walk-behind, chipper, truck fleet',
      licenseNumber: 'IL-LN-20815',
      servicesOffered: ['Lawn Mowing', 'Tree Trimming', 'Aeration & Seeding', 'Leaf Removal', 'Fertilization'],
      serviceAreas: ['60540', '60563', '60517'],
      portfolio: [],
      rating: 4.8,
      totalJobs: 0,
    });
  }

  // Seed demo quotes if none exist yet
  const existingQuotes = await dbGetProviderQuotes(email);
  if (existingQuotes.length === 0) {
    await dbInsertQuote({
      id: 'pq001', quoteRequestId: 'qr001', providerId: email,
      homeownerName: 'Raj Patel', serviceType: 'Lawn Mowing',
      priceType: 'flat', price: 65, priceMax: null,
      estimatedDuration: '1.5 hours', validityDays: 7,
      notes: 'Includes edging and cleanup.',
    });
    // Mark pq001 as accepted directly
    await supabase.from('provider_quotes').update({ status: 'accepted' }).eq('id', 'pq001');

    await dbInsertQuote({
      id: 'pq002', quoteRequestId: 'qr002', providerId: email,
      homeownerName: 'Sarah Kim', serviceType: 'Tree Trimming',
      priceType: 'range', price: 280, priceMax: 350,
      estimatedDuration: '3–4 hours', validityDays: 5,
      notes: 'Final price depends on canopy access.',
    });
  }

  // Seed demo jobs if none exist
  const existingJobs = await dbGetJobs(email);
  if (existingJobs.length === 0) {
    const today     = new Date().toISOString().slice(0, 10);
    const tomorrow  = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const demoJobs = [
      { id: 'job001', provider_id: email, quote_id: 'pq001', homeowner_name: 'Raj Patel',   homeowner_email: 'raj@example.com',   service_type: 'Lawn Mowing',   address: '402 Elm St, Naperville',    scheduled_date: today,     scheduled_time: '09:00', status: 'scheduled', is_recurring: true,  recurring_frequency: 'Weekly',  notes: '' },
      { id: 'job002', provider_id: email, quote_id: null,     homeowner_name: 'Sarah Kim',   homeowner_email: 'sarah@example.com', service_type: 'Tree Trimming', address: '88 Oak Ave, Lisle',          scheduled_date: tomorrow,  scheduled_time: '10:30', status: 'scheduled', is_recurring: false, recurring_frequency: null,      notes: 'Bring chipper' },
      { id: 'job003', provider_id: email, quote_id: null,     homeowner_name: 'Dave Nguyen', homeowner_email: 'dave@example.com',  service_type: 'Leaf Removal',  address: '55 Cedar Ln, Downers Grove', scheduled_date: yesterday, scheduled_time: '08:00', status: 'complete',  is_recurring: false, recurring_frequency: null,      notes: '' },
      { id: 'job004', provider_id: email, quote_id: null,     homeowner_name: 'Lisa Grant',  homeowner_email: 'lisa@example.com',  service_type: 'Fertilization', address: '301 Pine Dr, Naperville',    scheduled_date: yesterday, scheduled_time: '13:00', status: 'complete',  is_recurring: false, recurring_frequency: null,      notes: '' },
    ];
    await supabase.from('provider_jobs').upsert(demoJobs, { onConflict: 'id' });
  }

  // Seed demo messages if none exist
  const existingMsgs = await dbGetMessages(email);
  if (existingMsgs.length === 0) {
    const demoMsgs = [
      { id: 'msg001', thread_id: 'thread_raj',   from_id: 'raj@example.com',   from_name: 'Raj Patel',  to_id: email, content: 'Hi! Can you come by Wednesday morning instead of Thursday?',     sent_at: new Date(Date.now() - 1800000).toISOString(), read: false },
      { id: 'msg002', thread_id: 'thread_raj',   from_id: email,               from_name: 'Me',         to_id: 'raj@example.com', content: "Sure, Wednesday at 9 AM works. I'll confirm the day before.", sent_at: new Date(Date.now() - 900000).toISOString(),  read: true  },
      { id: 'msg003', thread_id: 'thread_sarah', from_id: 'sarah@example.com', from_name: 'Sarah Kim',  to_id: email, content: 'Does your quote include hauling away the branches?',              sent_at: new Date(Date.now() - 7200000).toISOString(), read: true  },
    ];
    await supabase.from('provider_messages').upsert(demoMsgs, { onConflict: 'id' });
  }

  // Seed availability if missing
  const existingAvail = await dbGetAvailability(email);
  if (!existingAvail.weeklyWindows) {
    await dbSaveAvailability(email, DEFAULT_AVAIL);
  }

  localStorage.setItem(`nplawn_demo_seeded_v2_${email}`, '1');
}

/* ─────────────────────── TABS ─────────────────────── */
const TABS = [
  { id: 'overview',     label: 'Overview',     icon: '▦' },
  { id: 'profile',      label: 'Profile',      icon: '👤' },
  { id: 'portfolio',    label: 'Portfolio',    icon: '🖼' },
  { id: 'quotes',       label: 'Quotes',       icon: '📋' },
  { id: 'jobs',         label: 'Jobs',         icon: '📅' },
  { id: 'messages',     label: 'Messages',     icon: '💬' },
  { id: 'availability', label: 'Availability', icon: '🕐' },
];

const STATUS_COLORS = {
  scheduled:    'bg-blue-100 text-blue-700',
  'in-progress':'bg-yellow-100 text-yellow-700',
  complete:     'bg-green-100 text-green-700',
  accepted:     'bg-green-100 text-green-700',
  pending:      'bg-yellow-100 text-yellow-700',
  withdrawn:    'bg-gray-100 text-gray-500',
  rejected:     'bg-red-100 text-red-600',
  open:         'bg-blue-100 text-blue-700',
};

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

/* ═══════════════════════════════════════════════════════════════ */
export default function ProviderDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const email = user?.email || '';

  const [dataLoading, setDataLoading]   = useState(true);
  const [profile, setProfile]           = useState(null);
  const [quoteReqs, setQuoteReqs]       = useState([]);
  const [myQuotes, setMyQuotes]         = useState([]);
  const [jobs, setJobs]                 = useState([]);
  const [messages, setMessages]         = useState([]);
  const [avail, setAvail]               = useState(null);

  const [profileDraft, setProfileDraft] = useState(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [quoteForm, setQuoteForm]       = useState(null);
  const [qPrice, setQPrice]             = useState('');
  const [qPriceType, setQPriceType]     = useState('flat');
  const [qPriceMax, setQPriceMax]       = useState('');
  const [qDuration, setQDuration]       = useState('');
  const [qValidity, setQValidity]       = useState('7');
  const [qNotes, setQNotes]             = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  const [activeThread, setActiveThread] = useState(null);
  const [newMsg, setNewMsg]             = useState('');

  const [rescheduleJob, setRescheduleJob] = useState(null);
  const [newDate, setNewDate]           = useState('');
  const [newTime, setNewTime]           = useState('');

  const [portfolioItems, setPortfolioItems] = useState([]);
  const [portfolioLabel, setPortfolioLabel] = useState('');

  const [blockDate, setBlockDate]       = useState('');

  /* ── auth guard ── */
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'provider' && user.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [authLoading, email]);

  async function loadAll() {
    setDataLoading(true);
    try {
      // Seed demo data for the demo provider account (no-op if already done)
      await seedDemoData(email);

      const p = await dbGetProfile(email);
      const profile = rowToProfile(p);
      setProfile(profile);
      setProfileDraft(profile ? { ...profile } : null);
      setPortfolioItems(profile?.portfolio || []);

      const [reqs, quotes, jobList, msgs, availability] = await Promise.all([
        dbGetQuoteRequests(profile?.serviceAreas || []),
        dbGetProviderQuotes(email),
        dbGetJobs(email),
        dbGetMessages(email),
        dbGetAvailability(email),
      ]);

      setQuoteReqs(reqs);
      setMyQuotes(quotes);
      setJobs(jobList);
      setMessages(msgs);
      setAvail(availability);
    } finally {
      setDataLoading(false);
    }
  }

  /* ── derived stats ── */
  const activeJobs     = jobs.filter(j => j.status !== 'complete').length;
  const pendingQuotes  = myQuotes.filter(q => q.status === 'pending').length;
  const totalDone      = jobs.filter(j => j.status === 'complete').length;
  const acceptedQuotes = myQuotes.filter(q => q.status === 'accepted').length;
  const totalQuotes    = myQuotes.length;
  const convRate       = totalQuotes ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;
  const demoEarnings   = myQuotes.filter(q => q.status === 'accepted')
    .reduce((s, q) => s + (q.price || q.priceMax || 0), 0);
  const unreadCount    = messages.filter(m => !m.read && m.toId === email).length;

  /* ── handlers ── */
  function handleLogout() { logout(); navigate('/'); }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    const ok = await dbSaveProfile(profileDraft);
    if (ok) {
      setProfile({ ...profileDraft });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
      // Reload quote requests in case service areas changed
      const reqs = await dbGetQuoteRequests(profileDraft.serviceAreas || []);
      setQuoteReqs(reqs);
    }
    setProfileSaving(false);
  }

  async function savePortfolio(items) {
    const updated = { ...(profile || {}), portfolio: items };
    await dbSaveProfile(updated);
  }

  async function submitQuote(reqId) {
    const req = quoteReqs.find(r => r.id === reqId);
    if (!req || quoteSubmitting) return;
    setQuoteSubmitting(true);
    const newQ = {
      id: `pq${Date.now()}`,
      quoteRequestId: reqId,
      providerId: email,
      homeownerName: req.homeownerName,
      serviceType: req.serviceType,
      priceType: qPriceType,
      price: parseFloat(qPrice),
      priceMax: qPriceType === 'range' ? parseFloat(qPriceMax) : undefined,
      estimatedDuration: qDuration,
      validityDays: parseInt(qValidity),
      notes: qNotes,
    };
    const ok = await dbInsertQuote(newQ);
    if (ok) {
      const quotes = await dbGetProviderQuotes(email);
      setMyQuotes(quotes);
      setQuoteForm(null);
      setQPrice(''); setQPriceMax(''); setQDuration(''); setQValidity('7'); setQNotes('');
    }
    setQuoteSubmitting(false);
  }

  async function withdrawQuote(qid) {
    const ok = await dbUpdateQuoteStatus(qid, 'withdrawn');
    if (ok) setMyQuotes(prev => prev.map(q => q.id === qid ? { ...q, status: 'withdrawn' } : q));
  }

  async function updateJobStatus(jid, status) {
    const ok = await dbUpdateJobStatus(jid, status);
    if (ok) setJobs(prev => prev.map(j => j.id === jid ? { ...j, status } : j));
  }

  async function doReschedule() {
    const ok = await dbRescheduleJob(rescheduleJob.id, newDate, newTime);
    if (ok) {
      setJobs(prev => prev.map(j => j.id === rescheduleJob.id
        ? { ...j, scheduledDate: newDate, scheduledTime: newTime, status: 'scheduled' } : j));
      setRescheduleJob(null);
    }
  }

  async function sendMessage() {
    if (!newMsg.trim() || !activeThread) return;
    const thread = getThreads().find(t => t.threadId === activeThread);
    const msg = {
      id: `msg${Date.now()}`,
      threadId: activeThread,
      fromId: email,
      fromName: 'Me',
      toId: thread?.partnerId || '',
      content: newMsg.trim(),
      sentAt: new Date().toISOString(),
      read: true,
    };
    const ok = await dbSendMessage(msg);
    if (ok) {
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
    }
  }

  async function addPortfolioItem() {
    if (!portfolioLabel.trim()) return;
    const item = { id: `port${Date.now()}`, label: portfolioLabel.trim(), addedAt: new Date().toISOString() };
    const updated = [...portfolioItems, item];
    setPortfolioItems(updated);
    setPortfolioLabel('');
    await savePortfolio(updated);
  }

  async function removePortfolioItem(id) {
    const updated = portfolioItems.filter(i => i.id !== id);
    setPortfolioItems(updated);
    await savePortfolio(updated);
  }

  async function toggleAccepting() {
    const updated = { ...avail, acceptingRequests: !avail.acceptingRequests };
    setAvail(updated);
    await dbSaveAvailability(email, updated);
  }

  async function toggleAvailDay(day) {
    const updated = { ...avail, weeklyWindows: { ...avail.weeklyWindows, [day]: { ...avail.weeklyWindows[day], enabled: !avail.weeklyWindows[day].enabled } } };
    setAvail(updated);
    await dbSaveAvailability(email, updated);
  }

  async function updateAvailWindow(day, field, val) {
    const updated = { ...avail, weeklyWindows: { ...avail.weeklyWindows, [day]: { ...avail.weeklyWindows[day], [field]: val } } };
    setAvail(updated);
    await dbSaveAvailability(email, updated);
  }

  async function addBlockDate() {
    if (!blockDate || (avail.blockedDates || []).includes(blockDate)) return;
    const updated = { ...avail, blockedDates: [...(avail.blockedDates || []), blockDate].sort() };
    setAvail(updated);
    await dbSaveAvailability(email, updated);
    setBlockDate('');
  }

  async function removeBlockDate(d) {
    const updated = { ...avail, blockedDates: (avail.blockedDates || []).filter(x => x !== d) };
    setAvail(updated);
    await dbSaveAvailability(email, updated);
  }

  function getThreads() {
    const threadMap = {};
    messages.forEach(m => {
      const partnerId   = m.fromId === email ? m.toId   : m.fromId;
      const partnerName = m.fromId === email ? m.toId.split('@')[0] : m.fromName;
      if (!threadMap[m.threadId]) {
        threadMap[m.threadId] = { threadId: m.threadId, partnerId, partnerName, msgs: [], unread: 0 };
      }
      threadMap[m.threadId].msgs.push(m);
      if (!m.read && m.toId === email) threadMap[m.threadId].unread++;
    });
    return Object.values(threadMap).sort((a, b) =>
      new Date(b.msgs.at(-1)?.sentAt) - new Date(a.msgs.at(-1)?.sentAt));
  }

  const threads = getThreads();
  const activeThreadData = threads.find(t => t.threadId === activeThread);

  /* ── loading screen ── */
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-np-dark flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-np-lite border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Loading provider portal…</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-np-surface flex flex-col">

      {/* Top bar */}
      <header className="bg-np-dark px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-np-lite to-np-accent flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 20V10C12 6 9 3 5 4c1 4 4 7 7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 20V12C12 8 15 5 19 6c-1 4-4 7-7 7" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="4" y1="20" x2="20" y2="20" stroke="#1a2e1a" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="text-white font-bold text-sm">Provider Portal</span>
            <p className="text-white/50 text-xs leading-none">{profile?.businessName || email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {avail && !avail.acceptingRequests && (
            <span className="hidden sm:block text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              Paused — not accepting requests
            </span>
          )}
          <Link to="/" className="text-white/60 hover:text-white text-xs transition-colors">Home</Link>
          <button onClick={handleLogout} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-52 bg-white border-r border-np-border flex flex-col py-4 shrink-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all text-left relative ${
                tab === t.id
                  ? 'bg-np-surface text-np-green border-r-2 border-np-green'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <span className="text-base">{t.icon}</span>
              {t.label}
              {t.id === 'messages' && unreadCount > 0 && (
                <span className="ml-auto text-xs bg-np-accent text-np-dark font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              {t.id === 'quotes' && pendingQuotes > 0 && (
                <span className="ml-auto text-xs bg-yellow-400 text-yellow-900 font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingQuotes}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-np-text">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                {profile?.businessName || email.split('@')[0]}
              </h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Active Jobs"     value={activeJobs}        sub="in schedule"       color="text-blue-600" />
                <StatCard label="Pending Quotes"  value={pendingQuotes}     sub="awaiting response" color="text-yellow-600" />
                <StatCard label="Earnings (YTD)"  value={`$${demoEarnings}`} sub="accepted quotes"  color="text-np-green" />
                <StatCard label="Jobs Completed"  value={totalDone}         sub="all time"          color="text-np-mid" />
              </div>

              <div className="bg-white rounded-2xl border border-np-border p-5">
                <h2 className="font-bold text-np-text mb-4">Performance</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Metric label="Conversion Rate" value={`${convRate}%`}   hint="Quote → Job" />
                  <Metric label="Avg. Rating"      value="4.8 ★"           hint="from 12 reviews" />
                  <Metric label="Response Time"    value="< 2 hrs"         hint="avg. this month" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-np-border p-5">
                <h2 className="font-bold text-np-text mb-4">Upcoming Jobs</h2>
                {jobs.filter(j => j.status !== 'complete').length === 0
                  ? <p className="text-sm text-gray-400">No upcoming jobs.</p>
                  : jobs.filter(j => j.status !== 'complete').slice(0, 3).map(j => (
                    <div key={j.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-np-surface flex items-center justify-center text-lg">📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-np-text truncate">{j.serviceType} — {j.homeownerName}</p>
                        <p className="text-xs text-gray-400">{j.scheduledDate} at {j.scheduledTime} · {j.address}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[j.status]}`}>{j.status}</span>
                    </div>
                  ))
                }
              </div>

              {unreadCount > 0 && (
                <div className="bg-white rounded-2xl border border-np-border p-5 cursor-pointer hover:border-np-accent transition-colors"
                  onClick={() => setTab('messages')}>
                  <h2 className="font-bold text-np-text mb-3">Unread Messages <span className="text-np-accent">({unreadCount})</span></h2>
                  {messages.filter(m => !m.read && m.toId === email).slice(0, 2).map(m => (
                    <div key={m.id} className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-np-lite/30 flex items-center justify-center text-sm font-bold text-np-green">
                        {m.fromName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-np-text">{m.fromName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{m.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === 'profile' && !profileDraft && (
            <div className="text-center py-16 text-gray-400"><p className="text-sm">Loading profile…</p></div>
          )}
          {tab === 'profile' && profileDraft && (
            <div className="max-w-2xl space-y-6">
              <h1 className="text-xl font-bold text-np-text">Business Profile</h1>
              <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-np-border p-6 space-y-5">
                <PField label="Business Name" value={profileDraft.businessName || ''} onChange={v => setProfileDraft(d => ({ ...d, businessName: v }))} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} value={profileDraft.description || ''}
                    onChange={e => setProfileDraft(d => ({ ...d, description: e.target.value }))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 resize-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PField label="Phone"             value={profileDraft.phone || ''}            onChange={v => setProfileDraft(d => ({ ...d, phone: v }))} />
                  <PField label="Years in Business" type="number" value={profileDraft.yearsInBusiness || ''} onChange={v => setProfileDraft(d => ({ ...d, yearsInBusiness: v }))} />
                </div>
                <PField label="Business Address" value={profileDraft.address || ''} onChange={v => setProfileDraft(d => ({ ...d, address: v }))} />
                <div className="grid grid-cols-2 gap-4">
                  <PField label="Team Size"       type="number" value={profileDraft.teamSize || ''}       onChange={v => setProfileDraft(d => ({ ...d, teamSize: v }))} />
                  <PField label="License Number"  value={profileDraft.licenseNumber || ''}  onChange={v => setProfileDraft(d => ({ ...d, licenseNumber: v }))} />
                </div>
                <PField label="Equipment / Fleet" value={profileDraft.equipment || ''} onChange={v => setProfileDraft(d => ({ ...d, equipment: v }))} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered</label>
                  <div className="flex flex-wrap gap-2">
                    {['Lawn Mowing','Tree Trimming','Tree & Shrub Care','Aeration & Seeding','Landscape Design','Fertilization','Weed Control','Leaf Removal','Snow Removal','Irrigation','Mulching','Hardscaping'].map(s => {
                      const active = (profileDraft.servicesOffered || []).includes(s);
                      return (
                        <button key={s} type="button"
                          onClick={() => setProfileDraft(d => ({ ...d, servicesOffered: active ? (d.servicesOffered||[]).filter(x=>x!==s) : [...(d.servicesOffered||[]),s] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-np-green text-white border-np-green' : 'bg-white text-gray-600 border-gray-300 hover:border-np-green'}`}>{s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas (ZIP Codes)</label>
                  <div className="flex flex-wrap gap-2">
                    {['60540','60563','60564','60565','60515','60517','60521','60523','60527','60559'].map(z => {
                      const active = (profileDraft.serviceAreas || []).includes(z);
                      return (
                        <button key={z} type="button"
                          onClick={() => setProfileDraft(d => ({ ...d, serviceAreas: active ? (d.serviceAreas||[]).filter(x=>x!==z) : [...(d.serviceAreas||[]),z] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? 'bg-np-accent text-np-dark border-np-accent' : 'bg-white text-gray-600 border-gray-300 hover:border-np-accent'}`}>{z}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={profileSaving}
                    className="px-6 py-2.5 bg-np-green hover:bg-np-mid disabled:opacity-60 text-white font-semibold rounded-lg text-sm transition-colors">
                    {profileSaving ? 'Saving…' : 'Save Changes'}
                  </button>
                  {profileSaved && <span className="text-sm text-np-green font-medium">Saved ✓</span>}
                </div>
              </form>
            </div>
          )}

          {/* ── PORTFOLIO ── */}
          {tab === 'portfolio' && (
            <div className="max-w-2xl space-y-5">
              <h1 className="text-xl font-bold text-np-text">Portfolio Gallery</h1>
              <p className="text-sm text-gray-500">Showcase before & after photos. Upload via your device and add a label.</p>
              <div className="bg-white rounded-2xl border border-np-border p-5">
                <div className="flex gap-3 mb-5">
                  <input type="text" value={portfolioLabel} onChange={e => setPortfolioLabel(e.target.value)}
                    placeholder="Photo label e.g. 'Before & After — Oak Park Mow'" onKeyDown={e => e.key === 'Enter' && addPortfolioItem()}
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
                  <button onClick={addPortfolioItem} className="px-4 py-2 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">+ Add</button>
                </div>
                {portfolioItems.length === 0
                  ? <div className="text-center py-12 text-gray-300"><div className="text-5xl mb-3">🖼</div><p className="text-sm">No portfolio items yet.</p></div>
                  : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {portfolioItems.map(item => (
                        <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-np-surface aspect-[4/3] flex flex-col items-center justify-center">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-xs text-center text-gray-500 px-2">{item.label}</p>
                          <button onClick={() => removePortfolioItem(item.id)}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center font-bold">×</button>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ── QUOTES ── */}
          {tab === 'quotes' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold text-np-text">Quote Management</h1>

              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Incoming Requests</h2>
                {quoteReqs.filter(r => r.status === 'open').length === 0
                  ? <BlankSlate icon="📋" text="No open requests in your service areas." />
                  : quoteReqs.filter(r => r.status === 'open').map(req => {
                    const alreadyQuoted = myQuotes.find(q => q.quoteRequestId === req.id && q.status !== 'withdrawn');
                    return (
                      <div key={req.id} className="bg-white rounded-2xl border border-np-border p-5 mb-3">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className="font-semibold text-np-text">{req.serviceType}</p>
                            <p className="text-sm text-gray-500">{req.homeownerName} · {req.address}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{req.propertySize} · ZIP {req.zipCode} · {new Date(req.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {alreadyQuoted
                            ? <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[alreadyQuoted.status]}`}>Quote {alreadyQuoted.status}</span>
                            : <button onClick={() => setQuoteForm(req.id)}
                                className="shrink-0 px-4 py-2 bg-np-green text-white text-sm font-medium rounded-lg hover:bg-np-mid transition-colors">
                                Submit Quote
                              </button>
                          }
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">{req.description}</p>

                        {quoteForm === req.id && (
                          <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                            <p className="text-sm font-semibold text-np-text">Your Quote</p>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Price Type</label>
                                <select value={qPriceType} onChange={e => setQPriceType(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green">
                                  <option value="flat">Flat Rate</option>
                                  <option value="range">Estimate Range</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">{qPriceType === 'flat' ? 'Price ($)' : 'Min ($)'}</label>
                                <input type="number" value={qPrice} onChange={e => setQPrice(e.target.value)} placeholder="0"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                              {qPriceType === 'range' && (
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-500 mb-1">Max ($)</label>
                                  <input type="number" value={qPriceMax} onChange={e => setQPriceMax(e.target.value)} placeholder="0"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Est. Duration</label>
                                <input type="text" value={qDuration} onChange={e => setQDuration(e.target.value)} placeholder="e.g. 2–3 hours"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Valid (days)</label>
                                <input type="number" value={qValidity} onChange={e => setQValidity(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Notes / Conditions</label>
                              <textarea rows={2} value={qNotes} onChange={e => setQNotes(e.target.value)} placeholder="Any conditions, inclusions, or notes…"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green resize-none" />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => submitQuote(req.id)} disabled={quoteSubmitting}
                                className="px-5 py-2 bg-np-green text-white text-sm font-medium rounded-lg hover:bg-np-mid disabled:opacity-60 transition-colors">
                                {quoteSubmitting ? 'Sending…' : 'Send Quote'}
                              </button>
                              <button onClick={() => setQuoteForm(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </section>

              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My Submitted Quotes</h2>
                {myQuotes.length === 0
                  ? <BlankSlate icon="📤" text="No quotes submitted yet." />
                  : myQuotes.map(q => (
                    <div key={q.id} className="bg-white rounded-2xl border border-np-border p-4 mb-3 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-np-text text-sm">{q.serviceType} — {q.homeownerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {q.priceType === 'flat' ? `$${q.price} flat` : `$${q.price}–$${q.priceMax} range`} · {q.estimatedDuration} · Valid {q.validityDays}d
                        </p>
                        {q.notes && <p className="text-xs text-gray-500 mt-1 truncate">{q.notes}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[q.status]}`}>{q.status}</span>
                      {q.status === 'pending' && (
                        <button onClick={() => withdrawQuote(q.id)} className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0">Withdraw</button>
                      )}
                    </div>
                  ))
                }
              </section>
            </div>
          )}

          {/* ── JOBS ── */}
          {tab === 'jobs' && (
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-np-text">Jobs & Schedule</h1>
              {jobs.length === 0
                ? <BlankSlate icon="📅" text="No jobs yet." />
                : jobs.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)).map(j => (
                  <div key={j.id} className="bg-white rounded-2xl border border-np-border p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-np-surface flex items-center justify-center text-xl shrink-0">
                        {j.serviceType?.startsWith('Mow') ? '🌿' : j.serviceType?.startsWith('Tree') ? '🌲' : '🏡'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-np-text text-sm">{j.serviceType}</p>
                          {j.isRecurring && (
                            <span className="text-xs bg-np-surface text-np-mid border border-np-border px-2 py-0.5 rounded-full">🔁 {j.recurringFrequency}</span>
                          )}
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[j.status]}`}>{j.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{j.homeownerName} · {j.address}</p>
                        <p className="text-xs text-gray-400">{j.scheduledDate} at {j.scheduledTime}</p>
                        {j.notes && <p className="text-xs text-gray-400 mt-1 italic">{j.notes}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                        {j.status === 'scheduled' && (
                          <>
                            <button onClick={() => updateJobStatus(j.id, 'in-progress')}
                              className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors font-medium">Start</button>
                            <button onClick={() => { setRescheduleJob(j); setNewDate(j.scheduledDate); setNewTime(j.scheduledTime); }}
                              className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors font-medium">Reschedule</button>
                          </>
                        )}
                        {j.status === 'in-progress' && (
                          <button onClick={() => updateJobStatus(j.id, 'complete')}
                            className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium">Mark Complete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              }

              {rescheduleJob && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                    <h3 className="font-bold text-np-text mb-4">Reschedule Job</h3>
                    <p className="text-sm text-gray-500 mb-4">{rescheduleJob.serviceType} — {rescheduleJob.homeownerName}</p>
                    <div className="space-y-3 mb-5">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">New Date</label>
                        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">New Time</label>
                        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={doReschedule} className="flex-1 py-2.5 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">Confirm</button>
                      <button onClick={() => setRescheduleJob(null)} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MESSAGES ── */}
          {tab === 'messages' && (
            <div className="h-full">
              <h1 className="text-xl font-bold text-np-text mb-4">Messages</h1>
              <div className="flex gap-4 h-[calc(100vh-14rem)]">
                <div className="w-64 shrink-0 bg-white rounded-2xl border border-np-border overflow-y-auto">
                  {threads.length === 0
                    ? <p className="text-sm text-gray-400 p-5">No conversations yet.</p>
                    : threads.map(t => (
                      <button key={t.threadId} onClick={() => setActiveThread(t.threadId)}
                        className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${activeThread === t.threadId ? 'bg-np-surface' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-np-lite/30 flex items-center justify-center text-sm font-bold text-np-green shrink-0">
                            {t.partnerName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-np-text truncate">{t.partnerName}</p>
                            <p className="text-xs text-gray-400 truncate">{t.msgs.at(-1)?.content}</p>
                          </div>
                          {t.unread > 0 && (
                            <span className="w-5 h-5 rounded-full bg-np-accent text-np-dark text-xs font-bold flex items-center justify-center shrink-0">{t.unread}</span>
                          )}
                        </div>
                      </button>
                    ))
                  }
                </div>

                <div className="flex-1 bg-white rounded-2xl border border-np-border flex flex-col overflow-hidden">
                  {!activeThread
                    ? <div className="flex-1 flex items-center justify-center text-gray-300 text-sm">Select a conversation</div>
                    : (
                      <>
                        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-np-text text-sm">{activeThreadData?.partnerName}</div>
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                          {activeThreadData?.msgs.map(m => (
                            <div key={m.id} className={`flex ${m.fromId === email ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.fromId === email ? 'bg-np-green text-white rounded-br-sm' : 'bg-gray-100 text-np-text rounded-bl-sm'}`}>
                                <p>{m.content}</p>
                                <p className={`text-xs mt-1 ${m.fromId === email ? 'text-white/60' : 'text-gray-400'}`}>
                                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                          <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message…"
                            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
                          <button onClick={sendMessage} className="px-4 py-2 bg-np-green text-white rounded-xl text-sm font-medium hover:bg-np-mid transition-colors">Send</button>
                        </div>
                      </>
                    )
                  }
                </div>
              </div>
            </div>
          )}

          {/* ── AVAILABILITY ── */}
          {tab === 'availability' && avail && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-xl font-bold text-np-text">Availability Settings</h1>

              <div className="bg-white rounded-2xl border border-np-border p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-np-text text-sm">Accepting New Quote Requests</p>
                  <p className="text-xs text-gray-400 mt-0.5">Turn off to pause incoming requests temporarily</p>
                </div>
                <button onClick={toggleAccepting}
                  className={`w-12 h-6 rounded-full transition-colors relative ${avail.acceptingRequests ? 'bg-np-green' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${avail.acceptingRequests ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-4">
                <p className="font-semibold text-np-text text-sm">Job Limits</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Jobs / Day</label>
                    <input type="number" value={avail.maxJobsPerDay} min={1} max={20}
                      onChange={e => { const u = { ...avail, maxJobsPerDay: parseInt(e.target.value) }; setAvail(u); dbSaveAvailability(email, u); }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Max Jobs / Week</label>
                    <input type="number" value={avail.maxJobsPerWeek} min={1} max={100}
                      onChange={e => { const u = { ...avail, maxJobsPerWeek: parseInt(e.target.value) }; setAvail(u); dbSaveAvailability(email, u); }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-3">
                <p className="font-semibold text-np-text text-sm mb-1">Weekly Availability</p>
                {DAYS.map(day => {
                  const w = avail.weeklyWindows?.[day] || { enabled: false, start: '08:00', end: '17:00' };
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <button onClick={() => toggleAvailDay(day)}
                        className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${w.enabled ? 'bg-np-green' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${w.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                      <span className={`text-sm w-24 font-medium ${w.enabled ? 'text-np-text' : 'text-gray-300'}`}>{day}</span>
                      {w.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <input type="time" value={w.start} onChange={e => updateAvailWindow(day, 'start', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                          <span className="text-xs text-gray-400">to</span>
                          <input type="time" value={w.end} onChange={e => updateAvailWindow(day, 'end', e.target.value)}
                            className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl border border-np-border p-5 space-y-3">
                <p className="font-semibold text-np-text text-sm">Blocked Dates</p>
                <div className="flex gap-2">
                  <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-np-green" />
                  <button onClick={addBlockDate} className="px-4 py-2 bg-np-green text-white rounded-lg text-sm font-medium hover:bg-np-mid transition-colors">Block</button>
                </div>
                {(avail.blockedDates || []).length === 0
                  ? <p className="text-xs text-gray-400">No dates blocked.</p>
                  : (
                    <div className="flex flex-wrap gap-2">
                      {avail.blockedDates.map(d => (
                        <span key={d} className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-full">
                          {d}
                          <button onClick={() => removeBlockDate(d)} className="font-bold text-red-400 hover:text-red-600">×</button>
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ── helper components ── */
function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
function Metric({ label, value, hint }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-xl font-bold text-np-text">{value}</p>
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  );
}
function PField({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-np-green focus:ring-2 focus:ring-green-100 transition-all" />
    </div>
  );
}
function BlankSlate({ icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-np-border py-12 text-center text-gray-300">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
