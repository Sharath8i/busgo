/**
 * Full page loading state with premium animation
 */
export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center py-20 text-center animate-slide-up">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl border-4 border-primary/20 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 bg-primary rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-primary">{message}</p>
    </div>
  );
}
