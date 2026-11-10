import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react';
import ApplicationTable from '../components/ApplicationTable';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterDropdown from '../components/FilterDropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import { applicationService } from '../services/applicationService';
import {
  APPLICATION_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../utils/constants';
import { extractErrorMessage } from '../utils/formatters';

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const hasSearchOrFilter =
        Boolean(debouncedSearch.trim()) ||
        Boolean(statusFilter) ||
        Boolean(jobTypeFilter) ||
        Boolean(workModeFilter);

      const params = {
        keyword: debouncedSearch.trim(),
        status: statusFilter,
        jobType: jobTypeFilter,
        workMode: workModeFilter,
        page,
        size: 10,
        sortBy,
        sortDir,
      };

      const data = hasSearchOrFilter
        ? await applicationService.searchApplications(params)
        : await applicationService.getApplications(params);

      setApplications(data.content || []);
      setPagination({
        page: data.page ?? 0,
        size: data.size ?? 10,
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 0,
        first: Boolean(data.first),
        last: Boolean(data.last),
      });
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load applications.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, jobTypeFilter, workModeFilter, page, sortBy, sortDir]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    setPage(0);
  };

  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'applicationDate' ? 'desc' : 'asc');
    }
    setPage(0);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const updated = await applicationService.updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((item) => (item.id === applicationId ? { ...item, status: updated.status } : item))
      );
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update status.'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await applicationService.deleteApplication(deleteTarget.id);
      setDeleteTarget(null);
      fetchApplications();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to delete application.'));
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearchInput('');
    setStatusFilter('');
    setJobTypeFilter('');
    setWorkModeFilter('');
    setSortBy('applicationDate');
    setSortDir('desc');
    setPage(0);
  };

  const hasFilters = Boolean(searchInput || statusFilter || jobTypeFilter || workModeFilter);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">All Applications</h2>
          <p className="text-muted small mb-0">
            Showing <strong className="text-dark tabular-nums">{pagination.totalElements}</strong> tracked{' '}
            {pagination.totalElements === 1 ? 'application' : 'applications'}
          </p>
        </div>
        <Link to="/applications/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
          <Plus size={17} />
          Add Application
        </Link>
      </div>

      {/* Search & Filters Card */}
      <div className="jt-card p-3 p-md-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-lg-4">
            <label className="form-label small fw-semibold text-muted mb-1">Search</label>
            <SearchBar value={searchInput} onChange={handleSearchChange} />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <FilterDropdown
              id="filterStatus"
              label="Status"
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              options={APPLICATION_STATUS_OPTIONS}
              allLabel="All Statuses"
            />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <FilterDropdown
              id="filterJobType"
              label="Job Type"
              value={jobTypeFilter}
              onChange={handleFilterChange(setJobTypeFilter)}
              options={JOB_TYPE_OPTIONS}
              allLabel="All Types"
            />
          </div>

          <div className="col-6 col-md-4 col-lg-2">
            <FilterDropdown
              id="filterWorkMode"
              label="Work Mode"
              value={workModeFilter}
              onChange={handleFilterChange(setWorkModeFilter)}
              options={WORK_MODE_OPTIONS}
              allLabel="All Modes"
            />
          </div>

          <div className="col-6 col-lg-2 d-flex gap-2">
            <button
              type="button"
              className="btn btn-light border w-100 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={resetFilters}
              disabled={!hasFilters && sortBy === 'applicationDate' && sortDir === 'desc'}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="jt-card overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching your job applications..." />
        ) : applications.length === 0 ? (
          <div className="text-center py-5 px-3">
            <Briefcase size={42} className="text-muted opacity-50 mb-3" />
            <h3 className="h5 fw-bold mb-1">
              {hasFilters ? 'No matching applications found' : 'No job applications yet'}
            </h3>
            <p className="text-muted small mb-4">
              {hasFilters
                ? 'Try clearing or adjusting your search terms and filters.'
                : 'Start building your pipeline by logging your first application.'}
            </p>
            {hasFilters ? (
              <button type="button" className="btn btn-light border" onClick={resetFilters}>
                Clear All Filters
              </button>
            ) : (
              <Link to="/applications/new" className="btn btn-primary d-inline-flex align-items-center gap-2">
                <Plus size={16} />
                Add First Application
              </Link>
            )}
          </div>
        ) : (
          <>
            <ApplicationTable
              applications={applications}
              sortBy={sortBy}
              sortDir={sortDir}
              onSort={handleSort}
              onStatusChange={handleStatusChange}
              onDeleteRequest={setDeleteTarget}
              updatingId={updatingId}
            />

            {pagination.totalPages > 1 && (
              <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 px-4 py-3 border-top bg-light">
                <span className="text-muted small tabular-nums">
                  Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total)
                </span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-white border bg-white d-inline-flex align-items-center gap-1"
                    disabled={pagination.first}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft size={15} />
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-white border bg-white d-inline-flex align-items-center gap-1"
                    disabled={pagination.last}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Application"
        message={
          deleteTarget
            ? `Are you sure you want to delete your ${deleteTarget.jobTitle} application at ${deleteTarget.companyName}? All associated status history and interviews will also be removed.`
            : ''
        }
        confirmText="Delete Application"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ApplicationsPage;
