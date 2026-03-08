import { useState } from 'react';
import { Link } from 'react-router-dom';

const SERVICE_CATEGORIES = [
  'All Services', 'Lawn Mowing', 'Hedge Trimming', 'Leaf Removal',
  'Aeration & Seeding', 'Mulching', 'Snow Removal', 'Landscaping Design',
  'Irrigation', 'Stump Grinding', 'Brush Clearing', 'Sod Installation',
];

// Demo provider cards — in production these would come from a Supabase query
const DEMO_PROVIDERS = [
  { id: 1, name: 'Green Thumb Pro', services: ['Lawn Mowing', 'Hedge Trimming', 'Leaf Removal'], rating: 4.9, reviews: 127, city: 'Chicago, IL', badge: 'Top Rated' },
  { id: 2, name: 'Lawn Masters LLC', services: ['Aeration & Seeding', 'Mulching', 'Lawn Mowing'], rating: 4.7, reviews: 84, city: 'Naperville, IL', badge: 'Licensed & Insured' },
  { id: 3, name: 'Elite Outdoor Services', services: ['Landscaping Design', 'Sod Installation', 'Irrigation'], rating: 4.8, reviews: 56, city: 'Evanston, IL', badge: null },
  { id: 4, name: 'Winter Warriors', services: ['Snow Removal', 'Brush Clearing'], rating: 4.6, reviews: 39, city: 'Aurora, IL', badge: 'Fast Response' },
  { id: 5, name: 'TreeCare Plus', services: ['Stump Grinding', 'Brush Clearing', 'Hedge Trimming'], rating: 4.5, reviews: 62, city: 'Joliet, IL', badge: null },
  { id: 6, name: 'Seasonal Pros', services: ['Lawn Mowing', 'Leaf Removal', 'Snow Removal', 'Aeration & Seeding'], rating: 4.8, reviews: 103, city: 'Schaumburg, IL', badge: 'Eco-Friendly' },
];

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-yellow-400 text-sm">
      {[...Array(full)].map((_, i) => <span key={i}>★</span>)}
      {half && <span>☆</span>}
      <span className="text-gray-500 text-xs ml-1">({rating})</span>
    </span>
  );
}

export default function Discover() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All Services');

  const filtered = DEMO_PROVIDERS.filter(p => {
    const matchCat = category === 'All Services' || p.services.includes(category);
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.services.some(s => s.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/CleanLawn/homeowner" className="text-green-600 hover:text-green-700 text-sm">← Dashboard</Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">Find Providers</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Find Lawn Care Professionals</h1>
        <p className="text-gray-500 text-sm mb-6">Browse top-rated local providers and request a quote in minutes.</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city, or service…"
            className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-lg border border-gray-300 outline-none focus:border-green-500 bg-white">
            {SERVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Provider cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No providers match your search. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.city}</div>
                  </div>
                  {p.badge && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">{p.badge}</span>
                  )}
                </div>

                <Stars rating={p.rating} />
                <p className="text-xs text-gray-500">{p.reviews} reviews</p>

                <div className="flex flex-wrap gap-1">
                  {p.services.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>

                <Link to="/CleanLawn/homeowner/quote-request"
                  className="mt-auto block text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                  Request Quote
                </Link>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Provider listings are representative. Real-time availability and ratings pull from your Supabase database.
        </p>
      </div>
    </div>
  );
}
