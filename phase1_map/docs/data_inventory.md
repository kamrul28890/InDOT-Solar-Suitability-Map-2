# Data Inventory

This report is generated from the local shapefiles used by the SPR 4862 implementation.

## all_candidate_sites

- Source: `All_Candidate_Sites\All_Candidate_Sites_Final.shp`
- Records: 104
- CRS: `EPSG:26916`
- Geometry types: MultiPolygon, Polygon
- Bounds: [432184.44159999955, 4202987.6556, 675943.4705999997, 4624284.779200001]

### Fields

| Field | Type | Non-null | Example |
|-------|------|----------|---------|
| `Shape_Leng` | `float64` | 104 | 1557.45922868; 1437.79231874; 4063.76271237 |
| `Long` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `Lat` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `layer` | `object` | 104 | CRAWFORDSVILLE; CRAWFORDSVILLE; GREENFIELD |
| `SPR_ID` | `int64` | 104 | 0; 1; 7 |
| `NID_CS` | `int64` | 104 | 20; 20; 19 |
| `NDist_CS` | `float64` | 104 | 26623.3123752; 26951.7789915; 32463.8580053 |
| `Volt_Class` | `object` | 104 | 250; 250; 50 |
| `Flood_Zone` | `object` | 104 | 0; A; 0 |
| `Fld_Area` | `float64` | 104 | 0.0; 45.7498458427; 0.0 |
| `Fld_ZoneYr` | `float64` | 104 | 0.0; 100.0; 0.0 |
| `SlopeMean` | `float64` | 104 | 1.88297215083; 3.00299265634; 3.33683477308 |
| `Fld_Perc` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `Fore_Area` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `Fore_Per` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `land_area` | `int64` | 104 | 92700; 66600; 208800 |
| `DevOpe_21` | `float64` | 104 | 1.94174757282; 1.35135135135; 3.01724137931 |
| `DevLowI_22` | `float64` | 104 | 24.2718446602; 18.9189189189; 5.60344827586 |
| `DDevMed_23` | `float64` | 104 | 15.5339805825; 22.972972973; 11.6379310345 |
| `DDevHig_24` | `float64` | 104 | 2.91262135922; 4.05405405405; 3.01724137931 |
| `DecFor_41` | `float64` | 104 | 11.6504854369; 2.7027027027; 9.91379310345 |
| `GrasHe_71` | `float64` | 104 | 23.3009708738; 13.5135135135; 4.31034482759 |
| `OpenW_11` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `EverFor_42` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `MixFor_43` | `float64` | 104 | 0.0; 1.35135135135; 0.0 |
| `SShrub_52` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `PasHay_81` | `float64` | 104 | 0.0; 6.75675675676; 7.3275862069 |
| `CultCr_82` | `float64` | 104 | 20.3883495146; 28.3783783784; 55.1724137931 |
| `welan_90` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `EmerW_95` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `Barre_31` | `float64` | 104 | 0.0; 0.0; 0.0 |
| `Site_typ` | `object` | 104 | Interchange; Interchange; Interchange |
| `Unit_Site` | `object` | 104 | IndotFac - Lebanon Rest Area SB; IndotFac - Lebanon Rest Area NB; IndotFac - Centerville Welcome Center WB |
| `Solar_Mean` | `float64` | 104 | 1611339.44458; 1595872.13699; 1631960.28807 |
| `NTran_FID` | `int64` | 104 | 1647; 1647; 1846 |
| `NTran_DIST` | `float64` | 104 | 477.566226458; 916.784402067; 129.191523246 |
| `Shape_Le_1` | `float64` | 104 | 1538.02571141; 1427.56579887; 3982.32109961 |
| `Shape_Area` | `float64` | 104 | 95540.6683112; 65415.3592456; 199080.029256 |

## facility_scored

- Source: `Facility_Scored\solar_potential_scored_indotfacility.shp`
- Records: 58
- CRS: `EPSG:26916`
- Geometry types: MultiPolygon, Polygon
- Bounds: [432184.44159999955, 4202987.6556, 674455.5338000003, 4613028.8331]

### Fields

| Field | Type | Non-null | Example |
|-------|------|----------|---------|
| `Shape_Leng` | `float64` | 58 | 975.647127267; 619.772687147; 733.957276084 |
| `Long` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `Lat` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `layer` | `object` | 58 | CRAWFORDSVILLE; CRAWFORDSVILLE; CRAWFORDSVILLE |
| `SPR_ID` | `float64` | 58 | 399.0; 400.0; 401.0 |
| `NID_CS` | `float64` | 58 | 0.0; 17.0; 0.0 |
| `NDist_CS` | `float64` | 58 | 19032.2823574; 19589.4225201; 28247.6718678 |
| `Volt_Class` | `object` | 58 | 50; 50; 250 |
| `Flood_Zone` | `object` | 58 | AE; 0; 0 |
| `Fld_Area` | `float64` | 58 | 1378.01707256; 0.0; 0.0 |
| `Fld_ZoneYr` | `float64` | 58 | 100.0; 0.0; 0.0 |
| `SlopeMean` | `float64` | 58 | 3.911521979; 3.49513651316; 1.49155692905 |
| `Fld_Perc` | `float64` | 58 | 3.42; 0.0; 0.0 |
| `Fore_Area` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `Fore_Per` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `land_area` | `float64` | 58 | 37800.0; 18900.0; 31500.0 |
| `DevOpe_21` | `float64` | 58 | 0.238095238095; 0.0952380952381; 0.0857142857143 |
| `DevLowI_22` | `float64` | 58 | 0.119047619048; 0.190476190476; 0.0857142857143 |
| `DDevMed_23` | `float64` | 58 | 0.380952380952; 0.285714285714; 0.257142857143 |
| `DDevHig_24` | `float64` | 58 | 0.142857142857; 0.190476190476; 0.257142857143 |
| `DecFor_41` | `float64` | 58 | 0.0; 0.0952380952381; 0.0 |
| `GrasHe_71` | `float64` | 58 | 0.119047619048; 0.0; 0.0 |
| `OpenW_11` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `EverFor_42` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `MixFor_43` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `SShrub_52` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `PasHay_81` | `float64` | 58 | 0.0; 0.142857142857; 0.257142857143 |
| `CultCr_82` | `float64` | 58 | 0.0; 0.0; 0.0571428571429 |
| `welan_90` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `EmerW_95` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `Barre_31` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `Site_typ` | `object` | 58 | unit; unit; unit |
| `Unit_Site` | `object` | 58 | IndotFac - Lebanon Maintenance unit; IndotFac - Ashboro Unit; IndotFac - Lebanon Unit |
| `Solar_Mean` | `float64` | 58 | 1582082.2337; 1586084.94231; 1605951.225 |
| `NTran_FID` | `float64` | 58 | 962.0; 617.0; 1595.0 |
| `NTran_DIST` | `float64` | 58 | 4020.92730146; 4050.79689227; 3862.26389603 |
| `Shape_Le_1` | `float64` | 58 | 967.418577989; 618.261829051; 733.957276084 |
| `sol_s` | `float64` | 58 | 0.648662273317; 0.675549058678; 0.808993815875 |
| `slp_s` | `float64` | 58 | 0.248434673411; 0.34621717862; 0.816730794472 |
| `trn_s` | `float64` | 58 | 0.165259928427; 0.164241484376; 0.17088872056 |
| `evp_s` | `float64` | 58 | 0.0; 0.0; 0.0 |
| `dem_s` | `float64` | 58 | 0.8; 0.8; 0.8 |
| `fld_s` | `float64` | 58 | 0.9658; 1.0; 1.0 |
| `lc_s` | `float64` | 58 | 1.0; 0.923809523809; 0.954285714286 |
| `Shape_Le_2` | `float64` | 58 | 967.418577989; 618.261829051; 733.957276084 |
| `Shape_Area` | `float64` | 58 | 40025.5347385; 21720.528777; 32125.471131 |

## row_scored

- Source: `ROW_Scored\solar_potential_scored_interchange.shp`
- Records: 45
- CRS: `EPSG:26916`
- Geometry types: MultiPolygon, Polygon
- Bounds: [447250.1908999998, 4203279.0691, 675943.4705999997, 4624284.779200001]

### Fields

| Field | Type | Non-null | Example |
|-------|------|----------|---------|
| `Shape_Leng` | `float64` | 45 | 1557.45922868; 1437.79231874; 4063.76271237 |
| `Long` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `Lat` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `layer` | `object` | 45 | CRAWFORDSVILLE; CRAWFORDSVILLE; GREENFIELD |
| `SPR_ID` | `float64` | 45 | 0.0; 1.0; 7.0 |
| `NID_CS` | `float64` | 45 | 20.0; 20.0; 19.0 |
| `NDist_CS` | `float64` | 45 | 26623.3123752; 26951.7789915; 32463.8580053 |
| `Volt_Class` | `object` | 45 | 250; 250; 50 |
| `Flood_Zone` | `object` | 45 | 0; A; 0 |
| `Fld_Area` | `float64` | 45 | 0.0; 45.7498458427; 0.0 |
| `Fld_ZoneYr` | `float64` | 45 | 0.0; 100.0; 0.0 |
| `SlopeMean` | `float64` | 45 | 1.88297215083; 3.00299265634; 3.33683477308 |
| `Fld_Perc` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `Fore_Area` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `Fore_Per` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `land_area` | `float64` | 45 | 92700.0; 66600.0; 208800.0 |
| `DevOpe_21` | `float64` | 45 | 0.0194174757282; 0.0135135135135; 0.0301724137931 |
| `DevLowI_22` | `float64` | 45 | 0.242718446602; 0.189189189189; 0.0560344827586 |
| `DDevMed_23` | `float64` | 45 | 0.155339805825; 0.22972972973; 0.116379310345 |
| `DDevHig_24` | `float64` | 45 | 0.0291262135922; 0.0405405405405; 0.0301724137931 |
| `DecFor_41` | `float64` | 45 | 0.116504854369; 0.027027027027; 0.0991379310345 |
| `GrasHe_71` | `float64` | 45 | 0.233009708738; 0.135135135135; 0.0431034482759 |
| `OpenW_11` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `EverFor_42` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `MixFor_43` | `float64` | 45 | 0.0; 0.0135135135135; 0.0 |
| `SShrub_52` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `PasHay_81` | `float64` | 45 | 0.0; 0.0675675675676; 0.073275862069 |
| `CultCr_82` | `float64` | 45 | 0.203883495146; 0.283783783784; 0.551724137931 |
| `welan_90` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `EmerW_95` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `Barre_31` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `Site_typ` | `object` | 45 | Interchange; Interchange; Interchange |
| `Unit_Site` | `object` | 45 | IndotFac - Lebanon Rest Area SB; IndotFac - Lebanon Rest Area NB; IndotFac - Centerville Welcome Center WB |
| `Solar_Mean` | `float64` | 45 | 1611339.44458; 1595872.13699; 1631960.28807 |
| `NTran_FID` | `float64` | 45 | 1647.0; 1647.0; 1846.0 |
| `NTran_DIST` | `float64` | 45 | 477.566226458; 916.784402067; 129.191523246 |
| `Shape_Le_1` | `float64` | 45 | 1538.02571141; 1427.56579887; 3982.32109961 |
| `sol_s` | `float64` | 45 | 0.845187283209; 0.741291091956; 0.983700536829 |
| `slp_s` | `float64` | 45 | 0.724812213968; 0.461790519169; 0.383392205114 |
| `trn_s` | `float64` | 45 | 0.625032467902; 0.464757206223; 0.860370547611 |
| `evp_s` | `float64` | 45 | 0.352726291043; 0.349931814014; 0.308867954785 |
| `dem_s` | `float64` | 45 | 0.0; 0.0; 0.0 |
| `fld_s` | `float64` | 45 | 1.0; 1.0; 1.0 |
| `lc_s` | `float64` | 45 | 0.743689320388; 0.740540540541; 0.479310344828 |
| `Shape_Le_2` | `float64` | 45 | 1538.02571141; 1427.56579887; 3982.32109961 |
| `Shape_Area` | `float64` | 45 | 95540.6683112; 65415.3592456; 199080.029256 |
