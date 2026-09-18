interface EmptyStateProps {
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-hairline bg-surface/60 px-6 py-16 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 rounded-btn bg-ink px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-ink/85"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
