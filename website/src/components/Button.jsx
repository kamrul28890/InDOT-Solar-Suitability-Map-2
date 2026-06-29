import { Link } from 'react-router-dom';

export function Button({ children, className = '', to, variant = 'primary', ...props }) {
  const classes = `ui-button ui-button--${variant} ${className}`.trim();

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={props.type || 'button'} {...props}>
      {children}
    </button>
  );
}
