export function Card({ as: Component = 'article', children, className = '', padded = true, ...props }) {
  const classes = `ui-card ${padded ? 'ui-card--padded' : ''} ${className}`.trim();
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
