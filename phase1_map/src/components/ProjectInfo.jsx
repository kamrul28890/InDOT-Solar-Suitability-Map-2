import { ExternalLink, Mail } from 'lucide-react';

import { sidebarContent } from '../config/sidebarContent';

export function ProjectInfo() {
  const { projectInfo } = sidebarContent;

  return (
    <section className="project-info" aria-labelledby="project-info-title">
      <div className="project-logo-panel">
        <img src={projectInfo.logo.src} alt={projectInfo.logo.alt} />
      </div>
      <div className="project-info-copy">
        <h2 id="project-info-title">{projectInfo.title}</h2>
        <p>{projectInfo.summary}</p>
        <dl className="stakeholder-list" aria-label="Project stakeholders">
          {projectInfo.stakeholders.map((stakeholder) => (
            <div key={stakeholder.label}>
              <dt>{stakeholder.label}</dt>
              <dd>{stakeholder.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="project-links" aria-label="Project links">
        {projectInfo.links.map((link) => (
          <a href={link.href} key={link.href} rel="noreferrer" target={link.href.startsWith('http') ? '_blank' : undefined}>
            {link.href.startsWith('mailto:') ? <Mail size={15} aria-hidden="true" /> : <ExternalLink size={15} aria-hidden="true" />}
            {link.label}
          </a>
        ))}
      </div>
      <p className="contact-line">
        <strong>{projectInfo.contactLabel}:</strong>{' '}
        <a href={`mailto:${projectInfo.contactEmail}`}>{projectInfo.contactEmail}</a>
      </p>
    </section>
  );
}
