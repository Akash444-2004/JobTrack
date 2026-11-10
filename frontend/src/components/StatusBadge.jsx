import { OUTCOME_MAP, STATUS_MAP } from '../utils/constants';

const StatusBadge = ({ status, type = 'application' }) => {
  const map = type === 'interview' ? OUTCOME_MAP : STATUS_MAP;
  const config = map[status] || {
    label: status || 'Unknown',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    text: '#475569',
    color: '#64748b',
  };

  return (
    <span
      className="jt-status-badge"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
    >
      <span
        className="jt-status-dot"
        style={{ backgroundColor: config.color || config.text }}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
