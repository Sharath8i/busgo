import Card from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/format';

export default function AdminKPI({ stats, analytics }) {
  const kpis = [
    { label: 'Platform Revenue', val: formatCurrency(stats?.revenueTotal || analytics?.totalRevenue || 0), color: 'text-primary', icon: '💰' },
    { label: 'Active Sessions', val: stats?.activeUsers || 1204, color: 'text-success', icon: '👥' },
    { label: 'Asset Utilization', val: '84%', color: 'text-tertiary', icon: '🚌' },
    { label: 'System Health', val: 'Optimal', color: 'text-on-surface', icon: '🛡️' }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-slide-up">
      {kpis.map(k => (
        <Card key={k.label} className="group overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{k.label}</p>
              <p className={`text-3xl font-black tracking-tight ${k.color}`}>{k.val}</p>
            </div>
            <span className="text-2xl opacity-20 group-hover:opacity-60 transition-opacity transform group-hover:scale-110 duration-300">
              {k.icon}
            </span>
          </div>
          <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
             <div className={`h-full ${k.color.replace('text-', 'bg-')} w-2/3 opacity-30`} />
          </div>
        </Card>
      ))}
    </div>
  );
}
