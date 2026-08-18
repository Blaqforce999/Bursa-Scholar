export function Spinner() {
  return (
    <div className="flex items-center justify-center py-64" role="status" aria-label="Loading">
      <div className="h-32 w-32 animate-spin rounded-full border-2 border-border border-t-ink-indigo" />
    </div>
  );
}
