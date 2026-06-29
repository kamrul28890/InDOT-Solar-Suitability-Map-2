export function Tooltip({ children, id, open = false }) {
  if (!open) {
    return null;
  }

  return (
    <div className="ui-tooltip" id={id} role="tooltip">
      {children}
    </div>
  );
}
