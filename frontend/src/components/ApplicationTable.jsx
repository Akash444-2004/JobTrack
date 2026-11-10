import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Calendar,
  ExternalLink,
  Eye,
  MapPin,
  Pencil,
  Trash2,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import { APPLICATION_STATUS_OPTIONS, JOB_TYPE_MAP, WORK_MODE_MAP } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const ApplicationTable = ({
  applications,
  sortBy,
  sortDir,
  onSort,
  onStatusChange,
  onDeleteRequest,
  updatingId,
}) => {
  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={13} className="ms-1 opacity-50" />;
    return sortDir === 'asc' ? (
      <ArrowUp size={13} className="ms-1 text-primary" />
    ) : (
      <ArrowDown size={13} className="ms-1 text-primary" />
    );
  };

  const SortableHeader = ({ field, label }) => (
    <th>
      <button
        type="button"
        onClick={() => onSort && onSort(field)}
        className="btn btn-link p-0 text-decoration-none text-reset fw-bold d-inline-flex align-items-center"
        style={{ fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}
      >
        {label}
        {renderSortIcon(field)}
      </button>
    </th>
  );

  if (!applications || applications.length === 0) {
    return null;
  }

  return (
    <div className="jt-table-wrap">
      <table className="table jt-table align-middle">
        <thead>
          <tr>
            <SortableHeader field="companyName" label="Company & Role" />
            <th>Type & Mode</th>
            <th>Location</th>
            <th>Salary</th>
            <SortableHeader field="applicationDate" label="Applied Date" />
            <SortableHeader field="status" label="Status" />
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 fw-bold"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      fontSize: '0.9rem',
                    }}
                  >
                    <Building2 size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="d-flex align-items-center gap-2">
                      <Link
                        to={`/applications/${app.id}`}
                        className="fw-semibold text-dark text-decoration-none text-truncate"
                      >
                        {app.jobTitle}
                      </Link>
                      {app.jobUrl && (
                        <a
                          href={app.jobUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted"
                          title="Open job posting"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                    <div className="text-muted small text-truncate">{app.companyName}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="fw-medium text-dark" style={{ fontSize: '0.85rem' }}>
                  {JOB_TYPE_MAP[app.jobType] || app.jobType}
                </div>
                <div className="text-muted" style={{ fontSize: '0.76rem' }}>
                  {WORK_MODE_MAP[app.workMode] || app.workMode}
                </div>
              </td>
              <td>
                {app.location ? (
                  <span className="d-inline-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.86rem' }}>
                    <MapPin size={14} className="flex-shrink-0" />
                    <span className="text-truncate" style={{ maxWidth: '140px' }}>{app.location}</span>
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="tabular-nums text-dark fw-medium" style={{ fontSize: '0.86rem' }}>
                {app.salary || '—'}
              </td>
              <td className="tabular-nums text-muted" style={{ fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                <span className="d-inline-flex align-items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(app.applicationDate)}
                </span>
              </td>
              <td>
                {onStatusChange ? (
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '140px', fontSize: '0.8rem', fontWeight: 600 }}
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => onStatusChange(app.id, e.target.value)}
                    aria-label={`Change status for ${app.companyName}`}
                  >
                    {APPLICATION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={app.status} />
                )}
              </td>
              <td className="text-end">
                <div className="d-inline-flex align-items-center gap-1">
                  <Link
                    to={`/applications/${app.id}`}
                    className="btn btn-sm btn-light border p-2"
                    title="View details"
                    aria-label={`View ${app.companyName} details`}
                  >
                    <Eye size={15} />
                  </Link>
                  <Link
                    to={`/applications/${app.id}/edit`}
                    className="btn btn-sm btn-light border p-2"
                    title="Edit application"
                    aria-label={`Edit ${app.companyName}`}
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-light border text-danger p-2"
                    onClick={() => onDeleteRequest(app)}
                    title="Delete application"
                    aria-label={`Delete ${app.companyName}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
