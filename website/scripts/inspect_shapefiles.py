from __future__ import annotations

"""Generate a reproducible Markdown inventory of local source shapefiles."""

from pathlib import Path

import geopandas as gpd


ROOT = Path(__file__).resolve().parents[1]
DATASETS = {
    "all_candidate_sites": ROOT / "All_Candidate_Sites" / "All_Candidate_Sites_Final.shp",
    "facility_scored": ROOT / "Facility_Scored" / "solar_potential_scored_indotfacility.shp",
    "row_scored": ROOT / "ROW_Scored" / "solar_potential_scored_interchange.shp",
}
REPORT_PATH = ROOT / "docs" / "data_inventory.md"


def summarize_dataset(name: str, path: Path) -> str:
    """Summarize spatial metadata and attribute completeness for one dataset."""

    if not path.exists():
        return f"## {name}\n\nMissing file: `{path.relative_to(ROOT)}`\n"

    gdf = gpd.read_file(path)
    bounds = gdf.total_bounds
    geometry_types = ", ".join(sorted(gdf.geometry.geom_type.dropna().unique()))

    lines = [
        f"## {name}",
        "",
        f"- Source: `{path.relative_to(ROOT)}`",
        f"- Records: {len(gdf):,}",
        f"- CRS: `{gdf.crs}`",
        f"- Geometry types: {geometry_types or 'None'}",
        f"- Bounds: {bounds.tolist()}",
        "",
        "### Fields",
        "",
        "| Field | Type | Non-null | Example |",
        "|-------|------|----------|---------|",
    ]

    for column in gdf.columns:
        # Geometry is described above; the table is limited to DBF attributes.
        if column == gdf.geometry.name:
            continue
        series = gdf[column]
        examples = series.dropna().astype(str).head(3).tolist()
        example = "; ".join(examples).replace("|", "\\|")
        lines.append(
            f"| `{column}` | `{series.dtype}` | {series.notna().sum():,} | {example} |"
        )

    lines.append("")
    return "\n".join(lines)


def main() -> None:
    """Inspect all configured datasets and replace the generated inventory."""

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    sections = [
        "# Data Inventory",
        "",
        "This report is generated from the local shapefiles used by the SPR 4862 implementation.",
        "",
    ]
    for name, path in DATASETS.items():
        sections.append(summarize_dataset(name, path))

    REPORT_PATH.write_text("\n".join(sections), encoding="utf-8")
    print(f"Wrote {REPORT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
