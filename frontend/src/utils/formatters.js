export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '—';
  const parsed = new Date(dateTimeStr);
  if (Number.isNaN(parsed.getTime())) return dateTimeStr;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [hoursStr, minutesStr] = timeStr.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return timeStr;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const extractErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback;
  const data = error.response?.data;
  if (data?.validationErrors && typeof data.validationErrors === 'object') {
    const firstErr = Object.values(data.validationErrors)[0];
    if (firstErr) return firstErr;
  }
  if (data?.message) return data.message;
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Make sure the backend is running on port 8080.';
  }
  return error.message || fallback;
};

export const getTodayISODate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split('T')[0];
};
