import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ApplicationForm from '../components/ApplicationForm';
import LoadingSpinner from '../components/LoadingSpinner';
import { applicationService } from '../services/applicationService';
import { extractErrorMessage } from '../utils/formatters';

const EditApplicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadApplication = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await applicationService.getApplicationById(id);
        if (active) setApplication(data);
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Failed to load application.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadApplication();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setError('');
    try {
      await applicationService.updateApplication(id, payload);
      navigate(`/applications/${id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update application.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application details..." />;
  }

  return (
    <div className="d-flex flex-column gap-3" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div>
        <Link
          to={`/applications/${id}`}
          className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 mb-3"
        >
          <ArrowLeft size={15} />
          Back to Details
        </Link>
        <h2 className="h4 fw-bold mb-1">Edit Job Application</h2>
        {application && (
          <p className="text-muted small mb-0">
            Updating <strong>{application.jobTitle}</strong> at <strong>{application.companyName}</strong>
          </p>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      {application && (
        <div className="jt-card p-4">
          <ApplicationForm
            initialValues={application}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/applications/${id}`)}
            submitting={submitting}
            submitLabel="Save Changes"
          />
        </div>
      )}
    </div>
  );
};

export default EditApplicationPage;
