import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { supabase } from '../../../lib/supabase';
import { filterPointsInCircle, filterPointsInPolygon } from '../../../utils/geoFilter';
import ConstraintPanel, { DEFAULT_CONSTRAINTS } from '../../../components/ConstraintPanel';
import { exportAgentCSV, buildGoogleMapsUrls } from '../../../utils/routeExport';

const RouteMap = lazy(() => import('../../../components/RouteMap'));

const DNK_TYPE = 'do_not_knock';

export default function DrawRouteTab({ session }) {
  const today = new Date().toISOString().slice(0, 10);

  const [addresses, setAddresses]     = useState([]);  // all branch addresses for today's plan
  const [agents, setAgents]           = useState([]);
  const [shape, setShape]             = useState(null);     // { type:'polygon'|'circle', ring|center, radiusM }
  const [filtered, setFiltered]       = useState([]);       // addresses inside shape
  const [selectedAgent, setAgent]     = useState('');
  const [constraints, setConstraints] = useState(DEFAULT_CONSTRAINTS);
  const [showConstraints, setShowCon] = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [result, setResult]           = useState(null);
  const [saveStatus, setSaveStatus]   = useState('idle'); // idle|saving|saved|error
  const [conflict, setConflict]       = useState(null);   // 'replace'|'merge' prompt
  const [error, setError]             = useState('');

  useEffect(() => {
    // Load active agents for this branch
    supabase.from('agents').select('*').eq('branch_id', session.branchId).eq('active', true)
      .then(({ data }) => { setAgents(data ?? []); if (data?.length) setAgent(data[0].id); });

    // Load unassigned addresses from today's plan (if any)
    supabase.from('route_plans')
      .select('id')
      .eq('branch_id', session.branchId)
      .eq('plan_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(async ({ data: plans }) => {
        if (!plans?.length) return;
        const { data: addrs } = await supabase
          .from('route_addresses')
          .select('id,address,city,state,zip,address_type,lat,lng,status,assignment_id')
          .eq('plan_id', plans[0].id)
          .neq('address_type', DNK_TYPE);
        setAddresses(addrs ?? []);
      });
  }, [session.branchId]);

  // Re-filter whenever shape or addresses change
  useEffect(() => {
    if (!shape) { setFiltered([]); return; }
    const eligible = addresses.filter(a => a.lat != null && a.address_type !== DNK_TYPE);
    const inShape = shape.type === 'circle'
      ? filterPointsInCircle(eligible, shape.center, shape.radiusM)
      : filterPointsInPolygon(eligible, shape.ring);
    setFiltered(inShape);
  }, [shape, addresses]);

  const handleShapeComplete = (shapeData) => {
    setShape(shapeData);
    setResult(null);
    setError('');
  };

  const generate = async () => {
    if (!filtered.length) { setError('No addresses inside the selected area.'); return; }
    if (!selectedAgent)   { setError('Select an agent first.'); return; }
    setGenerating(true); setError('');

    const agent = agents.find(a => a.id === selectedAgent);
    const { data, error: fnErr } = await supabase.functions.invoke('route-optimize', {
      body: {
        addresses: filtered.map(a => ({
          unique_id:    a.id,
          address:      a.address,
          city:         a.city ?? '',
          state:        a.state ?? '',
          zip:          a.zip ?? '',
          address_type: a.address_type,
          lat:          a.lat,
          lng:          a.lng,
        })),
        agents: [{
          id:            agent.id,
          name:          agent.name,
          start_address: agent.start_address ?? '',
          start_lat:     agent.start_lat,
          start_lng:     agent.start_lng,
        }],
        constraints,
        plan_id: 'draw-route-preview',
      },
    });

    setGenerating(false);
    if (fnErr || data?.error) { setError(fnErr?.message ?? data?.error ?? 'Generation failed'); return; }
    setResult(data);
  };

  const saveRoute = async (mode) => {
    if (!result?.routes?.[0]) return;
    setSaveStatus('saving'); setConflict(null);

    const route = result.routes[0];

    // Get or create today's plan
    let planId;
    const { data: existing } = await supabase
      .from('route_plans')
      .select('id')
      .eq('branch_id', session.branchId)
      .eq('plan_date', today)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing?.length) {
      planId = existing[0].id;
    } else {
      const { data: newPlan } = await supabase
        .from('route_plans')
        .insert({ plan_date: today, constraints, branch_id: session.branchId, created_by: session.username })
        .select('id').single();
      planId = newPlan.id;
    }

    // Check for existing assignment for this agent today
    const { data: existingAssign } = await supabase
      .from('route_assignments')
      .select('id, stop_sequence, total_stops')
      .eq('plan_id', planId)
      .eq('agent_id', selectedAgent)
      .single();

    if (existingAssign && !conflict) {
      setConflict(existingAssign); setSaveStatus('idle'); return;
    }

    let stopSeq  = route.stop_sequence;
    let assignId = existingAssign?.id;

    if (existingAssign && conflict === 'merge') {
      // Append new stops and re-number
      const existing = existingAssign.stop_sequence ?? [];
      stopSeq = [
        ...existing,
        ...route.stop_sequence.map((s, i) => ({ ...s, stop_order: existing.length + i + 1 })),
      ];
    }

    const payload = {
      plan_id:          planId,
      agent_id:         selectedAgent,
      agent_name:       agents.find(a => a.id === selectedAgent)?.name ?? '',
      stop_sequence:    stopSeq,
      cluster_sequence: route.clusters,
      total_stops:      stopSeq.length,
      total_miles:      route.total_miles,
      est_hours:        route.est_hours,
      google_maps_urls: buildGoogleMapsUrls(stopSeq),
      branch_id:        session.branchId,
    };

    if (existingAssign && conflict === 'replace') {
      await supabase.from('route_assignments').update(payload).eq('id', existingAssign.id);
    } else if (existingAssign && conflict === 'merge') {
      await supabase.from('route_assignments').update(payload).eq('id', existingAssign.id);
    } else {
      const { data: newAssign } = await supabase
        .from('route_assignments').insert(payload).select('id').single();
      assignId = newAssign.id;
    }

    // Mark addresses as assigned
    const addrIds = filtered.map(a => a.id);
    await supabase.from('route_addresses')
      .update({ status: 'assigned', assignment_id: assignId })
      .in('id', addrIds);

    setSaveStatus('saved');
  };

  const agentName = agents.find(a => a.id === selectedAgent)?.name ?? '';
  const dnkCount  = shape ? addresses.filter(a => a.address_type === DNK_TYPE && filtered.some(f => f.id === a.id)).length : 0;
  const byType    = filtered.reduce((acc, a) => { acc[a.address_type] = (acc[a.address_type] ?? 0) + 1; return acc; }, {});

  return (
    <div className="flex h-full">
      {/* Map pane */}
      <div className="flex-1 relative">
        {addresses.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-50/80 pointer-events-none">
            <div className="text-center text-gray-500">
              <p className="font-medium">No address pool loaded for today</p>
              <p className="text-sm mt-1">Ask admin to run today's route plan first, or upload addresses.</p>
            </div>
          </div>
        )}
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading map…</div>}>
          <RouteMap
            result={result}
            drawMode
            allAddresses={addresses}
            shapeAddresses={filtered}
            onShapeComplete={handleShapeComplete}
          />
        </Suspense>
      </div>

      {/* Side panel */}
      <div className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Draw Route</h3>
          <p className="text-xs text-gray-500 mt-0.5">Draw a polygon or circle on the map to select addresses.</p>
        </div>

        {/* Shape summary */}
        {shape && (
          <div className="p-4 border-b border-gray-100">
            <div className="text-2xl font-bold text-green-700">{filtered.length}</div>
            <div className="text-xs text-gray-500 mb-2">addresses in selection</div>
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="flex justify-between text-xs text-gray-600 py-0.5">
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
            {dnkCount > 0 && (
              <p className="text-xs text-amber-600 mt-2">⚠ {dnkCount} Do Not Knock excluded</p>
            )}
          </div>
        )}

        {/* Agent picker */}
        <div className="p-4 border-b border-gray-100">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Assign to Agent</label>
          <select
            value={selectedAgent}
            onChange={e => setAgent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Constraints (collapsible) */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => setShowCon(v => !v)}
            className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <span>Constraint overrides</span>
            <span>{showConstraints ? '▲' : '▼'}</span>
          </button>
          {showConstraints && (
            <div className="px-4 pb-4">
              <ConstraintPanel constraints={constraints} onChange={setConstraints} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2 mt-auto">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            onClick={generate}
            disabled={generating || !shape || filtered.length === 0}
            className="w-full bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-800 disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating…' : 'Generate Route'}
          </button>

          {result && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-800">
                ✓ {result.routes[0]?.total_stops} stops · {result.routes[0]?.total_miles?.toFixed(1)} mi · ~{result.routes[0]?.est_hours}h
              </div>

              <button
                onClick={() => exportAgentCSV(result.routes[0], result.routes[0]?.stop_sequence ?? [], today)}
                className="w-full border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Export CSV
              </button>

              {result.routes[0]?.google_maps_urls?.[0] && (
                <a
                  href={result.routes[0].google_maps_urls[0]}
                  target="_blank" rel="noreferrer"
                  className="block w-full border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 text-center transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              )}

              {saveStatus === 'saved'
                ? <div className="text-center text-sm text-green-700 font-semibold py-2">✓ Route saved to today's plan</div>
                : (
                  <button
                    onClick={() => saveRoute()}
                    disabled={saveStatus === 'saving'}
                    className="w-full bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {saveStatus === 'saving' ? 'Saving…' : 'Save to Today\'s Plan'}
                  </button>
                )
              }
            </>
          )}
        </div>
      </div>

      {/* Replace / Merge conflict modal */}
      {conflict && typeof conflict === 'object' && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">Agent already has a route today</h3>
            <p className="text-sm text-gray-600 mb-5">
              <strong>{agentName}</strong> already has {conflict.total_stops} stops assigned today.
              Do you want to replace their existing route or add these new stops to it?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConflict(null)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => { setConflict('merge');   saveRoute('merge');   }} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700">
                Merge
              </button>
              <button onClick={() => { setConflict('replace'); saveRoute('replace'); }} className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700">
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
