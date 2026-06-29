export const API_BASE = import.meta.env.VITE_API_BASE || '';

export const layerColors = {
  all_candidate_sites: '#59636f',
  facility_scored: '#0f8b8d',
  row_scored: '#b45309',
};

export const scoreFields = [
  ['sol_s', 'Solar score'],
  ['slp_s', 'Slope score'],
  ['trn_s', 'Access score'],
  ['evp_s', 'Evapotranspiration score'],
  ['dem_s', 'Terrain / elevation score'],
  ['fld_s', 'Flood score'],
  ['lc_s', 'Land-cover score'],
];

export const basemapLayers = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  },
  {
    id: 'esri-street',
    name: 'Esri World Street Map',
    attribution:
      'Tiles &copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri, TomTom, Garmin, Foursquare, METI/NASA',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  },
  {
    id: 'esri-imagery',
    name: 'Esri World Imagery',
    attribution:
      'Tiles &copy; Esri, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
  {
    id: 'esri-topo',
    name: 'Esri World Topo Map',
    attribution:
      'Tiles &copy; Esri, TomTom, Garmin, FAO, NOAA, USGS, Intermap, METI/NASA, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  },
  {
    id: 'carto-light',
    name: 'Carto Light',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  },
  {
    id: 'carto-dark',
    name: 'Carto Dark',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },
  {
    id: 'esri-hybrid',
    name: 'Esri Imagery + Labels',
    attribution:
      'Tiles &copy; Esri, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl:
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    overlayAttribution:
      'Labels &copy; Esri, HERE, Garmin, FAO, NOAA, USGS, EPA, NPS, Esri, METI, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, and the GIS User Community',
  },
];

export const BASEMAP_STORAGE_KEY = 'indot-solar-basemap-id';
export const DETAIL_ZOOM = 14;
export const INITIAL_CENTER = [39.9, -86.2];
export const INITIAL_ZOOM = 7;
export const MIN_ZOOM = 6;
