import { useState } from 'react';
import { buildGoogleMapsUrls, exportAgentCSV } from '../utils/routeExport';

const TYPE_ICONS = {
  homeowner: '🏠',
  new_construction: '🏗',
  renter: '🏘',
  multi_family: '🏢',
  commercial: '🏪',
  vacant: '📭',
};

function typeIcon(type) {
  return TYPE_ICONS[type] ?? '📍';
}

function AgentCard({ route, planDate, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const firstUrl = route.google_maps_urls?.[0];

  return (
    <div className="route-agent-card">
      {/* Agent header */}
      <button
        type="button"
        className="route-agent-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="route-agent-name">{route.agent_name}</span>
        <span className="route-agent-meta">
          {route.total_stops} stops · {route.total_miles?.toFixed(1)} mi · ~{route.est_hours}h
        </span>
        <span className="route-agent-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="route-agent-body">
          {/* Quick actions */}
          <div className="route-agent-actions">
            {firstUrl && (
              <a
                href={firstUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary"
              >
                Open in Google Maps
              </a>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => exportAgentCSV(route, planDate)}
            >
              Download CSV
            </button>
          </div>

          {/* Clusters */}
          {route.clusters.map(cluster => (
            <div key={cluster.id} className="route-cluster-block">
              <div className="route-cluster-header">
                <span className="route-cluster-label">Cluster {cluster.id}</span>
                <span className="route-cluster-size">{cluster.size} stops</span>
              </div>
              <ol className="route-stop-list">
                {cluster.stops.map(stop => (
                  <li key={stop.unique_id} className="route-stop-item">
                    <span className="route-stop-num">{stop.stop_order}</span>
                    <span className="route-stop-icon">{typeIcon(stop.address_type)}</span>
                    <span className="route-stop-address">
                      {stop.address}, {stop.city} {stop.zip}
                    </span>
                    <a
                      href={`https://maps.google.com/maps?q=${stop.lat},${stop.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="route-stop-nav"
                      aria-label="Navigate"
                    >
                      ↗
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UnassignedSection({ stops }) {
  const [open, setOpen] = useState(false);
  if (!stops || stops.length === 0) return null;
  return (
    <div className="route-agent-card route-agent-card--unassigned">
      <button
        type="button"
        className="route-agent-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="route-agent-name">Unassigned Addresses</span>
        <span className="route-agent-meta">{stops.length} addresses could not be assigned</span>
        <span className="route-agent-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="route-agent-body">
          <ol className="route-stop-list">
            {stops.map((stop, i) => (
              <li key={stop.unique_id ?? i} className="route-stop-item">
                <span className="route-stop-icon">{typeIcon(stop.address_type)}</span>
                <span className="route-stop-address">
                  {stop.address}, {stop.city}, {stop.state} {stop.zip}
                </span>
                <span className="route-stop-type">{stop.address_type}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Per-agent accordion list view.
 * Props: result (edge function response), planDate (YYYY-MM-DD)
 */
export default function RouteListView({ result, planDate }) {
  if (!result || !result.routes || result.routes.length === 0) {
    return <p className="route-empty-msg">No routes generated yet.</p>;
  }

  return (
    <div className="route-list-view">
      {result.routes.map((route, i) => (
        <AgentCard
          key={route.agent_id ?? i}
          route={route}
          planDate={planDate}
          defaultOpen={i === 0}
        />
      ))}
      <UnassignedSection stops={result.unassigned} />
    </div>
  );
}
