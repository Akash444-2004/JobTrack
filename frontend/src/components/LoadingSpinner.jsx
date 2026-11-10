const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: '100vh', backgroundColor: 'var(--jt-bg)' }}
      >
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fw-medium mb-0">{message}</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-2" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <span className="text-muted small fw-medium">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
