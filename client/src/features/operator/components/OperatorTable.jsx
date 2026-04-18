import Card from '../../../components/common/Card';
import Input from '../../../components/common/Input';
import Loading from '../../../components/common/Loading';

export default function OperatorTable({ 
  title, 
  subtitle, 
  headers, 
  data, 
  renderRow, 
  onSearch, 
  searchPlaceholder = "Search records...",
  loading = false,
  emptyMessage = "No records found.",
  actions
}) {
  return (
    <Card className="p-0 overflow-hidden flex flex-col min-h-[400px]">
      <div className="px-10 py-8 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tighter">{title}</h2>
          {subtitle && <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {onSearch && (
            <div className="w-full sm:w-64">
              <Input 
                placeholder={searchPlaceholder} 
                onChange={(e) => onSearch(e.target.value)} 
                className="!gap-0"
              />
            </div>
          )}
          {actions}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <Loading message={`Syncing ${title}...`} />
        ) : (
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className={`px-10 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant ${h.align === 'right' ? 'text-right' : ''}`}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {data.map((item, index) => renderRow(item, index))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="px-10 py-20 text-center text-on-surface-variant font-medium italic">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
