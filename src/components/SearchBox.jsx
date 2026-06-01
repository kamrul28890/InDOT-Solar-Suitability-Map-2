import { Search } from 'lucide-react';

export function SearchBox({ query, onQueryChange }) {
  return (
    <section className="control-group">
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, ID, district, type, score, or field"
        />
      </label>
    </section>
  );
}
