import { useEffect, useState } from 'react';
import {
  APPLICATION_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../utils/constants';
import { getTodayISODate } from '../utils/formatters';

const DEFAULT_VALUES = {
  companyName: '',
  jobTitle: '',
  jobDescription: '',
  location: '',
  jobType: 'FULL_TIME',
  workMode: 'HYBRID',
  salary: '',
  applicationDate: getTodayISODate(),
  status: 'APPLIED',
  jobUrl: '',
  recruiterName: '',
  recruiterEmail: '',
  notes: '',
};

const ApplicationForm = ({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Save Application',
}) => {
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        companyName: initialValues.companyName || '',
        jobTitle: initialValues.jobTitle || '',
        jobDescription: initialValues.jobDescription || '',
        location: initialValues.location || '',
        jobType: initialValues.jobType || 'FULL_TIME',
        workMode: initialValues.workMode || 'HYBRID',
        salary: initialValues.salary || '',
        applicationDate: initialValues.applicationDate || getTodayISODate(),
        status: initialValues.status || 'APPLIED',
        jobUrl: initialValues.jobUrl || '',
        recruiterName: initialValues.recruiterName || '',
        recruiterEmail: initialValues.recruiterEmail || '',
        notes: initialValues.notes || '',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.companyName.trim()) {
      nextErrors.companyName = 'Company name is required';
    }
    if (!formData.jobTitle.trim()) {
      nextErrors.jobTitle = 'Job title is required';
    }
    if (!formData.applicationDate) {
      nextErrors.applicationDate = 'Application date is required';
    }
    if (formData.jobUrl.trim() && !/^https?:\/\/.+/i.test(formData.jobUrl.trim())) {
      nextErrors.jobUrl = 'Job URL must start with http:// or https://';
    }
    if (
      formData.recruiterEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recruiterEmail.trim())
    ) {
      nextErrors.recruiterEmail = 'Please enter a valid recruiter email';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      companyName: formData.companyName.trim(),
      jobTitle: formData.jobTitle.trim(),
      jobDescription: formData.jobDescription.trim() || null,
      location: formData.location.trim() || null,
      jobType: formData.jobType,
      workMode: formData.workMode,
      salary: formData.salary.trim() || null,
      applicationDate: formData.applicationDate,
      status: formData.status,
      jobUrl: formData.jobUrl.trim() || null,
      recruiterName: formData.recruiterName.trim() || null,
      recruiterEmail: formData.recruiterEmail.trim() || null,
      notes: formData.notes.trim() || null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        <div className="col-md-6">
          <label htmlFor="companyName" className="form-label fw-semibold small">
            Company Name <span className="text-danger">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g., Stripe, Google, Atlassian"
          />
          {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="jobTitle" className="form-label fw-semibold small">
            Job Title <span className="text-danger">*</span>
          </label>
          <input
            id="jobTitle"
            name="jobTitle"
            type="text"
            className={`form-control ${errors.jobTitle ? 'is-invalid' : ''}`}
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g., Senior Java Full-Stack Developer"
          />
          {errors.jobTitle && <div className="invalid-feedback">{errors.jobTitle}</div>}
        </div>

        <div className="col-md-4">
          <label htmlFor="status" className="form-label fw-semibold small">
            Application Status <span className="text-danger">*</span>
          </label>
          <select
            id="status"
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
          >
            {APPLICATION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="jobType" className="form-label fw-semibold small">
            Job Type <span className="text-danger">*</span>
          </label>
          <select
            id="jobType"
            name="jobType"
            className="form-select"
            value={formData.jobType}
            onChange={handleChange}
          >
            {JOB_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="workMode" className="form-label fw-semibold small">
            Work Mode <span className="text-danger">*</span>
          </label>
          <select
            id="workMode"
            name="workMode"
            className="form-select"
            value={formData.workMode}
            onChange={handleChange}
          >
            {WORK_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="applicationDate" className="form-label fw-semibold small">
            Application Date <span className="text-danger">*</span>
          </label>
          <input
            id="applicationDate"
            name="applicationDate"
            type="date"
            className={`form-control ${errors.applicationDate ? 'is-invalid' : ''}`}
            value={formData.applicationDate}
            onChange={handleChange}
          />
          {errors.applicationDate && (
            <div className="invalid-feedback">{errors.applicationDate}</div>
          )}
        </div>

        <div className="col-md-4">
          <label htmlFor="location" className="form-label fw-semibold small">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="form-control"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Bengaluru / Remote"
          />
        </div>

        <div className="col-md-4">
          <label htmlFor="salary" className="form-label fw-semibold small">
            Compensation / Salary
          </label>
          <input
            id="salary"
            name="salary"
            type="text"
            className="form-control"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g., $130,000 - $155,000 or 24 LPA"
          />
        </div>

        <div className="col-md-6">
          <label htmlFor="jobUrl" className="form-label fw-semibold small">
            Job Posting URL
          </label>
          <input
            id="jobUrl"
            name="jobUrl"
            type="url"
            className={`form-control ${errors.jobUrl ? 'is-invalid' : ''}`}
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://careers.company.com/jobs/..."
          />
          {errors.jobUrl && <div className="invalid-feedback">{errors.jobUrl}</div>}
        </div>

        <div className="col-md-3">
          <label htmlFor="recruiterName" className="form-label fw-semibold small">
            Recruiter Name
          </label>
          <input
            id="recruiterName"
            name="recruiterName"
            type="text"
            className="form-control"
            value={formData.recruiterName}
            onChange={handleChange}
            placeholder="e.g., Sarah Jenkins"
          />
        </div>

        <div className="col-md-3">
          <label htmlFor="recruiterEmail" className="form-label fw-semibold small">
            Recruiter Email
          </label>
          <input
            id="recruiterEmail"
            name="recruiterEmail"
            type="email"
            className={`form-control ${errors.recruiterEmail ? 'is-invalid' : ''}`}
            value={formData.recruiterEmail}
            onChange={handleChange}
            placeholder="recruiter@company.com"
          />
          {errors.recruiterEmail && <div className="invalid-feedback">{errors.recruiterEmail}</div>}
        </div>

        <div className="col-12">
          <label htmlFor="jobDescription" className="form-label fw-semibold small">
            Job Description / Key Requirements
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows={4}
            className="form-control"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="Paste role responsibilities, required tech stack (Java, Spring Boot, React, PostgreSQL), etc."
          />
        </div>

        <div className="col-12">
          <label htmlFor="notes" className="form-label fw-semibold small">
            Personal Notes & Follow-ups
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="form-control"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Referral contact, resume version submitted, follow-up reminders..."
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button
          type="button"
          className="btn btn-light border px-4"
          onClick={onCancel}
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
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
