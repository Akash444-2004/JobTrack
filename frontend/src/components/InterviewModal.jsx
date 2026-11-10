import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { INTERVIEW_OUTCOME_OPTIONS } from '../utils/constants';
import { getTodayISODate } from '../utils/formatters';

const InterviewModal = ({
  isOpen,
  interview,
  applications = [],
  fixedApplicationId = null,
  submitting = false,
  onSave,
  onClose,
}) => {
  const [applicationId, setApplicationId] = useState('');
  const [interviewRound, setInterviewRound] = useState('');
  const [interviewDate, setInterviewDate] = useState(getTodayISODate());
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewerName, setInterviewerName] = useState('');
  const [outcome, setOutcome] = useState('SCHEDULED');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (interview) {
      setApplicationId(String(interview.applicationId || fixedApplicationId || ''));
      setInterviewRound(interview.interviewRound || '');
      setInterviewDate(interview.interviewDate || getTodayISODate());
      setInterviewTime((interview.interviewTime || '10:00').slice(0, 5));
      setInterviewerName(interview.interviewerName || '');
      setOutcome(interview.outcome || 'SCHEDULED');
      setInterviewNotes(interview.interviewNotes || '');
    } else {
      setApplicationId(
        fixedApplicationId
          ? String(fixedApplicationId)
          : applications[0]?.id
          ? String(applications[0].id)
          : ''
      );
      setInterviewRound('');
      setInterviewDate(getTodayISODate());
      setInterviewTime('10:00');
      setInterviewerName('');
      setOutcome('SCHEDULED');
      setInterviewNotes('');
    }
  }, [isOpen, interview, fixedApplicationId, applications]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fixedApplicationId && !interview && !applicationId) {
      setError('Please select a job application for this interview.');
      return;
    }
    if (!interviewRound.trim()) {
      setError('Interview round is required.');
      return;
    }
    if (!interviewDate || !interviewTime) {
      setError('Interview date and time are required.');
      return;
    }

    onSave({
      targetApplicationId: fixedApplicationId || Number(applicationId),
      payload: {
        interviewRound: interviewRound.trim(),
        interviewDate,
        interviewTime: interviewTime.length === 5 ? `${interviewTime}:00` : interviewTime,
        interviewerName: interviewerName.trim() || null,
        outcome,
        interviewNotes: interviewNotes.trim() || null,
      },
    });
  };

  return (
    <div className="jt-modal-backdrop" role="dialog" aria-modal="true">
      <div className="jt-modal-dialog p-4">
        <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
          <h5 className="mb-0 fw-bold">
            {interview ? 'Edit Interview' : 'Schedule Interview'}
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 p-1"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!fixedApplicationId && !interview && (
            <div className="mb-3">
              <label htmlFor="modalAppId" className="form-label small fw-semibold">
                Job Application <span className="text-danger">*</span>
              </label>
              <select
                id="modalAppId"
                className="form-select"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                required
              >
                <option value="">Select an application...</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.companyName} — {app.jobTitle}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="interviewRound" className="form-label small fw-semibold">
              Interview Round <span className="text-danger">*</span>
            </label>
            <input
              id="interviewRound"
              type="text"
              className="form-control"
              value={interviewRound}
              onChange={(e) => setInterviewRound(e.target.value)}
              placeholder="e.g., Technical Round 1, System Design, HR Screening"
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label htmlFor="interviewDate" className="form-label small fw-semibold">
                Date <span className="text-danger">*</span>
              </label>
              <input
                id="interviewDate"
                type="date"
                className="form-control"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                required
              />
            </div>
            <div className="col-sm-6">
              <label htmlFor="interviewTime" className="form-label small fw-semibold">
                Time <span className="text-danger">*</span>
              </label>
              <input
                id="interviewTime"
                type="time"
                className="form-control"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-sm-6">
              <label htmlFor="interviewerName" className="form-label small fw-semibold">
                Interviewer Name
              </label>
              <input
                id="interviewerName"
                type="text"
                className="form-control"
                value={interviewerName}
                onChange={(e) => setInterviewerName(e.target.value)}
                placeholder="e.g., Priya Nair (Staff Eng)"
              />
            </div>
            <div className="col-sm-6">
              <label htmlFor="outcome" className="form-label small fw-semibold">
                Outcome / Status
              </label>
              <select
                id="outcome"
                className="form-select"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
              >
                {INTERVIEW_OUTCOME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="interviewNotes" className="form-label small fw-semibold">
              Preparation & Interview Notes
            </label>
            <textarea
              id="interviewNotes"
              rows={3}
              className="form-control"
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Meeting link, topics covered, questions asked, or feedback..."
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light border px-3"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Saving...
                </>
              ) : interview ? (
                'Update Interview'
              ) : (
                'Schedule Interview'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewModal;
