import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ApplicationForm from '../components/ApplicationForm';
import { applicationService } from '../services/applicationService';
import { extractErrorMessage } from '../utils/formatters';

const AddApplicationPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      const created = await applicationService.createApplication(payload);
      navigate(`/applications/${created.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save application.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div>
        <Link
          to="/applications"
          className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 mb-3"
        >
          <ArrowLeft size={15} />
          Back to Applications
        </Link>
        <h2 className="h4 fw-bold mb-1">Add New Job Application</h2>
        <p className="text-muted small mb-0">
          Record the role details, compensation, recruiter contact, and current status.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      <div className="jt-card p-4">
        <ApplicationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/applications')}
          submitting={submitting}
          submitLabel="Create Application"
        />
      </div>
    </div>
  );
};

export default AddApplicationPage;
