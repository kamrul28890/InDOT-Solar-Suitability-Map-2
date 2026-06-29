export function SectionHeader({ eyebrow, title, description, className = '' }) {
  return (
    <div className={`section-header ${className}`.trim()}>
      {eyebrow ? <span className="site-eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
