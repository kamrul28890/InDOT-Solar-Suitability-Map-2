import { BarChart } from '../../components/charts/BarChart';
import { ChartFrame } from '../../components/charts/ChartFrame';
import { Donut } from '../../components/charts/Donut';
import { HBars } from '../../components/charts/HBars';
import { Heatmap } from '../../components/charts/Heatmap';
import { Scatter } from '../../components/charts/Scatter';
import { StackedBars } from '../../components/charts/StackedBars';
import { SectionHeader } from '../../components/SectionHeader';
import { StatTile } from '../../components/StatTile';
import { CRITERIA } from '../../config/criteria';
import { useAppData } from '../../utils/useAppData';
import {
  avgScoreByCriterion,
  criterionScatter,
  districtCriterionMatrix,
  landCoverComposition,
  projectKpis,
  sitesByDistrict,
  sitesByLayer,
  sitesByType,
} from '../../utils/stats';
import { buildShareLink } from '../../utils/shareLinks';

export default function InsightsPage() {
  const { layers, loading, error } = useAppData();
  const kpis = projectKpis(layers);
  const districtData = sitesByDistrict(layers);
  const averages = avgScoreByCriterion(layers, CRITERIA);
  const matrix = districtCriterionMatrix(layers, CRITERIA);
  const scatter = criterionScatter(layers, 'slp_s', 'sol_s');
  const landCover = landCoverComposition(layers);
  const layerComposition = sitesByLayer(layers).map((row) => ({ label: row.layer.replace(/_/g, ' '), value: row.count }));
  const typeComposition = sitesByType(layers).map((row) => ({ label: row.type, value: row.count }));

  return (
    <section className="site-page insights-page">
      <header className="site-page__header">
        <span className="site-eyebrow">Project insights</span>
        <h1>The suitability data, visualized</h1>
        <p>Every chart recalculates from the published map data. Hover or focus a mark for exact values.</p>
        <span className="insights-chip">Auto-updates from the published map data</span>
      </header>

      {loading ? <div className="ui-card ui-card--padded">Loading published map data...</div> : null}
      {error ? <div className="ui-card ui-card--padded error-message">Data load error: {error}</div> : null}

      <div className="insights-kpis">
        <StatTile label="Total sites" value={kpis.totalSites} />
        <StatTile label="INDOT districts covered" value={kpis.districts} />
        <StatTile label="Site types" value={kpis.siteTypes} />
        <StatTile label="Total candidate land area" value={Math.round(kpis.totalAcres).toLocaleString()} suffix=" ac" />
      </div>

      <SectionHeader
        eyebrow="Visual lab"
        title="Read the screening as patterns"
        description="The views below keep the seven suitability criteria independent. There is no composite or overall score."
      />

      <div className="chart-grid">
        <ChartFrame
          eyebrow="Inventory"
          title="Sites by INDOT district"
          description="Which districts have the most candidate sites?"
        >
          <BarChart
            ariaLabel="Sites by INDOT district"
            data={districtData.map((row) => ({ label: row.district, value: row.count }))}
            onBarClick={(row) => {
              window.location.hash = buildShareLink({ district: row.label });
            }}
          />
        </ChartFrame>

        <ChartFrame
          eyebrow="Criteria"
          title="Average suitability by criterion"
          description="Which criteria tend to favor these sites?"
        >
          <HBars
            ariaLabel="Average suitability by criterion"
            data={averages}
            onBarClick={(row) => {
              window.location.hash = buildShareLink({ color: row.key });
            }}
          />
        </ChartFrame>

        <ChartFrame
          eyebrow="Geography"
          title="District x criterion heatmap"
          description="Where are the strong and weak criteria geographically?"
        >
          <Heatmap matrix={matrix} />
        </ChartFrame>

        <ChartFrame
          eyebrow="Relationships"
          title="Slope vs. solar"
          description="A bubble view of two key criteria, sized by site area."
        >
          <Scatter ariaLabel="Slope score compared with solar score" data={scatter} />
        </ChartFrame>

        <ChartFrame
          eyebrow="Ground cover"
          title="Land-cover composition"
          description="Mean NLCD grouped percentages by layer."
        >
          <StackedBars data={landCover} />
        </ChartFrame>

        <ChartFrame
          eyebrow="Composition"
          title="Sites by category and type"
          description="Inventory split by published layer and site type."
        >
          <div className="dual-donuts">
            <Donut data={layerComposition} />
            <Donut data={typeComposition} />
          </div>
        </ChartFrame>
      </div>
    </section>
  );
}
