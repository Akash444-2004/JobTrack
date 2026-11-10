const FilterDropdown = ({
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  id,
}) => {
  return (
    <div className="w-100">
      {label && (
        <label htmlFor={id} className="form-label small fw-semibold text-muted mb-1">
          {label}
        </label>
      )}
      <select
        id={id}
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{allLabel}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterDropdown;
