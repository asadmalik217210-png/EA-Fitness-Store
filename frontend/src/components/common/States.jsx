export function Loader() {
  return <div className="empty-state">Loading…</div>;
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid-products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '3/4', marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', text, action }) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}

export function ToastStack({ toasts }) {
  return (
    <div className="toast-wrap" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  );
}
