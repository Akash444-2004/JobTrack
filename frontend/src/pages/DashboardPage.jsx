import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  Clock,
  Plus,
  TrendingUp,
} from 'lucide-react';
import DashboardCards from '../components/DashboardCards';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import { STATUS_MAP } from '../utils/constants';
import { extractErrorMessage, formatDate, formatTime } from '../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState({ recentApplications: [], upcomingInterviews: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsData, recentData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecent(),
        ]);
        if (active) {
          setStats(statsData);
          setRecent(recentData);
        }
      } catch (err) {
        if (active) {
          setError(extractErrorMessage(err, 'Failed to load dashboard analytics.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard analytics..." />;
  }

  const distributionData = (stats?.statusDistribution || []).filter((d) => d.count > 0);
  const monthlyData = stats?.monthlyActivity || [];

  return (
    <div className="d-flex flex-column gap-4">
      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      {/* Welcome Header Banner */}
      <div className="jt-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h2 className="h4 fw-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.92rem' }}>
            Pipeline response rate:{' '}
            <strong className="text-dark tabular-nums">{stats?.responseRate ?? 0}%</strong>
            {' · '}
            Upcoming interviews:{' '}
            <strong className="text-primary tabular-nums">{stats?.upcomingInterviewsCount ?? 0}</strong>
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/applications" className="btn btn-light border px-3">
            View Pipeline
          </Link>
          <Link to="/applications/new" className="btn btn-primary d-inline-flex align-items-center gap-2 px-3">
            <Plus size={16} />
            Add Application
          </Link>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <DashboardCards stats={stats} />

      {/* Charts Row */}
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="jt-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-bold mb-0">Application Status Distribution</h3>
                <p className="text-muted small mb-0">Breakdown across hiring stages</p>
              </div>
              <TrendingUp size={18} className="text-primary" />
            </div>

            {distributionData.length === 0 ? (
              <div
                className="d-flex flex-column align-items-center justify-content-center text-muted text-center"
                style={{ height: '290px' }}
              >
                <Briefcase size={34} className="mb-2 opacity-50" />
                <p className="mb-1 fw-medium">No applications logged yet</p>
                <p className="small mb-0">Add your first job application to visualize stage breakdown.</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: '290px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="46%"
                      innerRadius={62}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {distributionData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_MAP[entry.status]?.color || '#64748b'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          <div className="jt-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-bold mb-0">Monthly Application Activity</h3>
                <p className="text-muted small mb-0">Applications submitted over the last 6 months</p>
              </div>
              <span className="badge bg-light text-dark border">Last 6 Months</span>
            </div>

            <div style={{ width: '100%', height: '290px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(79, 70, 229, 0.06)' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 20px rgba(15,23,42,0.08)',
                    }}
                  />
                  <Bar dataKey="count" name="Applications" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications & Upcoming Interviews */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="jt-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-bold mb-0">Recent Applications</h3>
                <p className="text-muted small mb-0">Your 5 most recently submitted roles</p>
              </div>
              <Link to="/applications" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1">
                <span>View all</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recent.recentApplications?.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p className="mb-2">You haven&apos;t added any applications yet.</p>
                <Link to="/applications/new" className="btn btn-sm btn-primary">
                  Add Your First Application
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recent.recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/applications/${app.id}`}
                    className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 border text-decoration-none text-dark bg-white"
                    style={{ transition: 'background-color 0.15s ease' }}
                  >
                    <div className="min-w-0">
                      <div className="fw-semibold text-truncate">{app.jobTitle}</div>
                      <div className="text-muted small text-truncate">
                        {app.companyName}
                        {app.location ? ` · ${app.location}` : ''}
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-3 flex-shrink-0">
                      <span className="text-muted small d-none d-sm-inline tabular-nums">
                        {formatDate(app.applicationDate)}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="jt-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <h3 className="h6 fw-bold mb-0">Upcoming Interviews</h3>
                <p className="text-muted small mb-0">Scheduled and rescheduled rounds</p>
              </div>
              <Link to="/interviews" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1">
                <span>Manage</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recent.upcomingInterviews?.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <CalendarClock size={32} className="mb-2 opacity-50" />
                <p className="mb-2 small">No upcoming interviews scheduled.</p>
                <Link to="/interviews" className="btn btn-sm btn-light border">
                  Go to Interviews
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recent.upcomingInterviews.map((interview) => (
                  <Link
                    key={interview.id}
                    to={`/applications/${interview.applicationId}`}
                    className="p-3 rounded-3 border text-decoration-none text-dark bg-white d-block"
                  >
                    <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
                      <div className="fw-semibold">{interview.interviewRound}</div>
                      <StatusBadge status={interview.outcome} type="interview" />
                    </div>
                    <div className="text-muted small mb-2">
                      {interview.companyName} — {interview.jobTitle}
                    </div>
                    <div className="d-flex align-items-center gap-3 text-muted small tabular-nums">
                      <span className="d-inline-flex align-items-center gap-1">
                        <CalendarClock size={14} />
                        {formatDate(interview.interviewDate)}
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <Clock size={14} />
                        {formatTime(interview.interviewTime)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
