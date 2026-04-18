/**
 * LoadingSpinner — full page or inline loading indicator.
 *
 * Usage:
 *   <LoadingSpinner />              — fullscreen centered
 *   <LoadingSpinner size="sm" fullPage={false} />  — inline
 */
export default function LoadingSpinner({ size = 'lg', fullPage = true, text }) {
  const sizeMap = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-full border-brand-dim border-t-brand-mid animate-spin ${sizeMap[size]}`}
      />
      {text && <p className="text-sm text-on-variant">{text}</p>}
    </div>
  );

  if (!fullPage) return spinner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
      {spinner}
    </div>
  );
}
