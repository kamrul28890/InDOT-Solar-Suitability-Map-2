import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/SectionHeader';
import { StatTile } from '../../components/StatTile';
import { BarChart } from '../../components/charts/BarChart';
import { CRITERIA } from '../../config/criteria';
import { siteContent } from '../../config/siteContent';
import { projectKpis, sitesByDistrict } from '../../utils/stats';
import { useAppData } from '../../utils/useAppData';

export default function HomePage() {
  const { layers } = useAppData();
  const kpis = projectKpis(layers);
  const districtData = sitesByDistrict(layers).slice(0, 8).map((row) => ({ label: row.district, value: row.count }));

  return (
    <section className="site-page home-page">
      <header className="home-hero">
        <div className="site-page__header">
          <span className="site-eyebrow">{siteContent.brand.subtitle}</span>
          <h1>{siteContent.hero.headline}</h1>
          <p>{siteContent.hero.subhead}</p>
          <div>
            <Button to="/map">Explore the Map</Button>{' '}
            <Button to="/criteria" variant="secondary">
              How it works
            </Button>
          </div>
        </div>
      </header>

      <div className="insights-kpis">
        <StatTile label="Total No. of Sites" value={kpis.totalSites} />
        <StatTile label="Layers" value={Object.keys(layers).length} />
        <StatTile label="Criteria" value={CRITERIA.length} />
        <StatTile label="INDOT districts" value={kpis.districts} />
      </div>

      <SectionHeader
        eyebrow="Use case"
        title="Transparent screening for transportation land"
        description="The site brings map exploration, criteria definitions, data downloads, and a maintainer map builder into one static GitHub Pages application."
      />
      <div className="value-grid">
        {[
          ['Screen ROW & facility land', 'Review right-of-way parcels and INDOT-owned facilities in one browser-based map.'],
          ['Explore criteria independently', 'Filter and color by the criterion that matters to the current planning question.'],
          ['Use a reproducible method', 'Published GeoJSON and manifest files drive the map, statistics, and downloads.'],
        ].map(([title, description]) => (
          <Card key={title}>
            <h3>{title}</h3>
            <p>{description}</p>
          </Card>
        ))}
      </div>

      <SectionHeader
        eyebrow="Scoring"
        title="Seven 0-1 suitability sub-scores"
        description="The tool does not combine criteria into an overall score. Users inspect solar, slope, transmission, evapotranspiration, elevation, flood, and land-cover scores separately."
      />
      <div className="criteria-chip-grid">
        {CRITERIA.map((criterion) => (
          <Button key={criterion.key} to={`/map?color=${criterion.key}`} variant="secondary">
            {criterion.label}
          </Button>
        ))}
      </div>

      <Card className="home-chart">
        <SectionHeader eyebrow="Insights" title="Sites by INDOT district" description="The full Insights page expands this into six live charts." />
        <BarChart ariaLabel="Sites by district preview" data={districtData} />
        <Button to="/insights" variant="secondary">
          See all insights
        </Button>
      </Card>

      <div className="partner-band">
        <a href={siteContent.brand.links.purdue} rel="noreferrer" target="_blank">
          <img src={siteContent.brand.purdueLogo} alt="Purdue University" />
        </a>
        <a className="partner-band__text" href={siteContent.brand.links.s2hub} rel="noreferrer" target="_blank">
          S2-HUB Lab
        </a>
        <a href={siteContent.brand.links.indot} rel="noreferrer" target="_blank">
          <img src={siteContent.brand.indotLogo} alt="Indiana Department of Transportation seal" />
        </a>
      </div>
    </section>
  );
}
