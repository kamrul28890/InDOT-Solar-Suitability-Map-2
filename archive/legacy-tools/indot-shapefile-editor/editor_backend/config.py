from __future__ import annotations

import os
from pathlib import Path


ROOT = Path(os.environ.get("INDOT_EDITOR_ROOT", Path(__file__).resolve().parents[1])).resolve()
SESSIONS_DIR = ROOT / "sessions"
OUTPUTS_DIR = ROOT / "outputs"

PROJECT = {
    "name": "INDOT Solar Suitability Map",
    "default_crs": "EPSG:4326",
}

DATASETS = {
    "all_candidate_sites": {
        "title": "All Candidate Sites",
        "source_stem": "All_Candidate_Sites_Final",
        "output": "all_candidate_sites.geojson",
        "layer_type": "candidate",
    },
    "facility_scored": {
        "title": "Scored INDOT Facilities",
        "source_stem": "solar_potential_scored_indotfacility",
        "output": "facility_scored.geojson",
        "layer_type": "facility",
    },
    "row_scored": {
        "title": "Scored Right-of-Way Parcels",
        "source_stem": "solar_potential_scored_interchange",
        "output": "row_scored.geojson",
        "layer_type": "row",
    },
}

IDENTITY_FIELDS = ["SPR_ID", "Site_typ", "Unit_Site", "layer"]
DISPLAY_FIELDS = [
    "SPR_ID",
    "Site_typ",
    "Unit_Site",
    "layer",
    "Volt_Class",
    "Flood_Zone",
    "SlopeMean",
    "Solar_Mean",
    "NTran_DIST",
    "Shape_Area",
]
SCORE_FIELDS = ["sol_s", "slp_s", "trn_s", "evp_s", "dem_s", "fld_s", "lc_s"]
LAND_COVER_FIELDS = [
    "DevOpe_21",
    "DevLowI_22",
    "DDevMed_23",
    "DDevHig_24",
    "DecFor_41",
    "GrasHe_71",
    "OpenW_11",
    "EverFor_42",
    "MixFor_43",
    "SShrub_52",
    "PasHay_81",
    "CultCr_82",
    "welan_90",
    "EmerW_95",
    "Barre_31",
]
DERIVED_FIELDS = [
    "center_longitude",
    "center_latitude",
    "source_latitude",
    "source_longitude",
    "land_cover_sum",
    "dataset",
    "layer_title",
    "layer_type",
    "source_geometry_valid",
]

REQUIRED_SHAPEFILE_EXTENSIONS = {".shp", ".dbf", ".shx", ".prj"}
