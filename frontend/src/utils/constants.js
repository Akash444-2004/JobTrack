export const APPLICATION_STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'Applied', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  { value: 'ASSESSMENT', label: 'Assessment', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  { value: 'INTERVIEW', label: 'Interview', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  { value: 'SELECTED', label: 'Selected', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
  { value: 'REJECTED', label: 'Rejected', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
];

export const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'FREELANCE', label: 'Freelance' },
];

export const WORK_MODE_OPTIONS = [
  { value: 'ONSITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
];

export const INTERVIEW_OUTCOME_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  { value: 'RESCHEDULED', label: 'Rescheduled', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  { value: 'PENDING_FEEDBACK', label: 'Pending Feedback', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  { value: 'PASSED', label: 'Passed', bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
  { value: 'FAILED', label: 'Failed', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  { value: 'CANCELLED', label: 'Cancelled', bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' },
];

export const STATUS_MAP = Object.fromEntries(
  APPLICATION_STATUS_OPTIONS.map((item) => [item.value, item])
);

export const JOB_TYPE_MAP = Object.fromEntries(
  JOB_TYPE_OPTIONS.map((item) => [item.value, item.label])
);

export const WORK_MODE_MAP = Object.fromEntries(
  WORK_MODE_OPTIONS.map((item) => [item.value, item.label])
);

export const OUTCOME_MAP = Object.fromEntries(
  INTERVIEW_OUTCOME_OPTIONS.map((item) => [item.value, item])
);
