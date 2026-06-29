import { Card } from '../../components/Card';
import { team } from '../../config/team';
import { siteContent } from '../../config/siteContent';

export default function AboutPage() {
  return (
    <section className="site-page">
      <header className="site-page__header">
        <span className="site-eyebrow">About</span>
        <h1>SPR 4862 / Indiana Solar Roadmap</h1>
        <p>
          This project presents a static public map for screening solar suitability on transportation land in Indiana,
          building from the Illinois IDOT Solar Decision Support Tool lineage.
        </p>
      </header>

      <Card>
        <h3>S2-HUB Lab</h3>
        <p>
          The Smart and Sustainable Human-Urban-Building Interaction Lab is based in Purdue Polytechnic Institute's
          Bowen School of Construction. The public site supports transparent review of published suitability data.
        </p>
      </Card>

      <div className="team-grid">
        {team.map((member) => (
          <Card key={member.name}>
            <h3>{member.name}</h3>
            <p>
              <strong>{member.role}</strong>
            </p>
            <p>{member.affiliation}</p>
            <p>{member.bio}</p>
            {member.email ? <p>{member.email}</p> : null}
          </Card>
        ))}
      </div>

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

      <Card>
        <h3>Acknowledgements</h3>
        <p>TODO(confirm): add confirmed funding and acknowledgement text.</p>
      </Card>
    </section>
  );
}
