import { Button } from './Button';

/**
 * Centered error message UI
 */
export default function ErrorMessage({ 
  message = 'Something went wrong while fetching data.', 
  onRetry 
}) {
  return (
    <div className="card border-error/20 bg-error/5 text-center py-12 animate-slide-up">
      <div className="h-14 w-14 bg-error text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg shadow-error/20">
        ⚠️
      </div>
      <h3 className="text-lg font-black uppercase tracking-tighter text-error">System Error</h3>
      <p className="mt-2 text-xs font-bold text-error/80 uppercase tracking-widest max-w-sm mx-auto">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-8 !bg-error hover:!bg-error/90" variant="primary">
          Try Again 🔄
        </Button>
      )}
    </div>
  );
}
