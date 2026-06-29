# Shapefile Inputs and Extracted Fields

This document records what the Phase 2 editor reads from the INDOT shapefile folders, which fields are available for editing, and which fields are exported into the final static map package.

## Input Datasets

The editor imports three logical datasets. Each dataset is represented by one shapefile stem plus sidecar files.

```text
phase1_map/
  All_Candidate_Sites/
    All_Candidate_Sites_Final.shp
    All_Candidate_Sites_Final.dbf
    All_Candidate_Sites_Final.shx
    All_Candidate_Sites_Final.prj
    All_Candidate_Sites_Final.cpg
    All_Candidate_Sites_Final.sbn
    All_Candidate_Sites_Final.sbx
    All_Candidate_Sites_Final.shp.xml

  Facility_Scored/
    solar_potential_scored_indotfacility.shp
    solar_potential_scored_indotfacility.dbf
    solar_potential_scored_indotfacility.shx
    solar_potential_scored_indotfacility.prj
    solar_potential_scored_indotfacility.cpg
    solar_potential_scored_indotfacility.sbn
    solar_potential_scored_indotfacility.sbx
    solar_potential_scored_indotfacility.shp.xml

  ROW_Scored/
    solar_potential_scored_interchange.shp
    solar_potential_scored_interchange.dbf
    solar_potential_scored_interchange.shx
    solar_potential_scored_interchange.prj
    solar_potential_scored_interchange.cpg
    solar_potential_scored_interchange.sbn
    solar_potential_scored_interchange.sbx
    solar_potential_scored_interchange.shp.xml
```

## Sidecar File Roles

The editor requires these files for each shapefile stem:

- `.shp` stores the polygon or multipolygon geometry.
- `.dbf` stores the attribute table. These are the main fields shown in the editor.
- `.shx` stores the geometry index required by the shapefile reader.
- `.prj` stores the coordinate reference system. The current source CRS is `EPSG:26916`.

The editor also recognizes:

- `.cpg` stores text encoding information. It is useful when reading DBF text fields, but it is not currently required.

The following files may be present but are not directly extracted by the current editor:

- `.sbn` and `.sbx` are ESRI spatial index files.
- `.shp.xml` is metadata.

## Field Counts

The editor reads raw fields from the DBF table, adds internal fields during normalization, and then exports a controlled subset into the map package.

| Dataset | Records | Raw DBF attributes | Normalized non-geometry fields | Default visible/editable fields | Exported GeoJSON properties |
| --- | ---: | ---: | ---: | ---: | ---: |
| All Candidate Sites | 104 | 38 | 48 | 25 | 31 |
| Scored INDOT Facilities | 58 | 46 | 56 | 32 | 38 |
| Scored Right-of-Way Parcels | 45 | 46 | 56 | 32 | 38 |

The geometry column is separate from the attribute count. Current geometry types are `Polygon` and `MultiPolygon`.

## Raw DBF Attributes

### All Candidate Sites

`All_Candidate_Sites_Final.dbf` contains 38 raw attribute fields:

```text
Shape_Leng
Long
Lat
layer
SPR_ID
NID_CS
NDist_CS
Volt_Class
Flood_Zone
Fld_Area
Fld_ZoneYr
SlopeMean
Fld_Perc
Fore_Area
Fore_Per
land_area
DevOpe_21
DevLowI_22
DDevMed_23
DDevHig_24
DecFor_41
GrasHe_71
OpenW_11
EverFor_42
MixFor_43
SShrub_52
PasHay_81
CultCr_82
welan_90
EmerW_95
Barre_31
Site_typ
Unit_Site
Solar_Mean
NTran_FID
NTran_DIST
Shape_Le_1
Shape_Area
```

### Scored Facility and ROW Layers

`solar_potential_scored_indotfacility.dbf` and `solar_potential_scored_interchange.dbf` contain 46 raw attribute fields. They include the same fields as All Candidate Sites plus the scored fields and an additional length field:

```text
Shape_Leng
Long
Lat
layer
SPR_ID
NID_CS
NDist_CS
Volt_Class
Flood_Zone
Fld_Area
Fld_ZoneYr
SlopeMean
Fld_Perc
Fore_Area
Fore_Per
land_area
DevOpe_21
DevLowI_22
DDevMed_23
DDevHig_24
DecFor_41
GrasHe_71
OpenW_11
EverFor_42
MixFor_43
SShrub_52
PasHay_81
CultCr_82
welan_90
EmerW_95
Barre_31
Site_typ
Unit_Site
Solar_Mean
NTran_FID
NTran_DIST
Shape_Le_1
sol_s
slp_s
trn_s
evp_s
dem_s
fld_s
lc_s
Shape_Le_2
Shape_Area
```

## Fields Added by the Editor

The editor adds these fields during import and normalization:

```text
feature_id
source_geometry_valid
dataset
layer_title
layer_type
source_latitude
source_longitude
center_longitude
center_latitude
land_cover_sum
```

These fields support editing, validation, popup/map display, layer identification, and zoom-to-feature behavior. They do not come directly from the DBF table.

## Default Visible and Exported Fields

By default, the editor shows and exports the main identity, decision, score, and land-cover fields.

Default visible fields for All Candidate Sites:

```text
layer
SPR_ID
Volt_Class
Flood_Zone
SlopeMean
DevOpe_21
DevLowI_22
DDevMed_23
DDevHig_24
DecFor_41
GrasHe_71
OpenW_11
EverFor_42
MixFor_43
SShrub_52
PasHay_81
CultCr_82
welan_90
EmerW_95
Barre_31
Site_typ
Unit_Site
Solar_Mean
NTran_DIST
Shape_Area
```

Default visible fields for Scored INDOT Facilities and Scored Right-of-Way Parcels:

```text
layer
SPR_ID
Volt_Class
Flood_Zone
SlopeMean
DevOpe_21
DevLowI_22
DDevMed_23
DDevHig_24
DecFor_41
GrasHe_71
OpenW_11
EverFor_42
MixFor_43
SShrub_52
PasHay_81
CultCr_82
welan_90
EmerW_95
Barre_31
Site_typ
Unit_Site
Solar_Mean
NTran_DIST
sol_s
slp_s
trn_s
evp_s
dem_s
fld_s
lc_s
Shape_Area
```

The exported GeoJSON also includes required internal map fields:

```text
dataset
layer_title
layer_type
center_latitude
center_longitude
source_geometry_valid
```

## Fields Screen Columns

The Fields step controls how shapefile attributes are shown later in the Review/Edit table, popups, and exported map.

| Column | Meaning | Example |
| --- | --- | --- |
| Visible | Whether the field is shown to the user and included in normal review/export display. Internal derived fields stay hidden/disabled. | Checking `Solar_Mean` shows mean solar potential; unchecking `NTran_FID` keeps the nearest-transmission feature ID hidden. |
| Field Code | The technical field name from the shapefile DBF table or from the editor's derived fields. This should usually not be renamed because code depends on it. | `SPR_ID`, `Site_typ`, `Solar_Mean`, `NTran_DIST`, `sol_s` |
| Display Label | The user-facing label shown in the editor/map. This can be rewritten to make technical field names readable. | `Solar_Mean` can display as `Mean Solar Potential`; `NTran_DIST` can display as `Nearest Transmission Distance`. |
| Type | The editor's interpretation of the value for validation and editing. | `text`, `numeric`, `score`, `boolean`, `required_identity`, `derived` |
| Order | Display order. Lower numbers appear earlier in the Review/Edit table and exported field order. | Put `SPR_ID` before `Solar_Mean` by giving `SPR_ID` a lower order number. |

Example:

| Visible | Field Code | Display Label | Type | Order |
| --- | --- | --- | --- | ---: |
| checked | `Solar_Mean` | `Mean Solar Potential` | `numeric` | 23 |

This means the editor shows `Solar_Mean`, labels it as `Mean Solar Potential`, treats it as a number, and places it around position 23 in the field order.

## Review/Edit Field Meanings

The meanings below are practical interpretations based on the field names and observed values in the current shapefiles. They should be confirmed against official INDOT/GIS metadata before being treated as final domain definitions.

### Identity and Location Fields

| Field | Practical meaning | Observed classes or range | Notes |
| --- | --- | --- | --- |
| `feature_id` | Editor-generated row identifier for a feature inside one imported layer. | `0000` through layer-specific maximum, e.g. `0103` for 104 candidate sites. | Added by the editor; not from the DBF. Used for edits, undo, and validation. |
| `layer` | INDOT district or grouping name. | `CRAWFORDSVILLE`, `FORT WAYNE`, `GREENFIELD`, `LA PORTE`, `SEYMOUR`, `VINCENNES` | Displayed as District in the map UI. |
| `SPR_ID` | Project/site identifier from the source data. | Observed numeric IDs from `0` to `604`; 104 unique values. | Identifier, not a measurement. |
| `Site_typ` | Site category/type. | `Complex`, `Interchange`, `unit` | Helps separate facility-like sites from interchange/ROW sites. |
| `Unit_Site` | Human-readable site or facility name. | 84 unique values, e.g. `IndotFac - Fort Wayne District Complex`, `InterTy - Diamond` | Main display name in popups and site lists. |
| `dataset` | Editor dataset key. | `all_candidate_sites`, `facility_scored`, `row_scored` | Added by the editor for layer control and export. |
| `layer_title` | Human-readable dataset title. | `All Candidate Sites`, `Scored INDOT Facilities`, `Scored Right-of-Way Parcels` | Added by the editor. |
| `layer_type` | Simplified dataset type. | `candidate`, `facility`, `row` | Added by the editor. |

### Geometry and Coordinate Fields

| Field | Practical meaning | Observed classes or range | Notes |
| --- | --- | --- | --- |
| geometry | Actual site layout polygon or multipolygon from `.shp`. | `Polygon`, `MultiPolygon` | Separate from DBF attributes. Used to draw real layouts at detail zoom. |
| `Shape_Leng` | Source geometry length/perimeter-like value. | `117.061592092` to `12663.7892312` | Raw geometry-derived value from source. Units follow the source CRS/data workflow. |
| `Shape_Le_1` | Additional source geometry length/perimeter-like value. | `132.917894182` to `9593.00680928` | Raw source field. |
| `Shape_Le_2` | Scored-layer geometry length/perimeter-like value. | `228.421853135` to `9593.00680928` | Present in scored facility and ROW layers. |
| `Shape_Area` | Source geometry area-like value. | `871.209074216` to `287509.239802` | Used as a visible decision/support field. Units follow source CRS/data workflow. |
| `Long` | Source longitude field. | All current values are `0.0`. | Preserved from DBF, but not useful in current data. |
| `Lat` | Source latitude field. | All current values are `0.0`. | Preserved from DBF, but not useful in current data. |
| `source_longitude` | Editor copy of source `Long`. | All current values are `0.0`. | Added by the editor when `Long` exists. |
| `source_latitude` | Editor copy of source `Lat`. | All current values are `0.0`. | Added by the editor when `Lat` exists. |
| `center_longitude` | Editor-derived representative longitude for map centering and dots. | `-87.7729453965` to `-84.9889911186` | Derived from geometry after CRS conversion to EPSG:4326. |
| `center_latitude` | Editor-derived representative latitude for map centering and dots. | `37.9732994701` to `41.7549814731` | Derived from geometry after CRS conversion to EPSG:4326. |
| `source_geometry_valid` | Whether the original input geometry was valid before repair. | `true` / `false` | Added by the editor; invalid geometries are repaired for output. |

### Solar, Slope, Transmission, and Flood Fields

| Field | Practical meaning | Observed classes or range | Notes |
| --- | --- | --- | --- |
| `Solar_Mean` | Mean solar potential/solar raster value over the feature. | `1485514.12295` to `1634386.83333` | Higher likely indicates stronger solar resource, but final interpretation should follow the scoring methodology. |
| `SlopeMean` | Mean slope value over the feature. | `0.711145` to `4.96942683629` | Lower slope is usually easier for development. |
| `NTran_FID` | Feature ID of nearest transmission feature. | `3` to `2622` | Identifier of the nearest transmission object, not a distance. |
| `NTran_DIST` | Distance to nearest transmission feature. | `0.0` to `15414.2422779` | Lower distance usually means easier/cheaper grid connection. Units follow the source CRS/data workflow. |
| `NID_CS` | ID of nearest candidate site or related nearest-feature field. | `0` to `38` | Raw source identifier. Confirm final meaning against GIS metadata. |
| `NDist_CS` | Distance to nearest candidate site or related nearest-feature field. | `0.0` to `74903.5890444` | Raw source distance. Confirm final meaning against GIS metadata. |
| `Volt_Class` | Voltage class for nearby transmission infrastructure. | `-99999`, `50`, `150`, `250`, `345`, `735` | `-99999` appears to be a missing/unknown sentinel. Other values are voltage classes. |
| `Flood_Zone` | Flood-zone category. | `0.0`, `A`, `AE`, `X` | Practical interpretation: `A`/`AE` indicate mapped flood hazard zones; `X` usually indicates lower/other flood risk; `0.0` appears to indicate no assigned zone/none in current data. Confirm with FEMA/metadata. |
| `Fld_Area` | Area intersecting flood zone. | `0.0` to `22427.0981594` | Raw flood-derived area field. |
| `Fld_ZoneYr` | Flood recurrence category/year field. | `0`, `100`, `500` | Common interpretation: 100-year or 500-year flood category. |
| `Fld_Perc` | Percent of feature in flood zone. | `0.0` to `40.41` | Higher means more of the feature overlaps flood-zone area. |

### Forest and Land-Cover Fields

The land-cover fields use abbreviated names with a numeric class code at the end. These codes match common NLCD-style land-cover classes. The values are interpreted as percent-like values or normalized coverage shares for the feature polygon. For example, `DevLowI_22 = 30` means roughly 30 percent/share of the feature is developed, low-intensity land cover. The current `land_cover_sum` ranges from about `1.0` to `100.0`, which supports this percentage/share interpretation.

| Field | Code/class | Plain meaning | Observed range | Practical solar-review interpretation |
| --- | --- | --- | ---: | --- |
| `land_area` | Source area field | Land-area measure from the source workflow. | `1800.0` to `325800.0` | Larger areas may support larger solar layouts, but usable area still depends on shape, slope, access, and constraints. |
| `Fore_Area` | Forest area | Area of forested land. | all current values `0.0` | Higher forest area would usually indicate more clearing/environmental concern. |
| `Fore_Per` | Forest percent | Percent/share of the feature that is forested. | all current values `0.0` | Higher forest percent would usually reduce suitability unless clearing is acceptable. |
| `OpenW_11` | 11, Open Water | Ponds, lakes, rivers, or other open-water surfaces. | `0.0` to `10.3896103896` | Usually not buildable for ground-mounted solar. Higher values generally reduce usable land. |
| `DevOpe_21` | 21, Developed Open Space | Lightly developed open areas with vegetation, such as lawns, campuses, road margins, parks, and low-density managed land. | `0.0` to `50.7246376812` | Often easier to evaluate for solar than dense development or wetlands, but ownership/use constraints still matter. |
| `DevLowI_22` | 22, Developed Low Intensity | Low-density developed land with some buildings/roads and substantial open space. | `0.0` to `75.0` | May contain disturbed or accessible land, but conflicts with existing use must be checked. |
| `DDevMed_23` | 23, Developed Medium Intensity | More built-up land with a stronger mix of pavement/buildings and less vegetation. | `0.0` to `92.3076923077` | Higher values may mean more impervious surface or existing infrastructure conflicts. |
| `DDevHig_24` | 24, Developed High Intensity | Highly developed land with dense pavement, buildings, or industrial/commercial surfaces. | `0.0` to `100.0` | Often constrained for new ground-mounted solar unless the site is a facility, lot, rooftop, or already disturbed area. |
| `Barre_31` | 31, Barren Land | Bare soil, gravel, rock, sand, or other low-vegetation surfaces. | `0.0` to `37.9310344828` | May be favorable if stable, accessible, and not otherwise constrained. |
| `DecFor_41` | 41, Deciduous Forest | Forest dominated by trees that lose leaves seasonally. | `0.0` to `40.0` | Higher values usually reduce suitability because clearing and environmental review may be needed. |
| `EverFor_42` | 42, Evergreen Forest | Forest dominated by evergreen/conifer trees. | `0.0` to `0.578034682081` | Same concern as other forest classes; current values are very low. |
| `MixFor_43` | 43, Mixed Forest | Forest with both deciduous and evergreen trees. | `0.0` to `10.2209944751` | Higher values usually reduce suitability because of clearing/environmental concerns. |
| `SShrub_52` | 52, Shrub/Scrub | Shrubland or scrub vegetation. | all current values `0.0` | Could be less constrained than forest, but habitat and maintenance concerns should be checked. |
| `GrasHe_71` | 71, Grassland/Herbaceous | Grass or herbaceous vegetation. | `0.0` to `33.3333333333` | Often easier to convert to solar than forest, wetland, water, or dense development. |
| `PasHay_81` | 81, Pasture/Hay | Pasture or hay fields. | `0.0` to `84.0909090909` | May be physically suitable, but agricultural use and ownership constraints matter. |
| `CultCr_82` | 82, Cultivated Crops | Row crops or other cultivated agricultural land. | `0.0` to `96.5299684543` | May be physically open, but farmland conversion and policy constraints should be reviewed. |
| `welan_90` | 90, Woody Wetlands | Wetlands with woody vegetation. | `0.0` to `13.2947976879` | Usually a major constraint for solar development. Higher values reduce suitability. |
| `EmerW_95` | 95, Emergent Herbaceous Wetlands | Wetlands with herbaceous/non-woody vegetation. | `0.0` to `2.20264317181` | Usually a major constraint even when the percentage is small. |
| `land_cover_sum` | Editor-derived total | Sum of available land-cover fields for the feature. | `0.9999999999989` to `100.00000000011` | Useful as a QA check. Values near 100 suggest complete land-cover composition; values near 1 may indicate normalized/fractional inputs or partial coverage. |

### Score Fields

Score fields exist only in the scored facility and ROW layers. The editor validates `score` fields as values between `0` and `1`.

| Field | Practical meaning | Observed range/classes |
| --- | --- | --- |
| `sol_s` | Solar score. | `0.0` to `1.0` |
| `slp_s` | Slope score. | `0.0` to `0.95811636334` |
| `trn_s` | Transmission/access score. | `0.0491079231` to `1.0` |
| `evp_s` | Evapotranspiration/environment-related score. | `0.0` to `1.0` |
| `dem_s` | Demand or terrain/elevation-related score, depending on final scoring definition. | observed classes: `0.0`, `0.8`, `1.0` |
| `fld_s` | Flood score. | `0.79795` to `1.0` |
| `lc_s` | Land-cover score. | `0.227760252366` to `1.0` |

## Source Code References

- Dataset definitions and field groups: `phase2_editor/editor_backend/config.py`
- Shapefile discovery, import normalization, field configuration, validation, preview, and export: `phase2_editor/editor_backend/service.py`
- Static map rendering of exported GeoJSON: `phase2_editor/map_app/`
