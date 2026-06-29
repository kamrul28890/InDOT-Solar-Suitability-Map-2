import { useMemo, useState } from 'react';

import { CRITERIA } from '../config/criteria';
import { featureKey, siteLabel } from '../utils/features';
import { formatNumber } from '../utils/format';

function sortValue(feature, column) {
  const p = feature.properties || {};
  if (column === 'name') return siteLabel(feature).toLowerCase();
  if (column === 'area') return Number(p.Shape_Area) || 0;
  return p[column] ?? '';
}

export function CriterionTable({ features, layerConfigByName, onSelectSite }) {
  const [sort, setSort] = useState({ column: 'name', direction: 'asc' });
  const sorted = useMemo(() => {
    return [...features].sort((a, b) => {
      const av = sortValue(a, sort.column);
      const bv = sortValue(b, sort.column);
      const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.direction === 'asc' ? result : -result;
    });
  }, [features, sort]);

  function toggleSort(column) {
    setSort((current) => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  return (
    <section className="criterion-table-wrap" aria-label="Filtered sites table">
      <table className="criterion-table">
        <thead>
          <tr>
            <SortableTh column="name" sort={sort} toggleSort={toggleSort}>
              Name
            </SortableTh>
            <SortableTh column="layer" sort={sort} toggleSort={toggleSort}>
              District
            </SortableTh>
            <SortableTh column="Site_typ" sort={sort} toggleSort={toggleSort}>
              Type
            </SortableTh>
            {CRITERIA.map((criterion) => (
              <SortableTh key={criterion.key} column={criterion.key} sort={sort} toggleSort={toggleSort}>
                {criterion.short}
              </SortableTh>
            ))}
            <SortableTh column="area" sort={sort} toggleSort={toggleSort}>
              Area
            </SortableTh>
          </tr>
        </thead>
        <tbody>
          {sorted.map((feature, index) => {
            const layerConfig = layerConfigByName[feature.properties.dataset] || {};
            const key = featureKey(feature, index, layerConfig);
            return (
              <tr key={key} onClick={() => onSelectSite(feature, key)} tabIndex="0">
                <td>{siteLabel(feature, layerConfig)}</td>
                <td>{feature.properties.layer || 'n/a'}</td>
                <td>{feature.properties.Site_typ || 'n/a'}</td>
                {CRITERIA.map((criterion) => (
                  <td key={criterion.key}>{formatNumber(feature.properties[criterion.key], 2)}</td>
                ))}
                <td>{formatNumber(feature.properties.Shape_Area, 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function SortableTh({ children, column, sort, toggleSort }) {
  return (
    <th>
      <button onClick={() => toggleSort(column)} type="button">
        {children}
        {sort.column === column ? ` ${sort.direction === 'asc' ? 'up' : 'down'}` : ''}
      </button>
    </th>
  );
}
