import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  CalendarClock,
  Clock,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterDropdown from '../components/FilterDropdown';
import InterviewModal from '../components/InterviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import { applicationService } from '../services/applicationService';
import { interviewService } from '../services/interviewService';
import { INTERVIEW_OUTCOME_OPTIONS } from '../utils/constants';
import { extractErrorMessage, formatDate, formatTime } from '../utils/formatters';

const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [interviewList, appPaged] = await Promise.all([
        interviewService.getAllInterviews(outcomeFilter || undefined),
        applicationService.getApplications({ size: 100, sortBy: 'companyName', sortDir: 'asc' }),
      ]);
      setInterviews(interviewList || []);
      setApplications(appPaged?.content || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load interviews.'));
    } finally {
      setLoading(false);
    }
  }, [outcomeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInterviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return interviews;
    return interviews.filter(
      (item) =>
        item.companyName?.toLowerCase().includes(q) ||
        item.jobTitle?.toLowerCase().includes(q) ||
        item.interviewRound?.toLowerCase().includes(q) ||
        item.interviewerName?.toLowerCase().includes(q)
    );
  }, [interviews, searchQuery]);

  const summary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const upcoming = interviews.filter(
      (i) =>
        i.interviewDate >= today &&
        (i.outcome === 'SCHEDULED' || i.outcome === 'RESCHEDULED')
    ).length;
    const passed = interviews.filter((i) => i.outcome === 'PASSED').length;
    return { total: interviews.length, upcoming, passed };
  }, [interviews]);

  const handleSaveInterview = async ({ targetApplicationId, payload }) => {
    setSaving(true);
    setError('');
    try {
      if (editingInterview) {
        await interviewService.updateInterview(editingInterview.id, payload);
      } else {
        await interviewService.createInterview(targetApplicationId, payload);
      }
      setModalOpen(false);
      setEditingInterview(null);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save interview.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await interviewService.deleteInterview(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete interview.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Interviews</h2>
          <p className="text-muted small mb-0">
            Total: <strong className="text-dark tabular-nums">{summary.total}</strong>
            {' · '}
            Upcoming: <strong className="text-primary tabular-nums">{summary.upcoming}</strong>
            {' · '}
            Passed: <strong className="text-success tabular-nums">{summary.passed}</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary d-inline-flex align-items-center gap-2"
          disabled={applications.length === 0}
          onClick={() => {
            setEditingInterview(null);
            setModalOpen(true);
          }}
        >
          <Plus size={17} />
          Schedule Interview
        </button>
      </div>

      {/* Filters */}
      <div className="jt-card p-3 p-md-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-7">
            <label className="form-label small fw-semibold text-muted mb-1">
              Search Interviews
            </label>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by company, role, interview round, or interviewer..."
            />
          </div>
          <div className="col-md-5">
            <FilterDropdown
              id="interviewOutcomeFilter"
              label="Outcome"
              value={outcomeFilter}
              onChange={setOutcomeFilter}
              options={INTERVIEW_OUTCOME_OPTIONS}
              allLabel="All Outcomes"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading interview schedule..." />
      ) : applications.length === 0 ? (
        <div className="jt-card p-5 text-center">
          <CalendarClock size={42} className="text-muted opacity-50 mb-3" />
          <h3 className="h5 fw-bold mb-1">Add a job application first</h3>
          <p className="text-muted small mb-4">
            Interviews are linked to job applications. Create an application to schedule interview rounds.
          </p>
          <Link to="/applications/new" className="btn btn-primary">
            Add Job Application
          </Link>
        </div>
      ) : filteredInterviews.length === 0 ? (
        <div className="jt-card p-5 text-center">
          <CalendarClock size={42} className="text-muted opacity-50 mb-3" />
          <h3 className="h5 fw-bold mb-1">No interviews found</h3>
          <p className="text-muted small mb-4">
            {outcomeFilter || searchQuery
              ? 'Try clearing your filters or search query.'
              : 'Schedule your first interview round to track dates, times, and feedback.'}
          </p>
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={() => {
              setEditingInterview(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} />
            Schedule Interview
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filteredInterviews.map((interview) => (
            <div key={interview.id} className="col-md-6 col-xl-4">
              <div className="jt-card jt-card-hover p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                    <StatusBadge status={interview.outcome} type="interview" />
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border p-1 px-2"
                        onClick={() => {
                          setEditingInterview(interview);
                          setModalOpen(true);
                        }}
                        title="Edit interview"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light border text-danger p-1 px-2"
                        onClick={() => setDeleteTarget(interview)}
                        title="Delete interview"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="h6 fw-bold mb-1">{interview.interviewRound}</h3>
                  <Link
                    to={`/applications/${interview.applicationId}`}
                    className="d-inline-flex align-items-center gap-1 text-primary text-decoration-none small fw-semibold mb-3"
                  >
                    <Building2 size={14} />
                    <span>
                      {interview.companyName} — {interview.jobTitle}
                    </span>
                  </Link>

                  <div className="d-flex flex-column gap-1 text-muted small tabular-nums mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={14} />
                      <span>{formatDate(interview.interviewDate)}</span>
                      <span>·</span>
                      <Clock size={14} />
                      <span>{formatTime(interview.interviewTime)}</span>
                    </div>
                    {interview.interviewerName && (
                      <div className="d-flex align-items-center gap-2">
                        <User size={14} />
                        <span>{interview.interviewerName}</span>
                      </div>
                    )}
                  </div>

                  {interview.interviewNotes && (
                    <p
                      className="text-secondary small bg-light p-2 rounded-3 mb-0"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      {interview.interviewNotes}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-top d-flex justify-content-end">
                  <Link
                    to={`/applications/${interview.applicationId}`}
                    className="small fw-semibold text-decoration-none"
                  >
                    View Application →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <InterviewModal
        isOpen={modalOpen}
        interview={editingInterview}
        applications={applications}
        submitting={saving}
        onSave={handleSaveInterview}
        onClose={() => {
          setModalOpen(false);
          setEditingInterview(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Interview"
        message={
          deleteTarget
            ? `Delete the "${deleteTarget.interviewRound}" interview for ${deleteTarget.companyName}?`
            : ''
        }
        confirmText="Delete Interview"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default InterviewsPage;
