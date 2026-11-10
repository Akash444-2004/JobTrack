import {
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Send,
  XCircle,
} from 'lucide-react';

const DashboardCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Applications',
      value: stats?.totalApplications ?? 0,
      icon: Briefcase,
      iconBg: '#eef2ff',
      iconColor: '#4f46e5',
      accent: 'All active & closed',
    },
    {
      title: 'Applied',
      value: stats?.applied ?? 0,
      icon: Send,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      accent: 'Awaiting response',
    },
    {
      title: 'Assessments',
      value: stats?.assessments ?? 0,
      icon: ClipboardList,
      iconBg: '#f5f3ff',
      iconColor: '#7c3aed',
      accent: 'Coding & online tests',
    },
    {
      title: 'Interviews',
      value: stats?.interviews ?? 0,
      icon: CalendarCheck,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      accent: 'In interview stages',
    },
    {
      title: 'Selected',
      value: stats?.selected ?? 0,
      icon: CheckCircle2,
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      accent: 'Offers received',
    },
    {
      title: 'Rejected',
      value: stats?.rejected ?? 0,
      icon: XCircle,
      iconBg: '#fef2f2',
      iconColor: '#dc2626',
      accent: 'Closed applications',
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="col-6 col-md-4 col-xl-2">
            <div className="jt-kpi-card d-flex flex-column justify-content-between">
              <div className="d-flex align-items-start justify-content-between gap-2 mb-3">
                <span className="text-muted fw-semibold" style={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                  {card.title}
                </span>
                <span
                  className="jt-kpi-icon"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  <Icon size={19} />
                </span>
              </div>
              <div>
                <div className="fs-3 fw-bold tabular-nums text-dark lh-1 mb-1">
                  {card.value}
                </div>
                <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                  {card.accent}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
