import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-surface-border">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-7 w-7 bg-primary rounded shadow-sm text-white flex items-center justify-center font-black">B</div>
              <span className="text-xl font-black text-primary tracking-tighter">BusGo</span>
            </Link>
            <p className="mt-4 text-xs font-medium text-text-muted leading-relaxed uppercase tracking-widest">
              A commitment to excellence in every mile. Your premium transit partner.
            </p>
          </div>

          {/* Links */}
          {['Discover', 'Support'].map((title, i) => (
             <div key={title}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-5">{title}</h4>
                <ul className="space-y-3">
                   { (i === 0 ? ['About Us', 'Routes', 'Offers', 'Press'] : ['Help Desk', 'Privacy', 'Legal', 'Contact']).map(l => (
                     <li key={l}>
                        <a href="#" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">{l}</a>
                     </li>
                   ))}
                </ul>
             </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-5">Newsletter</h4>
            <div className="flex flex-col gap-3">
               <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="input-field !py-2 !text-[10px] font-black uppercase tracking-widest"
               />
               <button className="btn-primary !py-2.5 !text-[10px] uppercase font-black tracking-widest">Join Registry</button>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-surface-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">© 2026 BusGo Technologies. Engineered for Reliability.</p>
          <div className="flex gap-6">
             {['Twitter', 'Instagram', 'LinkedIn'].map(s => <a key={s} href="#" className="text-[10px] font-black text-text-muted hover:text-primary uppercase tracking-widest transition-colors">{s}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
