import Button from './Button';

/**
 * Reusable empty state for lists/search results
 */
export default function EmptyState({ 
  icon = '🎫', 
  title = 'No Data Found', 
  message = 'Try adjusting your search or filters to find what you are looking for.', 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="card text-center py-16 bg-white animate-slide-up">
      <div className="h-20 w-20 bg-surface-container rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 grayscale opacity-60">
        {icon}
      </div>
      <h3 className="text-xl font-black uppercase tracking-tighter text-on-surface">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant max-w-sm mx-auto font-medium">
        {message}
      </p>
      {actionLabel && (
        <Button onClick={onAction} className="mt-8" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
