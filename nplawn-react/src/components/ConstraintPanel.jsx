import { useState, useRef } from 'react';

const DEFAULT_PRIORITY = [
  'homeowner',
  'new_construction',
  'renter',
  'multi_family',
  'commercial',
  'vacant',
];

export const DEFAULT_CONSTRAINTS = {
  max_stops: 100,
  max_miles: 25,
  excluded_zips: [],
  priority_order: DEFAULT_PRIORITY,
  cluster_radius_m: 400,
  min_cluster_size: 5,
};

/**
 * Stateless constraint controls panel.
 * Props: constraints (object), onChange(updatedConstraints) callback.
 */
export default function ConstraintPanel({ constraints, onChange }) {
  const [zipInput, setZipInput] = useState('');
  const dragSrc = useRef(null);

  const update = (key, value) => onChange({ ...constraints, [key]: value });

  // ── ZIP chip handlers ──────────────────────────────────────────────────────

  const addZip = () => {
    const z = zipInput.trim();
    if (/^\d{5}$/.test(z) && !constraints.excluded_zips.includes(z)) {
      update('excluded_zips', [...constraints.excluded_zips, z]);
    }
    setZipInput('');
  };

  const removeZip = (zip) =>
    update('excluded_zips', constraints.excluded_zips.filter(z => z !== zip));

  const handleZipKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addZip(); }
  };

  // ── Priority drag-to-reorder ───────────────────────────────────────────────

  const handleDragStart = (e, idx) => {
    dragSrc.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (dragSrc.current === null || dragSrc.current === idx) return;
    const newOrder = [...constraints.priority_order];
    const [moved] = newOrder.splice(dragSrc.current, 1);
    newOrder.splice(idx, 0, moved);
    dragSrc.current = idx;
    update('priority_order', newOrder);
  };

  const handleDragEnd = () => { dragSrc.current = null; };

  return (
    <div className="constraint-panel">
      {/* Max stops */}
      <div className="constraint-row">
        <label className="constraint-label">
          Max stops / agent
          <span className="constraint-value">{constraints.max_stops}</span>
        </label>
        <div className="constraint-slider-group">
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={constraints.max_stops}
            onChange={e => update('max_stops', Number(e.target.value))}
            className="constraint-slider"
          />
          <input
            type="number"
            min={10}
            max={200}
            value={constraints.max_stops}
            onChange={e => update('max_stops', Number(e.target.value))}
            className="constraint-number"
          />
        </div>
      </div>

      {/* Max miles */}
      <div className="constraint-row">
        <label className="constraint-label">
          Max miles / agent
          <span className="constraint-value">{constraints.max_miles}</span>
        </label>
        <div className="constraint-slider-group">
          <input
            type="range"
            min={5}
            max={100}
            step={1}
            value={constraints.max_miles}
            onChange={e => update('max_miles', Number(e.target.value))}
            className="constraint-slider"
          />
          <input
            type="number"
            min={5}
            max={100}
            value={constraints.max_miles}
            onChange={e => update('max_miles', Number(e.target.value))}
            className="constraint-number"
          />
        </div>
      </div>

      {/* Cluster radius */}
      <div className="constraint-row">
        <label className="constraint-label">
          Cluster radius (m)
          <span className="constraint-value">{constraints.cluster_radius_m}</span>
        </label>
        <div className="constraint-slider-group">
          <input
            type="range"
            min={100}
            max={1000}
            step={50}
            value={constraints.cluster_radius_m}
            onChange={e => update('cluster_radius_m', Number(e.target.value))}
            className="constraint-slider"
          />
          <input
            type="number"
            min={100}
            max={1000}
            value={constraints.cluster_radius_m}
            onChange={e => update('cluster_radius_m', Number(e.target.value))}
            className="constraint-number"
          />
        </div>
      </div>

      {/* Excluded ZIPs */}
      <div className="constraint-row constraint-row--column">
        <label className="constraint-label">Exclude ZIP codes</label>
        <div className="zip-chip-area">
          {constraints.excluded_zips.map(z => (
            <span key={z} className="zip-chip">
              {z}
              <button
                type="button"
                onClick={() => removeZip(z)}
                className="zip-chip-remove"
                aria-label={`Remove ${z}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Enter 5-digit ZIP…"
            value={zipInput}
            onChange={e => setZipInput(e.target.value)}
            onKeyDown={handleZipKey}
            onBlur={addZip}
            maxLength={5}
            className="zip-chip-input"
          />
        </div>
      </div>

      {/* Address type priority */}
      <div className="constraint-row constraint-row--column">
        <label className="constraint-label">
          Address type priority
          <span className="constraint-hint">(drag to reorder — top = highest priority)</span>
        </label>
        <ul className="priority-list">
          {constraints.priority_order.map((type, idx) => (
            <li
              key={type}
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className="priority-item"
            >
              <span className="priority-handle">⠿</span>
              <span className="priority-rank">{idx + 1}</span>
              <span className="priority-type">{type.replace(/_/g, ' ')}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
