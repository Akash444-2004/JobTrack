import { Search, X } from 'lucide-react';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search by company, role, location, or recruiter...',
}) => {
  return (
    <div className="position-relative w-100">
      <Search
        size={17}
        className="position-absolute top-50 translate-middle-y text-muted"
        style={{ left: '14px', pointerEvents: 'none' }}
      />
      <input
        type="text"
        className="form-control"
        style={{ paddingLeft: '2.5rem', paddingRight: value ? '2.4rem' : '0.85rem' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="btn btn-sm position-absolute top-50 translate-middle-y border-0 text-muted p-1"
          style={{ right: '8px' }}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
