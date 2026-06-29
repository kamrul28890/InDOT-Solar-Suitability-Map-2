"""Compare SPR_ID coverage and overlap across processed map layers."""

import json
from pathlib import Path

files = {
    'all': Path(r'd:/My Projects/InDOT/data/processed/all_candidate_sites.geojson'),
    'facility': Path(r'd:/My Projects/InDOT/data/processed/facility_scored.geojson'),
    'row': Path(r'd:/My Projects/InDOT/data/processed/row_scored.geojson'),
}

def load_ids(path):
    """Load normalized identifiers while preserving nonnumeric source values."""

    data = json.loads(path.read_text(encoding='utf-8'))
    ids = set()
    for feat in data.get('features', []):
        props = feat.get('properties', {})
        val = props.get('SPR_ID')
        if val is None:
            continue
        try:
            # Shapefile numeric identifiers often serialize as floating-point
            # values; normalize integral forms before set comparison.
            ids.add(int(float(val)))
        except Exception:
            ids.add(val)
    return ids

all_ids = load_ids(files['all'])
fac_ids = load_ids(files['facility'])
row_ids = load_ids(files['row'])

out = {
    'counts': {
        'all_candidate_sites': len(all_ids),
        'facility_scored': len(fac_ids),
        'row_scored': len(row_ids),
    },
    'intersections': {
        'all_and_facility': sorted(list(all_ids & fac_ids)),
        'all_and_row': sorted(list(all_ids & row_ids)),
        'facility_and_row': sorted(list(fac_ids & row_ids)),
    }
}

print(json.dumps(out, indent=2))
