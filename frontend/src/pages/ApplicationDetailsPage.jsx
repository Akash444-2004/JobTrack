import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  History,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import InterviewModal from '../components/InterviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationService } from '../services/applicationService';
import { interviewService } from '../services/interviewService';
import { APPLICATION_STATUS_OPTIONS, JOB_TYPE_MAP, WORK_MODE_MAP } from '../utils/constants';
import { extractErrorMessage, formatDate, formatDateTime, formatTime } from '../utils/formatters';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [showDeleteAppDialog, setShowDeleteAppDialog] = useState(false);
  const [deletingApp, setDeletingApp] = useState(false);

  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [savingInterview, setSavingInterview] = useState(false);

  const [deleteInterviewTarget, setDeleteInterviewTarget] = useState(null);
  const [deletingInterview, setDeletingInterview] = useState(false);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await applicationService.getApplicationById(id);
      setApplication(data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Application not found or unavailable.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleQuickStatusChange = async (newStatus) => {
    if (!application || newStatus === application.status) return;
    setStatusUpdating(true);
    setError('');
    try {
      const updated = await applicationService.updateApplicationStatus(application.id, newStatus);
      setApplication(updated);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to update application status.'));
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteApplication = async () => {
    setDeletingApp(true);
    try {
      await applicationService.deleteApplication(application.id);
      navigate('/applications', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete application.'));
      setDeletingApp(false);
    }
  };

  const handleSaveInterview = async ({ targetApplicationId, payload }) => {
    setSavingInterview(true);
    setError('');
    try {
      if (editingInterview) {
        await interviewService.updateInterview(editingInterview.id, payload);
      } else {
        await interviewService.createInterview(targetApplicationId, payload);
      }
      setInterviewModalOpen(false);
      setEditingInterview(null);
      await loadDetails();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save interview.'));
    } finally {
      setSavingInterview(false);
    }
  };

  const handleDeleteInterview = async () => {
    if (!deleteInterviewTarget) return;
    setDeletingInterview(true);
    try {
      await interviewService.deleteInterview(deleteInterviewTarget.id);
      setDeleteInterviewTarget(null);
      await loadDetails();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete interview.'));
    } finally {
      setDeletingInterview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application record..." />;
  }

  if (!application) {
    return (
      <div className="jt-card p-5 text-center">
        <h2 className="h5 fw-bold mb-2">Application Not Found</h2>
        <p className="text-muted small mb-4">{error || 'This application may have been deleted.'}</p>
        <Link to="/applications" className="btn btn-primary">
          Return to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <Link
          to="/applications"
          className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1"
        >
          <ArrowLeft size={15} />
          Back to Applications
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      {/* Header Card */}
      <div className="jt-card p-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: '54px', height: '54px', backgroundColor: '#eef2ff', color: '#4f46e5' }}
            >
              <Building2 size={26} />
            </div>
            <div>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h2 className="h4 fw-bold mb-0">{application.jobTitle}</h2>
                <StatusBadge status={application.status} />
              </div>
              <div className="text-muted fw-medium d-flex flex-wrap align-items-center gap-3 small">
                <span>{application.companyName}</span>
                {application.location && (
                  <span className="d-inline-flex align-items-center gap-1">
                    <MapPin size={14} />
                    {application.location}
                  </span>
                )}
                <span className="d-inline-flex align-items-center gap-1 tabular-nums">
                  <Calendar size={14} />
                  Applied {formatDate(application.applicationDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: '155px', fontWeight: 600 }}
              value={application.status}
              disabled={statusUpdating}
              onChange={(e) => handleQuickStatusChange(e.target.value)}
              aria-label="Update application status"
            >
              {APPLICATION_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1"
              >
                <ExternalLink size={15} />
                Job Link
              </a>
            )}

            <Link
              to={`/applications/${application.id}/edit`}
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
            >
              <Pencil size={15} />
              Edit
            </Link>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
              onClick={() => setShowDeleteAppDialog(true)}
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="row g-3 mt-3 pt-3 border-top">
          <div className="col-6 col-md-3">
            <div className="text-muted small mb-1">Job Type</div>
            <div className="fw-semibold d-flex align-items-center gap-1">
              <Briefcase size={15} className="text-primary" />
              {JOB_TYPE_MAP[application.jobType] || application.jobType}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-muted small mb-1">Work Mode</div>
            <div className="fw-semibold">{WORK_MODE_MAP[application.workMode] || application.workMode}</div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-muted small mb-1">Compensation / Salary</div>
            <div className="fw-semibold tabular-nums d-flex align-items-center gap-1">
              <DollarSign size={15} className="text-success" />
              {application.salary || 'Not specified'}
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-muted small mb-1">Recruiter Contact</div>
            <div className="fw-semibold small">
              {application.recruiterName ? (
                <div className="d-flex align-items-center gap-1">
                  <User size={14} className="text-muted" />
                  <span>{application.recruiterName}</span>
                </div>
              ) : (
                <span className="text-muted fw-normal">—</span>
              )}
              {application.recruiterEmail && (
                <a
                  href={`mailto:${application.recruiterEmail}`}
                  className="text-decoration-none d-inline-flex align-items-center gap-1 text-primary mt-1"
                >
                  <Mail size={13} />
                  {application.recruiterEmail}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        <div className="col-lg-7 d-flex flex-column gap-4">
          {/* Job Description & Notes */}
          <div className="jt-card p-4">
            <h3 className="h6 fw-bold mb-3">Job Description</h3>
            {application.jobDescription ? (
              <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                {application.jobDescription}
              </p>
            ) : (
              <p className="text-muted small mb-0">No job description saved for this application.</p>
            )}

            <hr className="my-4" />

            <h3 className="h6 fw-bold mb-3">Personal Notes & Follow-ups</h3>
            {application.notes ? (
              <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                {application.notes}
              </p>
            ) : (
              <p className="text-muted small mb-0">No personal notes recorded yet.</p>
            )}
          </div>

          {/* Interviews Section */}
          <div className="jt-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-bold mb-0">Interview Rounds</h3>
                <p className="text-muted small mb-0">
                  Schedule rounds, update outcomes, and capture feedback
                </p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setEditingInterview(null);
                  setInterviewModalOpen(true);
                }}
              >
                <Plus size={15} />
                Schedule Interview
              </button>
            </div>

            {!application.interviews || application.interviews.length === 0 ? (
              <div className="text-center py-4 border rounded-3 bg-light">
                <p className="text-muted small mb-2">No interviews scheduled for this application yet.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-light border"
                  onClick={() => {
                    setEditingInterview(null);
                    setInterviewModalOpen(true);
                  }}
                >
                  Add First Interview Round
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {application.interviews.map((interview) => (
                  <div key={interview.id} className="p-3 rounded-3 border bg-white">
                    <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                      <div>
                        <div className="fw-bold d-flex align-items-center gap-2">
                          <span>{interview.interviewRound}</span>
                          <StatusBadge status={interview.outcome} type="interview" />
                        </div>
                        <div className="text-muted small mt-1 d-flex flex-wrap gap-3 tabular-nums">
                          <span className="d-inline-flex align-items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(interview.interviewDate)}
                          </span>
                          <span className="d-inline-flex align-items-center gap-1">
                            <Clock size={14} />
                            {formatTime(interview.interviewTime)}
                          </span>
                          {interview.interviewerName && (
                            <span className="d-inline-flex align-items-center gap-1">
                              <User size={14} />
                              {interview.interviewerName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border p-1 px-2"
                          onClick={() => {
                            setEditingInterview(interview);
                            setInterviewModalOpen(true);
                          }}
                          title="Edit interview"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border text-danger p-1 px-2"
                          onClick={() => setDeleteInterviewTarget(interview)}
                          title="Delete interview"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {interview.interviewNotes && (
                      <div
                        className="mt-2 pt-2 border-top text-secondary small"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {interview.interviewNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status History Column */}
        <div className="col-lg-5">
          <div className="jt-card p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <History size={18} className="text-primary" />
              <div>
                <h3 className="h6 fw-bold mb-0">Application Status History</h3>
                <p className="text-muted small mb-0">Automatic audit trail of stage changes</p>
              </div>
            </div>

            {!application.statusHistory || application.statusHistory.length === 0 ? (
              <p className="text-muted small mb-0">No status transitions recorded.</p>
            ) : (
              <div className="jt-timeline mt-3">
                {application.statusHistory.map((item) => (
                  <div key={item.id} className="jt-timeline-item">
                    <span className="jt-timeline-dot" />
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      {item.previousStatus ? (
                        <>
                          <StatusBadge status={item.previousStatus} />
                          <span className="text-muted small">→</span>
                          <StatusBadge status={item.newStatus} />
                        </>
                      ) : (
                        <>
                          <span className="small fw-semibold text-dark">Created as</span>
                          <StatusBadge status={item.newStatus} />
                        </>
                      )}
                    </div>
                    <div className="text-muted small tabular-nums">
                      {formatDateTime(item.changedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-4" />

            <div className="small text-muted d-flex flex-column gap-1 tabular-nums">
              <div>Created: {formatDateTime(application.createdAt)}</div>
              <div>Last updated: {formatDateTime(application.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>

      <InterviewModal
        isOpen={interviewModalOpen}
        interview={editingInterview}
        fixedApplicationId={application.id}
        submitting={savingInterview}
        onSave={handleSaveInterview}
        onClose={() => {
          setInterviewModalOpen(false);
          setEditingInterview(null);
        }}
      />

      <ConfirmDialog
        isOpen={showDeleteAppDialog}
        title="Delete Application"
        message={`Delete your ${application.jobTitle} application at ${application.companyName}? This will permanently remove the application, status history, and all scheduled interviews.`}
        confirmText="Delete Application"
        loading={deletingApp}
        onConfirm={handleDeleteApplication}
        onCancel={() => setShowDeleteAppDialog(false)}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteInterviewTarget)}
        title="Delete Interview"
        message={
          deleteInterviewTarget
            ? `Remove the "${deleteInterviewTarget.interviewRound}" interview scheduled on ${formatDate(
                deleteInterviewTarget.interviewDate
              )}?`
            : ''
        }
        confirmText="Delete Interview"
        loading={deletingInterview}
        onConfirm={handleDeleteInterview}
        onCancel={() => setDeleteInterviewTarget(null)}
      />
    </div>
  );
};

export default ApplicationDetailsPage;
