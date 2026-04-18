import Card from '../../../components/common/Card';
import { formatCurrency } from '../../../utils/format';

export default function OperatorStats({ stats }) {
  const items = [
    { label: 'Gross Revenue', val: formatCurrency(stats?.totalRevenue || 0), color: 'text-primary', icon: '💰' },
    { label: 'Active Buses', val: stats?.activeBuses || 0, color: 'text-on-surface', icon: '🚌' },
    { label: 'Today Tickets', val: stats?.bookingsToday || 0, color: 'text-success', icon: '🎫' },
    { label: 'Fleet Size', val: stats?.fleetSize || 0, color: 'text-on-surface', icon: '📊' }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12 animate-slide-up">
      {items.map(k => (
        <Card key={k.label} className="relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">{k.label}</p>
              <p className={`text-3xl font-black tracking-tight ${k.color}`}>{k.val}</p>
            </div>
            <span className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">{k.icon}</span>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
             <div className="h-full bg-primary/40 w-1/3 animate-pulse"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
