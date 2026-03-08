import { useState, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GROUPS = [
  {
    label: 'Cuts & Trims',
    links: [
      { to: '/CleanLawn/mowing',        label: 'Lawn Mowing' },
      { to: '/CleanLawn/tree-trimming', label: 'Tree Trimming & Pruning' },
      { to: '/CleanLawn/hedge-trimming',label: 'Hedge Trimming' },
    ],
  },
  {
    label: 'Clean & Enrich',
    links: [
      { to: '/CleanLawn/leaf-removal',     label: 'Leaf Removal & Yard Cleanup' },
      { to: '/CleanLawn/sod-installation', label: 'Sod Installation' },
      { to: '/CleanLawn/mulching',         label: 'Mulching' },
      { to: '/CleanLawn/brush-clearing',   label: 'Brush Clearing' },
      { to: '/CleanLawn/stump-grinding',   label: 'Stump Grinding / Removal' },
      { to: '/CleanLawn/snow-removal',     label: 'Snow Removal' },
    ],
  },
  {
    label: 'Design & Installation',
    links: [
      { to: '/CleanLawn/irrigation',         label: 'Irrigation System Installation & Repair' },
      { to: '/CleanLawn/landscaping-design', label: 'Landscaping & Garden Design' },
    ],
  },
];

function NavGroup({ group }) {
  const [open, setOpen] = useState(false);
  const timeout = useRef(null);
  const location = useLocation();

  const isActive = group.links.some(l => location.pathname === l.to);

  const show = () => { clearTimeout(timeout.current); setOpen(true); };
  const hide = () => { timeout.current = setTimeout(() => setOpen(false), 120); };

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className={`flex items-center gap-1 text-sm font-semibold px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'text-np-dark bg-np-accent/20'
            : 'text-np-dark/70 hover:text-np-dark hover:bg-np-surface'
        }`}
      >
        {group.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-np-border rounded-xl shadow-xl py-1.5 min-w-[240px] z-50"
          onMouseEnter={show} onMouseLeave={hide}>
          {group.links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${
                  isActive ? 'text-np-accent font-semibold bg-np-surface' : 'text-np-dark hover:bg-np-surface hover:text-np-accent'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

const HOMEOWNER_LINKS = [
  { to: '/CleanLawn/homeowner',               label: 'Dashboard' },
  { to: '/CleanLawn/homeowner/quote-request', label: 'Request Quote' },
  { to: '/CleanLawn/homeowner/quotes',        label: 'My Quotes' },
  { to: '/CleanLawn/homeowner/jobs',          label: 'My Jobs' },
  { to: '/CleanLawn/homeowner/schedule',      label: 'Recurring Plans' },
  { to: '/CleanLawn/homeowner/messages',      label: 'Messages' },
  { to: '/CleanLawn/homeowner/properties',    label: 'Properties' },
];

export default function CleanLawnNav() {
  const location = useLocation();
  const { user } = useAuth();
  if (!location.pathname.startsWith('/CleanLawn')) return null;

  const isHomeowner = location.pathname.startsWith('/CleanLawn/homeowner');

  return (
    <div className="bg-white border-b border-np-border shadow-sm">
      <div className="max-w-7xl mx-auto px-[5%] flex items-center gap-1 h-12 overflow-x-auto">
        {/* Home breadcrumb */}
        <Link
          to="/CleanLawn"
          className={`flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
            location.pathname === '/CleanLawn'
              ? 'text-np-accent'
              : 'text-np-dark/60 hover:text-np-accent'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          CleanLawn
        </Link>

        <span className="text-np-border text-lg select-none flex-shrink-0">|</span>

        {isHomeowner ? (
          /* Homeowner portal sub-nav */
          <div className="flex items-center gap-1 flex-shrink-0">
            {HOMEOWNER_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/CleanLawn/homeowner'}
                className={({ isActive }) =>
                  `text-sm font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isActive ? 'text-np-accent bg-np-surface font-semibold' : 'text-np-dark/70 hover:text-np-dark hover:bg-np-surface'
                  }`
                }>
                {l.label}
              </NavLink>
            ))}
          </div>
        ) : (
          /* Service category nav */
          <div className="flex items-center gap-1 flex-shrink-0">
            {GROUPS.map(g => <NavGroup key={g.label} group={g} />)}
            {user && (
              <Link to="/CleanLawn/homeowner"
                className="ml-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
                My Portal
              </Link>
            )}
            {!user && (
              <Link to="/login"
                className="ml-2 px-3 py-1.5 border border-green-600 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-50 transition-colors whitespace-nowrap">
                Homeowner Login
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
