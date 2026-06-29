import { CRITERIA } from '../config/criteria';

function uniqueOptions(features, field) {
  return [...new Set(features.map((feature) => feature.properties?.[field]).filter(Boolean))].sort();
}

export function FilterPanel({ activeCriterion, features, filters, onCriterionChange, onFilterAction }) {
  const districts = uniqueOptions(features, 'layer');
  const types = uniqueOptions(features, 'Site_typ');
  const voltages = uniqueOptions(features, 'Volt_Class');
  const floods = uniqueOptions(features, 'Flood_Zone');
  const activeRange = filters.criterionRanges[activeCriterion] || [0, 1];
  const hasActiveCriterion = Boolean(activeCriterion);

  return (
    <section className="map-card">
      <div className="map-card__header">
        <span className="site-eyebrow">Explore by one criterion</span>
        <h2>Filters</h2>
      </div>
      <label className="filter-field">
        Color criterion
        <select value={activeCriterion} onChange={(event) => onCriterionChange(event.target.value)}>
          <option value="">Layer colors</option>
          {CRITERIA.map((criterion) => (
            <option key={criterion.key} value={criterion.key}>
              {criterion.label}
            </option>
          ))}
        </select>
      </label>
      {hasActiveCriterion ? (
        <>
          <div className="range-row">
            <span>Active score range</span>
            <strong>
              {activeRange[0].toFixed(2)} - {activeRange[1].toFixed(2)}
            </strong>
          </div>
          <input
            className="score-slider"
            max="1"
            min="0"
            step="0.05"
            type="range"
            value={activeRange[0]}
            onChange={(event) =>
              onFilterAction({ type: 'criterionRange', key: activeCriterion, range: [Number(event.target.value), activeRange[1]] })
            }
            aria-label="Minimum active criterion score"
          />
          <input
            className="score-slider"
            max="1"
            min="0"
            step="0.05"
            type="range"
            value={activeRange[1]}
            onChange={(event) =>
              onFilterAction({ type: 'criterionRange', key: activeCriterion, range: [activeRange[0], Number(event.target.value)] })
            }
            aria-label="Maximum active criterion score"
          />
        </>
      ) : (
        <p className="legend-note">Default layer colors are shown. Choose a criterion to apply a 0-1 suitability gradient.</p>
      )}
      <div className="filter-grid">
        <SelectFilter field="district" label="District" options={districts} value={filters.district} onFilterAction={onFilterAction} />
        <SelectFilter field="type" label="Site type" options={types} value={filters.type} onFilterAction={onFilterAction} />
        <SelectFilter field="voltage" label="Voltage" options={voltages} value={filters.voltage} onFilterAction={onFilterAction} />
        <SelectFilter field="flood" label="Flood zone" options={floods} value={filters.flood} onFilterAction={onFilterAction} />
      </div>
      <button className="ui-button ui-button--ghost" onClick={() => onFilterAction({ type: 'reset' })} type="button">
        Reset filters
      </button>
    </section>
  );
}

function SelectFilter({ field, label, options, value, onFilterAction }) {
  return (
    <label className="filter-field">
      {label}
      <select value={value} onChange={(event) => onFilterAction({ type: 'field', field, value: event.target.value })}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
